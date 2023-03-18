import produce from 'immer'
import { useCallback, useReducer } from 'react'
import { expandMineFreeArea, initMinesweeper, TileState, TOTAL_COLS, TOTAL_ROWS, DEFAULT_TILE_STATE, TOTAL_MINES, checkWin, revealAllMines } from 'utils/minesweeper'

const ACTION_TYPE_REVEAL = 'reveal'
const ACTION_TYPE_FLAG = 'flag'
const ACTION_TYPE_NEW_GAME = 'new-game'

export interface GameState {
  tiles: TileState[]
  minesCount: number
  gameOver: boolean
  isInitialized: boolean
  won: boolean
  gameCount: number
}

export const DEFAULT_GAME_STATE: GameState = {
  tiles: new Array(TOTAL_COLS * TOTAL_ROWS).fill(DEFAULT_TILE_STATE),
  minesCount: TOTAL_MINES,
  gameOver: false,
  isInitialized: false,
  won: false,
  gameCount: 0,
}

function reduce(state: GameState, action: { payload?: { tileIndex: number }; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_REVEAL: {
      if (!payload || state.gameOver) return state

      const { tileIndex } = payload
      const { tiles, isInitialized } = state

      // make sure that the first tile user clicks is not a mine
      if (!isInitialized) {
        return {
          ...state,
          isInitialized: true,
          tiles: initMinesweeper(tiles, tileIndex),
        }
      }

      const clickedTile = tiles[tileIndex]

      if (clickedTile.isRevealed || clickedTile.isFlagged) {
        return state
      }

      let newTiles = [...tiles]
      let gameOver = false
      let won = false

      if (!clickedTile.hasMine) {
        newTiles = expandMineFreeArea(newTiles, tileIndex)
        gameOver = checkWin(newTiles)
        won = gameOver
      } else {
        newTiles = revealAllMines(newTiles, tileIndex)
        gameOver = true
      }

      return {
        ...state,
        tiles: newTiles,
        gameOver,
        won,
      }
    }

    case ACTION_TYPE_FLAG: {
      if (!payload || state.gameOver) return state

      const { tileIndex } = payload
      const { tiles, minesCount } = state

      if (tiles[tileIndex].isRevealed) return state

      let newTiles = [...tiles]

      newTiles = produce(newTiles, (draft) => {
        draft[tileIndex].isFlagged = !draft[tileIndex].isFlagged
      })

      return {
        ...state,
        tiles: newTiles,
        minesCount: newTiles[tileIndex].isFlagged ? minesCount - 1 : minesCount + 1,
      }
    }

    case ACTION_TYPE_NEW_GAME: {
      return { ...DEFAULT_GAME_STATE, gameCount: state.gameCount + 1 }
    }

    default: {
      return state
    }
  }
}

const useGameState = () => {
  const [state, dispatch] = useReducer(reduce, DEFAULT_GAME_STATE)

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
