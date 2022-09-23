import produce from 'immer'
import { useCallback, useReducer } from 'react'
import {
  expandMineFreeArea,
  initMinesweeper,
  TileState,
  TOTAL_COLS,
  TOTAL_ROWS,
  DEFAULT_TILE_STATE,
  TOTAL_MINES,
} from 'utils/minesweeper'

const ACTION_TYPE_REVEAL = 'reveal'
const ACTION_TYPE_FLAG = 'flag'
const ACTION_TYPE_NEW_GAME = 'new-game'

export interface GameState {
  tiles: TileState[]
  minesCount: number
  timer: number
  gameOver: boolean
  isInitialized: boolean
}

export const DEFAULT_STATE: GameState = {
  tiles: new Array(TOTAL_COLS * TOTAL_ROWS).fill(DEFAULT_TILE_STATE),
  minesCount: TOTAL_MINES,
  timer: 0,
  gameOver: false,
  isInitialized: false,
}

function reduce(
  state: GameState,
  action: { payload?: { tileIndex: number }; type: string }
): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_REVEAL: {
      if (!payload || state.gameOver) return state

      const { tileIndex } = payload
      const { tiles, isInitialized } = state

      //   first click => initialize game by creating mines
      if (!isInitialized) {
        return {
          ...state,
          isInitialized: true,
          tiles: initMinesweeper(tiles, tileIndex),
        }
      }

      //   not do anything if tile is already revealed or flagged
      if (tiles[tileIndex].isRevealed || tiles[tileIndex].isFlagged) {
        return state
      }

      let newTiles = [...tiles]
      let gameOver = false

      if (!newTiles[tileIndex].hasMine) {
        newTiles = expandMineFreeArea(newTiles, tileIndex)
      } else {
        //   click on mine, game over, reveal all mines
        gameOver = true
        newTiles = produce(newTiles, (draft) => {
          for (let i = 0; i < draft.length; i++) {
            if (draft[i].hasMine) {
              draft[i].isRevealed = true
            }
            draft[tileIndex].isClickedMine = true
          }
        })
      }

      return {
        ...state,
        tiles: newTiles,
        gameOver,
      }
    }

    case ACTION_TYPE_FLAG: {
      if (!payload || state.gameOver) return state

      const { tileIndex } = payload
      const { tiles } = state

      if (tiles[tileIndex].isRevealed) return state

      let newTiles = [...tiles]
      newTiles = produce(newTiles, (draft) => {
        draft[tileIndex].isFlagged = !draft[tileIndex].isFlagged
      })

      return {
        ...state,
        tiles: newTiles,
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

  const reveal = useCallback((index: number) => {
    dispatch({
      type: ACTION_TYPE_REVEAL,
      payload: { tileIndex: index },
    })
  }, [])

  const flag = useCallback((index: number) => {
    dispatch({
      type: ACTION_TYPE_FLAG,
      payload: { tileIndex: index },
    })
  }, [])

  return { state, newGame, reveal, flag }
}

export default useGameState
