import produce from 'immer'
import { useCallback, useEffect, useReducer } from 'react'
import { findPath } from 'utils/astarPathSearch'
import { ALL_TILES_POS, BallState, BALL_BOUNCE_SPEED, findConsecutiveBalls, createBall, DIMENSION, getCanvasPosition, getStartingBalls, TILES_PER_SIDE, getBallSize, cancelAnimationFromPreviousSession } from 'utils/lines98'
import { getAllEmptyTilePositions, getMultipleRandomEmptyTiles, TilePosition } from 'utils/tile'

const ACTION_TYPE_SELECT_BALL = 'select-ball'
const ACTION_TYPE_BOUNCE_BALL = 'bounce-ball'
const ACTION_TYPE_SELECT_DESTINATION = 'select-destination'
const ACTION_TYPE_MOVE_BALL = 'move-ball'
const ACTION_TYPE_UPDATE_SCORE = 'update-score'
const ACTION_TYPE_ADD_BALLS = 'add-balls'
const ACTION_TYPE_GROW_BALLS = 'grow-balls'
const ACTION_TYPE_SHRINK_BALLS = 'shrink-balls'
const ACTION_TYPE_RESTART = 'restart'
const ACTION_TYPE_UNDO = 'undo'

type CurrentStage = 'selected' | 'moving' | 'update-score' | 'add-balls' | 'new-cycle'

export interface GameState {
  balls: BallState[]
  gameOver: boolean
  currentStage: CurrentStage
  score: number
  isAnimating: boolean // if ball is shrinking, growing or moving => wait till animation finishes before user can do the next step
  prevBalls: BallState[]
  bestScore: number
}

export const DEFAULT_GAME_STATE: GameState = {
  balls: [],
  gameOver: false,
  currentStage: 'new-cycle',
  score: 0,
  isAnimating: false,
  prevBalls: [],
  bestScore: 0,
}

function reduce(state: GameState, action: { payload?: { position?: TilePosition }; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_SELECT_BALL: {
      if (!payload?.position || state.currentStage == 'moving' || state.isAnimating) return state

      const { r, c } = payload.position

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          // deselect previously selected ball if any
          if (draft[i].isSelected) {
            draft[i].canvasPosition.x = draft[i].canvasPosition.originalX
            draft[i].canvasPosition.y = draft[i].canvasPosition.originalY
            draft[i].isSelected = false
          }

          if (draft[i].position.c == c && draft[i].position.r == r) {
            draft[i].isSelected = true
          }
        }
      })

      return {
        ...state,
        balls,
        currentStage: 'selected',
      }
    }

    case ACTION_TYPE_BOUNCE_BALL: {
      if (state.currentStage !== 'selected') return state

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isSelected) {
            const { canvasPosition, movingDirection } = draft[i]

            draft[i].canvasPosition.y = canvasPosition.y + BALL_BOUNCE_SPEED * movingDirection.y

            const ballIsOutOfTileBorder = Math.abs(canvasPosition.originalY - canvasPosition.y) >= (DIMENSION * 0.1) / TILES_PER_SIDE

            if (ballIsOutOfTileBorder) {
              draft[i].movingDirection.y = movingDirection.y == 1 ? -1 : 1
            }
          }
        }
      })

      return {
        ...state,
        balls,
      }
    }

    case ACTION_TYPE_SELECT_DESTINATION: {
      if (!payload?.position || state.currentStage !== 'selected' || state.isAnimating) return state

      const start: TilePosition = state.balls.filter((b) => b.isSelected)[0].position
      const destination: TilePosition = payload.position

      const path = findPath(state.balls, start, destination)

      if (!path.length) return state

      const { x, y } = getCanvasPosition(destination)

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isSelected) {
            const { originalX, originalY } = draft[i].canvasPosition

            draft[i].isMoving = true
            draft[i].position = destination
            draft[i].canvasPosition = { x: originalX, y: originalY, originalX: x, originalY: y }
            draft[i].movingPath = path
          }
        }
      })

      // save current ball state for user to undo later
      const prevBalls = state.balls.map((ball) => {
        const { originalX, originalY } = ball.canvasPosition
        return { ...ball, isSelected: false, canvasPosition: { ...ball.canvasPosition, x: originalX, y: originalY } }
      })

      return {
        ...state,
        balls,
        currentStage: 'moving',
        prevBalls,
      }
    }

    case ACTION_TYPE_MOVE_BALL: {
      if (state.currentStage !== 'moving') return state

      let currentStage: CurrentStage = state.currentStage

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isMoving) {
            const nextPos = draft[i].movingPath?.pop()

            if (!nextPos) {
              // have arrived at destination
              draft[i].isSelected = false
              draft[i].isMoving = false
              currentStage = 'update-score'
              break
            }

            draft[i].canvasPosition.y = nextPos.y
            draft[i].canvasPosition.x = nextPos.x
          }
        }
      })

      return {
        ...state,
        balls,
        currentStage,
      }
    }

    case ACTION_TYPE_UPDATE_SCORE: {
      let balls = state.balls
      let currentStage = state.currentStage
      let prevBalls = state.prevBalls

      const consecutiveBalls = findConsecutiveBalls(balls)
      const scoreToAdd = Object.keys(consecutiveBalls).length

      if (scoreToAdd) {
        //   if user scores, go to new cycle, skip adding new balls and disallow undo
        currentStage = 'new-cycle'
        prevBalls = []

        balls = produce(balls, (draft) => {
          for (let i = 0; i < draft.length; i++) {
            if (!draft[i].isActive) continue

            const positionStr = draft[i].position.c + '-' + draft[i].position.r
            if (positionStr in consecutiveBalls) {
              draft[i].toBeRemoved = true
            }
          }
        })
      }

      if (currentStage == 'update-score') {
        currentStage = 'add-balls'
      }

      return {
        ...state,
        balls,
        currentStage,
        prevBalls,
        score: state.score + scoreToAdd,
        gameOver: balls.filter((b) => b.isActive && !b.toBeRemoved).length === TILES_PER_SIDE * TILES_PER_SIDE,
        isAnimating: scoreToAdd > 0,
        bestScore: Math.max(state.score + scoreToAdd, state.bestScore),
      }
    }

    case ACTION_TYPE_ADD_BALLS: {
      let balls = state.balls

      const activeBalls = balls.filter((ball) => ball.isActive)

      let newBallsNeeded = 3

      //   if there's an inactive ball same tile with active ball
      let removedInactiveBallIdx = -1

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (!draft[i].isActive) {
            draft[i].isActive = true
            draft[i].isGrowing = true

            for (const b of activeBalls) {
              const twoBallsInOneTile: boolean = draft[i].position.c === b.position.c && draft[i].position.r === b.position.r

              if (twoBallsInOneTile) {
                newBallsNeeded += 1
                removedInactiveBallIdx = i
                break
              }
            }
          }
        }
      })

      if (removedInactiveBallIdx >= 0) {
        balls = balls.filter((_b, idx) => idx !== removedInactiveBallIdx)
      }

      const availablePositions = getAllEmptyTilePositions(balls, ALL_TILES_POS)
      const newBallsPositions = getMultipleRandomEmptyTiles(availablePositions, Math.min(newBallsNeeded, availablePositions.length))

      for (let i = 0; i < newBallsPositions.length; i++) {
        const isReplacementBall = newBallsNeeded > 3 && i == 0
        const newBall = createBall(newBallsPositions[i].position, isReplacementBall, { isGrowing: isReplacementBall, size: getBallSize(false) })
        balls = [newBall, ...balls]
      }

      return {
        ...state,
        balls,
        currentStage: 'new-cycle',
        isAnimating: true,
      }
    }

    case ACTION_TYPE_GROW_BALLS: {
      let isAnimating = state.isAnimating

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isGrowing) {
            const { size } = draft[i]

            const ballGrownEnough = Math.abs(size - getBallSize(true)) <= 2

            if (ballGrownEnough) {
              draft[i].size = getBallSize(true)
              draft[i].isGrowing = false
              isAnimating = false
            } else {
              draft[i].size += 2
            }
          }
        }
      })

      return {
        ...state,
        balls,
        isAnimating,
      }
    }

    case ACTION_TYPE_SHRINK_BALLS: {
      let isAnimating = state.isAnimating

      let balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].toBeRemoved) {
            draft[i].size -= 2
          }
        }
      })

      balls = balls.filter((ball) => {
        if (ball.size <= 0) {
          isAnimating = false
          return false
        }
        return true
      })

      return {
        ...state,
        balls,
        isAnimating,
      }
    }

    case ACTION_TYPE_RESTART: {
      return {
        ...DEFAULT_GAME_STATE,
        balls: getStartingBalls(),
        bestScore: state.bestScore,
      }
    }

    case ACTION_TYPE_UNDO: {
      if (!state.prevBalls.length) return state

      return {
        ...state,
        currentStage: 'new-cycle',
        balls: state.prevBalls,
        prevBalls: [],
      }
    }

    default: {
      return state
    }
  }
}

