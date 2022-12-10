import produce from 'immer'
import { useCallback, useEffect, useReducer } from 'react'
import { ALL_TILES_POS, BallState, BALL_BOUNCE_SPEED, BALL_MOVE_SPEED, findConsecutiveBalls, createBall, DIMENSION, getCanvasPosition, getStartingBalls, SIZE, getBallSize } from 'utils/lines98'
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

export interface GameState {
  balls: BallState[]
  gameOver: boolean
  currentState: 'selected' | 'moving' | 'update-score' | 'add-balls' | 'new-cycle'
  score: number
  isAnimating: boolean // if ball is shrinking, growing or moving => basically wait till animating is finished before user can do the next step
}

export const DEFAULT_STATE: GameState = {
  balls: [],
  gameOver: false,
  currentState: 'new-cycle',
  score: 0,
  isAnimating: false,
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

      const { x, y } = getCanvasPosition(payload.position)

      const balls = produce(state.balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isSelected) {
            const { originalX, originalY } = draft[i].canvasPosition
            //   set new position, on canvas, set originalPosition as destination but current is the old one
            draft[i].isMoving = true
            draft[i].position = payload.position as Position
            draft[i].canvasPosition = { x: originalX, y: originalY, originalX: x, originalY: y }
          }
        }
      })

      return {
        ...state,
        balls,
        currentState: 'moving',
      }
    }

    case ACTION_TYPE_MOVE_BALL: {
      if (state.currentState !== 'moving') return state

      let balls = state.balls
      let currentState = state.currentState

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          if (draft[i].isMoving) {
            const { originalX, originalY, x, y } = draft[i].canvasPosition

            if (Math.abs(y - originalY) <= 20) {
              draft[i].canvasPosition.y = originalY
            } else {
              draft[i].movingDirection.y = y > originalY ? -1 : 1
              draft[i].canvasPosition.y = y + BALL_MOVE_SPEED * draft[i].movingDirection.y
            }

            if (Math.abs(x - originalX) <= 20) {
              draft[i].canvasPosition.x = originalX
            } else {
              draft[i].movingDirection.x = x > originalX ? -1 : 1
              draft[i].canvasPosition.x = x + BALL_MOVE_SPEED * draft[i].movingDirection.x
            }

            //   if arrive at destination
            if (x === originalX && y === originalY) {
              draft[i].isSelected = false
              draft[i].isMoving = false
              // @ts-ignore
              currentState = 'update-score'
            }
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
      }
    }

    case ACTION_TYPE_ADD_BALLS: {
      console.log('add balls')
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
      console.log('grow balls')

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
      console.log('shrinking balls')

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

  return { state, selectBall, selectDestination, bounceSelectedBall, moveSelectedBall, restart, growBalls, shrinkBalls }
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
