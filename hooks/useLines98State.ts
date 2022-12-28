import produce from 'immer'
import { useCallback, useEffect, useReducer } from 'react'
import { ALL_TILES_POS, BallState, BALL_BOUNCE_SPEED, findConsecutiveBalls, createBall, DIMENSION, getCanvasPosition, getStartingBalls, SIZE, getBallSize, findPath } from 'utils/lines98'
import { getAllEmptyTilesPositions, getMultipleRandomEmptyTiles, Position } from 'utils/tile'

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

export interface GameState {
  balls: BallState[]
  gameOver: boolean
  currentState: 'selected' | 'moving' | 'update-score' | 'add-balls' | 'new-cycle'
  score: number
  isAnimating: boolean // if ball is shrinking, growing or moving => basically wait till animating is finished before user can do the next step
  prevBalls: BallState[]
}

export const DEFAULT_STATE: GameState = {
  balls: [],
  gameOver: false,
  currentState: 'new-cycle',
  score: 0,
  isAnimating: false,
  prevBalls: [],
}

function reduce(state: GameState, action: { payload?: { position?: Position; ball?: BallState; isNewCycle?: boolean }; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_SELECT_BALL: {
      if (!payload?.position || state.currentState == 'moving' || state.isAnimating) return state
      const { r, c } = payload.position

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          // deselect previously selected ball
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
        currentState: 'selected',
      }
    }

    case ACTION_TYPE_BOUNCE_BALL: {
      if (state.currentState !== 'selected') return state

      let balls = state.balls

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isSelected) {
            const { canvasPosition, movingDirection } = draft[i]
            //   change position
            draft[i].canvasPosition.y = canvasPosition.y + BALL_BOUNCE_SPEED * movingDirection.y

            //  change direction when going out of tile border
            if (Math.abs(canvasPosition.originalY - canvasPosition.y) >= (DIMENSION * 0.1) / SIZE) {
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
      if (!payload?.position || state.currentState !== 'selected' || state.isAnimating) return state

      const path = findPath(state.balls, state.balls.filter((b) => b.isSelected)[0].position, payload.position)
      //   if there's no possible path to destination, stop here
      if (!path.length) return state

      const { x, y } = getCanvasPosition(payload.position)

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isSelected) {
            const { originalX, originalY } = draft[i].canvasPosition
            //   set new position on canvas, set originalPosition as destination but current is the old one
            draft[i].isMoving = true
            draft[i].position = payload.position as Position
            draft[i].canvasPosition = { x: originalX, y: originalY, originalX: x, originalY: y }
            draft[i].movingPath = path
          }
        }
      })

      // save current ball state for user to undo
      const prevBalls = state.balls

      return {
        ...state,
        balls,
        currentState: 'moving',
        prevBalls,
      }
    }

    case ACTION_TYPE_MOVE_BALL: {
      if (state.currentState !== 'moving') return state

      let balls = state.balls
      let currentState = state.currentState

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isMoving) {
            //   change position to the next node we already set in movingPath
            const nextPos = draft[i].movingPath?.pop()

            if (!nextPos) {
              // have arrived at destination
              draft[i].isSelected = false
              draft[i].isMoving = false
              // @ts-ignore
              currentState = 'update-score'
              break
            }
            //  update position
            draft[i].canvasPosition.y = nextPos.y
            draft[i].canvasPosition.x = nextPos.x
          }
        }
      })

      return {
        ...state,
        balls,
        currentState,
      }
    }

    case ACTION_TYPE_UPDATE_SCORE: {
      let balls = state.balls
      let score = state.score
      let currentState = state.currentState
      let prevBalls = state.prevBalls

      const ballsToRemove = findConsecutiveBalls(balls)

      if (ballsToRemove.length) {
        //   if there's score to be added => go to new cycle to skip add balls
        currentState = 'new-cycle'

        //   prepare balls to be shrunk
        balls = produce(balls, (draft) => {
          for (let i = 0; i < draft.length; i++) {
            if (!draft[i].isActive) continue
            for (const b of ballsToRemove) {
              if (draft[i].position.c === b.c && draft[i].position.r === b.r) {
                draft[i].toBeRemoved = true
                score += 1
                break
              }
            }
          }
        })
        //   if user scores then no undo allowed
        prevBalls = []
      } else if (!payload?.isNewCycle) {
        //   if there's no score to be added and still in cycle => add new balls before going to new cycle
        currentState = 'add-balls'
      }

      return {
        ...state,
        balls,
        score,
        currentState,
        isAnimating: ballsToRemove.length > 0,
        prevBalls,
      }
    }

    case ACTION_TYPE_ADD_BALLS: {
      let balls = state.balls
      let isAnimating = state.isAnimating

      const activeBalls = balls.filter((ball) => ball.isActive)

      let newBallsNeeded = 3
      //   if there's an inactive ball same tile with active ball
      let removedIdx = -1

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (!draft[i].isActive) {
            // => small balls get bigger
            draft[i].isActive = true
            draft[i].isGrowing = true
            isAnimating = true
            for (const b of activeBalls) {
              // => small ball in same tile with big ball => move somewhere else
              if (draft[i].position.c === b.position.c && draft[i].position.r === b.position.r) {
                newBallsNeeded += 1
                removedIdx = i
                break
              }
            }
          }
        }
      })

      //   remove inactive ball first before adding its replacement
      if (removedIdx >= 0) {
        balls = balls.filter((ball, idx) => idx !== removedIdx)
      }

      // => add new inactive balls plus replacement ball if any
      const emptyTiles = getAllEmptyTilesPositions(balls, ALL_TILES_POS)
      const newPositions = getMultipleRandomEmptyTiles(emptyTiles, Math.min(newBallsNeeded, emptyTiles.length))

      for (let i = 0; i < newPositions.length; i++) {
        const isReplacementBall = newBallsNeeded > 3 && i == 0
        balls = [...balls, createBall(newPositions[i].position, isReplacementBall, { isGrowing: isReplacementBall, size: getBallSize(false) })]
      }

      return {
        ...state,
        balls,
        currentState: 'new-cycle',
        isAnimating,
      }
    }

    case ACTION_TYPE_GROW_BALLS: {
      let isAnimating = state.isAnimating

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isGrowing) {
            const { size } = draft[i]
            // if ball size is big enough, stop
            if (Math.abs(size - getBallSize(true)) <= 2) {
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
          if (draft[i].toBeRemoved === true) {
            draft[i].size -= 2
          }
        }
      })

      //   if size < 0 => remove now
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
        ...DEFAULT_STATE,
        balls: getStartingBalls(),
      }
    }

    case ACTION_TYPE_UNDO: {
      if (!state.prevBalls.length) return state

      return {
        ...DEFAULT_STATE,
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
    const { balls, gameOver, score } = initialState
    if (balls.length) {
      return {
        ...initialState,
        balls: gameOver ? getStartingBalls() : balls,
        gameOver: false,
        score: gameOver ? 0 : score,
      }
    } else {
      return {
        ...DEFAULT_STATE,
        balls: getStartingBalls(),
      }
    }
  })

  const selectBall = useCallback((position: Position) => {
    dispatch({ type: ACTION_TYPE_SELECT_BALL, payload: { position } })
  }, [])

  const selectDestination = useCallback((position: Position) => {
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

  const updateScore = useCallback((isNewCycle: boolean) => {
    dispatch({ type: ACTION_TYPE_UPDATE_SCORE, payload: { isNewCycle } })
  }, [])

  const addBalls = useCallback(() => {
    dispatch({ type: ACTION_TYPE_ADD_BALLS })
  }, [])

  useEffect(() => {
    //   update score after new balls grow or selected ball moved to its destination
    if ((state.currentState == 'update-score' || state.currentState == 'new-cycle') && !state.isAnimating) {
      updateScore(state.currentState === 'new-cycle')
    }

    if (state.currentState == 'add-balls' && !state.isAnimating) {
      addBalls()
    }
  }, [state.currentState, updateScore, addBalls, state.isAnimating])

  return { state, selectBall, selectDestination, bounceSelectedBall, moveSelectedBall, restart, growBalls, shrinkBalls, undo }
}

export default useGameState

// start: 7 big, 3 small

// check if click on empty or active ball in canvas

// const ACTION_TYPE_SELECT_BALL = 'select'
// click on active ball => change state to selected

// const ACTION_TYPE_BOUNCE_ANIMATION = 'bounce-animation'
// while draw, if ball state is active => bouncing animation

// const ACTION_TYPE_MOVE_SELECTED_BALL = 'move'
// click empty or inactive ball
// => if there's bouncing ball: move ball if there's possible path => change position

// const ACTION_TYPE_MOVE_ANIMATION = 'moving-animation'

// const ACTION_TYPE_CHECK_SCORE = 'check-score'
// after move: check score

// const ACTION_TYPE_NEW_CYCLE = 'new-cycle'
// if not score
// => small ball same possible with big ball => inactive ball move somewhere else
// => small balls get bigger
// => new small balls appear => check for score again

// if score
// => balls disappear
// => small balls stay the same, no new balls

// BUG: SMALL BALL MOVED TO NEW PLACE EVEN WHEN SCORE
// WAIT TILL GROW TO COUNT SCORE
// move on small ball => score => small ball disappear

// get ballsize function => make object

// move => check score => add
