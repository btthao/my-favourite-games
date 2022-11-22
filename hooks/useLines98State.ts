import { getCanvasPosition, SIZE } from './../utils/lines98'
import produce from 'immer'
import { useCallback, useReducer } from 'react'
import { partition } from 'utils/helpers'
import {
  BallState,
  BALL_BOUNCE_SPEED,
  findSelectedBall,
  getStartingBalls,
} from 'utils/lines98'
import { Position } from 'utils/tile'

const ACTION_TYPE_SELECT = 'select'
const ACTION_TYPE_BOUNCE_SELECTED_BALL = 'bounce'
const ACTION_TYPE_MOVE = 'move'

export interface GameState {
  balls: BallState[]
  gameOver: boolean
  gameState: 'selected' | 'moving' | 'new-cycle'
}

export const DEFAULT_STATE: GameState = {
  balls: [],
  gameOver: false,
  gameState: 'new-cycle',
}

function reduce(
  state: GameState,
  action: { payload?: { position?: Position; ball?: BallState }; type: string }
): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_SELECT: {
      if (!payload?.position || state.gameState === 'moving') return state

      let balls = [...state.balls]
      let gameState = state.gameState

      const { selectedBall, selectedBallIdx } = findSelectedBall(
        payload.position,
        balls
      )

      //   whether there's a ball selected or not, when click on an active ball => change selected ball to the new one
      if (selectedBall?.isActive && selectedBallIdx > -1) {
        console.log('ball selected', selectedBall.color)
        balls = balls.map((ball, idx) => {
          if (idx === selectedBallIdx) {
            return { ...ball, isSelected: true }
          }

          return { ...ball, isSelected: false }
        })

        gameState = 'selected'
      }

      //   if a ball is already selected and click on empty tile => check if can move ball there
      if (gameState === 'selected' && !selectedBall) {
        //   check if empty
      }

      console.log(balls)

      return {
        ...state,
        balls,
        gameState,
      }
    }

    case ACTION_TYPE_BOUNCE_SELECTED_BALL: {
      const { balls } = state
      const [selected, rest] = partition(balls, (ball) => ball.isSelected)

      if (selected.length !== 1) return state
      console.log('ball bouncing', selected.length, selected[0].color)

      const { canvasPosition, movingDirection } = selected[0]

      selected[0].canvasPosition.y =
        canvasPosition.y + BALL_BOUNCE_SPEED * movingDirection.y

      if (
        canvasPosition.y <= canvasPosition.boundTop ||
        canvasPosition.y >= canvasPosition.boundBottom
      ) {
        selected[0].movingDirection.y = movingDirection.y == 1 ? -1 : 1
      }

      return {
        ...state,
        balls: [...selected, ...rest],
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

  const selectBall = useCallback((position: Position) => {
    dispatch({ type: ACTION_TYPE_SELECT, payload: { position } })
  }, [])

  const bounceSelectedBall = useCallback(() => {
    dispatch({ type: ACTION_TYPE_BOUNCE_SELECTED_BALL })
  }, [])

  return { state, selectBall, bounceSelectedBall }
}

export default useGameState
