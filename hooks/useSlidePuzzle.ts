import { useCallback, useReducer } from 'react'
import { TilePosition } from 'utils/tile'
import { TileState } from 'utils/slidePuzzle'
import produce from 'immer'

const ACTION_TYPE_NEW_GAME = 'new-game'
const ACTION_TYPE_INITIALIZE_TILES = 'initialize-tiles'
const ACTION_TYPE_CLICK = 'move-tile'

export interface GameState {
  imageSrc: string
  tiles: TileState[]
  emptyTileIdx: number
  difficulty: number
}

export const DEFAULT_GAME_STATE: GameState = {
  imageSrc: '/taylor/reputation.jpeg',
  tiles: [],
  emptyTileIdx: 15,
  difficulty: 4,
}

function reduce(state: GameState, action: { payload?: { tiles?: TileState[]; position?: TilePosition }; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_INITIALIZE_TILES: {
      if (!payload?.tiles?.length) return state

      //   shuffle

      return {
        ...state,
        tiles: payload.tiles,
      }
    }

    case ACTION_TYPE_CLICK: {
      if (payload?.position == undefined) return state

      const { difficulty, emptyTileIdx } = state

      const { r, c } = payload?.position

      const clickedTileIdx = difficulty * r + c

      const isRight = emptyTileIdx - 1 == clickedTileIdx && emptyTileIdx % difficulty !== 0
      const isLeft = emptyTileIdx + 1 == clickedTileIdx && clickedTileIdx % difficulty !== 0
      const isAbove = emptyTileIdx + difficulty == clickedTileIdx
      const isBelow = emptyTileIdx - difficulty == clickedTileIdx

      if (!isRight && !isLeft && !isAbove && !isBelow) return state

      const tiles = produce(state.tiles, (draft) => {
        for (const tile of draft) {
          if (tile.currentIdx == clickedTileIdx) {
            const newIdx = isRight ? clickedTileIdx + 1 : isLeft ? clickedTileIdx - 1 : isAbove ? clickedTileIdx - difficulty : clickedTileIdx + difficulty

            const r = Math.floor(newIdx / difficulty)
            const c = newIdx % difficulty

            tile.currentIdx = newIdx
            tile.position = { r, c }
          }
        }
      })

      return {
        ...state,
        tiles,
        emptyTileIdx: clickedTileIdx,
      }
    }

    case ACTION_TYPE_NEW_GAME: {
      return DEFAULT_GAME_STATE
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

  const initializeTiles = useCallback((tiles: TileState[]) => {
    dispatch({
      type: ACTION_TYPE_INITIALIZE_TILES,
      payload: { tiles },
    })
  }, [])

  const clickTile = useCallback((position: TilePosition) => {
    dispatch({
      type: ACTION_TYPE_CLICK,
      payload: { position },
    })
  }, [])

  return { state, newGame, initializeTiles, clickTile }
}

export default useGameState
