import produce from 'immer'
import { useCallback, useReducer } from 'react'
import { selectRandomFromList } from 'utils/helpers'
import {
  ALL_TILES_POS,
  BallState,
  BALL_BOUNCE_SPEED,
  colors,
  createBall,
  DIMENSION,
  findClickedBall,
  getBallSize,
  getCanvasPosition,
  getStartingBalls,
  SIZE,
} from 'utils/lines98'
import {
  getAllEmptyTilesPositions,
  getMultipleRandomEmptyTiles,
  getRandomEmptyTilePosition,
  Position,
} from 'utils/tile'

const ACTION_TYPE_CLICK = 'click'
const ACTION_TYPE_BOUNCE_SELECTED_BALL = 'bounce'

export interface GameState {
  balls: BallState[]
  gameOver: boolean
  currentState: 'selected' | 'moving' | 'new-cycle'
}

export const DEFAULT_STATE: GameState = {
  balls: [],
  gameOver: false,
  currentState: 'new-cycle',
}

function reduce(
  state: GameState,
  action: { payload?: { position?: Position; ball?: BallState }; type: string }
): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_CLICK: {
      if (!payload?.position || state.currentState == 'moving') return state

      let balls = [...state.balls]
      let currentState = state.currentState

      //   check if there's an active ball where user clicks
      const { clickedBall, clickedBallIdx } = findClickedBall(
        payload.position,
        balls
      )

      if (clickedBall && clickedBallIdx > -1) {
        //  when click on an active ball => change selected ball to this one
        console.log('ball selected', clickedBall.color)
        balls = produce(balls, (draft) => {
          for (let i = 0; i < draft.length; i++) {
            if (draft[i].isSelected) {
              // reset position if this ball is bouncing
              draft[i].canvasPosition.x = draft[i].canvasPosition.originalX
              draft[i].canvasPosition.y = draft[i].canvasPosition.originalY
            }
            draft[i].isSelected = i === clickedBallIdx
          }
        })
        currentState = 'selected'
      } else if (
        currentState == 'selected' &&
        (!clickedBall || !clickedBall?.isActive)
      ) {
        //  there's already a ball selected and user wants to move ball. user can move ball to an empty tile or tile with an inactive ball
        let clickedOnInactiveBall = false

        //   if clicked on inactive ball => remove that inactive ball. it will be replaced later
        balls = balls.filter((ball) => {
          if (
            ball.position.c === payload.position?.c &&
            ball.position.r === payload.position?.r
          ) {
            clickedOnInactiveBall = true
            return false
          }
          return true
        })

        balls = produce(balls, (draft) => {
          for (let i = 0; i < draft.length; i++) {
            if (draft[i].isSelected) {
              //  change selected ball position and deselect
              const { r, c } = payload.position as Position
              const [x, y] = [getCanvasPosition(c), getCanvasPosition(r)]
              draft[i].position = { r, c }
              draft[i].canvasPosition = {
                originalX: x,
                originalY: y,
                x,
                y,
              }
              draft[i].isSelected = false
            }

            // make inactive balls active
            if (!draft[i].isActive) {
              draft[i].isActive = true
              draft[i].size = getBallSize(true)
            }
          }
        })

        //   add new balls, add one extra one if clicked on inactive ball
        let emptyTiles = getAllEmptyTilesPositions(balls, ALL_TILES_POS)
        const totalNewBalls = clickedOnInactiveBall ? 4 : 3

        if (emptyTiles.length) {
          const newPositions = getMultipleRandomEmptyTiles(
            emptyTiles,
            Math.min(totalNewBalls, emptyTiles.length)
          )
          for (let i = 0; i < newPositions.length; i++) {
            balls = [
              ...balls,
              createBall(
                newPositions[i].position,
                clickedOnInactiveBall && i == 0
              ),
            ]
          }
        }
      }

      return {
        ...state,
        balls,
        currentState,
      }
    }

    case ACTION_TYPE_BOUNCE_SELECTED_BALL: {
      console.log('bounce')
      if (state.currentState !== 'selected') return state

      let balls = state.balls

      balls = produce(balls, (draft) => {
        for (let i = 0; i < draft.length; i++) {
          const { canvasPosition, movingDirection, isSelected } = draft[i]
          if (isSelected) {
            //   change position
            draft[i].canvasPosition.y =
              canvasPosition.y + BALL_BOUNCE_SPEED * movingDirection.y

            //  change direction when going out of tile border
            if (
              Math.abs(canvasPosition.originalY - canvasPosition.y) >=
              (DIMENSION * 0.1) / SIZE
            ) {
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

    default: {
      return state
    }
  }
}

const useGameState = (initialState: GameState) => {
  const [state, dispatch] = useReducer(reduce, null, () => {
    const { balls, gameOver } = initialState
    if (balls.length) {
      return {
        ...initialState,
        balls: gameOver ? getStartingBalls() : balls,
        gameOver: false,
      }
    } else {
      return {
        ...DEFAULT_STATE,
        balls: getStartingBalls(),
      }
    }
  })

  const click = useCallback((position: Position) => {
    dispatch({ type: ACTION_TYPE_CLICK, payload: { position } })
  }, [])

  const bounceSelectedBall = useCallback(() => {
    dispatch({ type: ACTION_TYPE_BOUNCE_SELECTED_BALL })
  }, [])

  return { state, click, bounceSelectedBall }
}

export default useGameState
