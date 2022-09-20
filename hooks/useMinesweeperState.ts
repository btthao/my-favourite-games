import { useCallback, useReducer } from 'react'
import {
  initMinesweeper,
  TileState,
  TOTAL_COLS,
  TOTAL_ROWS,
} from 'utils/minesweeper'

const ACTION_TYPE_CLICK = 'click'
const ACTION_TYPE_FIRST_CLICK = 'first-click'
const ACTION_TYPE_FLAG = 'flag'
const ACTION_TYPE_NEW_GAME = 'new-game'

export interface GameState {
  tiles: TileState[]
  minesCount: number
  timer: number
  gameOver: boolean
}

export const DEFAULT_STATE: GameState = {
  tiles: new Array(TOTAL_COLS * TOTAL_ROWS).fill(null),
  minesCount: 99,
  timer: 0,
  gameOver: false,
}

function reduce(
  state: GameState,
  action: { payload?: { tileIndex: number }; type: string }
): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_FIRST_CLICK: {
      if (!payload) return state
      const { tileIndex } = payload

      return {
        ...DEFAULT_STATE,
        tiles: initMinesweeper(tileIndex),
      }
    }

    case ACTION_TYPE_NEW_GAME: {
      return DEFAULT_STATE
    }

    default: {
      return state
    }
  }
}

const useGameState = () => {
  const [state, dispatch] = useReducer(reduce, null, () => {
    return DEFAULT_STATE
  })

  const newGame = useCallback(() => {
    dispatch({ type: ACTION_TYPE_NEW_GAME })
  }, [])

  const firstClick = useCallback((index: number) => {
    dispatch({
      type: ACTION_TYPE_FIRST_CLICK,
      payload: { tileIndex: index },
    })
  }, [])

  return { state, newGame, firstClick }
}

export default useGameState