const useGameState = (initialState: GameState) => {
  const [state, dispatch] = useReducer(reduce, null, () => {
    const { balls, gameOver, bestScore } = initialState

    if (balls.length && !gameOver) {
      return {
        ...initialState,
        balls: cancelAnimationFromPreviousSession(balls),
        currentStage: 'new-cycle' as CurrentStage,
        isAnimating: false,
        prevBalls: [],
      }
    }

    return {
      ...DEFAULT_GAME_STATE,
      balls: getStartingBalls(),
      bestScore,
    }
  })

  const selectBall = useCallback((position: TilePosition) => {
    dispatch({ type: ACTION_TYPE_SELECT_BALL, payload: { position } })
  }, [])

  const selectDestination = useCallback((position: TilePosition) => {
    dispatch({ type: ACTION_TYPE_SELECT_DESTINATION, payload: { position } })
  }, [])

  const bounceSelectedBall = useCallback(() => {
    dispatch({ type: ACTION_TYPE_BOUNCE_BALL })
  }, [])

  const moveSelectedBall = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_BALL })
  }, [])

  const growBalls = useCallback(() => {
    dispatch({ type: ACTION_TYPE_GROW_BALLS })
  }, [])

  const shrinkBalls = useCallback(() => {
    dispatch({ type: ACTION_TYPE_SHRINK_BALLS })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: ACTION_TYPE_RESTART })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: ACTION_TYPE_UNDO })
  }, [])

  const updateScore = useCallback(() => {
    dispatch({ type: ACTION_TYPE_UPDATE_SCORE })
  }, [])

  const addBalls = useCallback(() => {
    dispatch({ type: ACTION_TYPE_ADD_BALLS })
  }, [])

  useEffect(() => {
    if (state.isAnimating) return

    if (state.currentStage == 'update-score' || state.currentStage == 'new-cycle') {
      updateScore()
    }

    if (state.currentStage == 'add-balls') {
      addBalls()
    }
  }, [state.currentStage, updateScore, addBalls, state.isAnimating])

  return { state, selectBall, selectDestination, bounceSelectedBall, moveSelectedBall, restart, growBalls, shrinkBalls, undo }
}

export default useGameState
