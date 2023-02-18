import { DEFAULT_IMAGE, DEFAULT_LEVEL, difficultyLevels, DIMENSION, imageOptions, updateCanvasPosition } from './../utils/slidePuzzle'
import { selectRandomFromList, swapInArray } from './../utils/helpers'
import { useCallback, useReducer } from 'react'
import { TilePosition } from 'utils/tile'
import { isValidMove, TileState } from 'utils/slidePuzzle'

const ACTION_TYPE_NEW_GAME = 'new-game'
const ACTION_TYPE_INITIALIZE_TILES = 'initialize-tiles'
const ACTION_TYPE_CLICK = 'move-tile'
const ACTION_TYPE_CHANGE_SETUP = 'change-setup'

export interface GameState {
  imageSrc: string
  tiles: TileState[]
  emptyTileIdx: number
  tilesPerSide: number
  tileSize: number
}

export const DEFAULT_GAME_STATE: GameState = {
  imageSrc: DEFAULT_IMAGE,
  tiles: [],
  emptyTileIdx: DEFAULT_LEVEL * DEFAULT_LEVEL - 1,
  tilesPerSide: DEFAULT_LEVEL,
  tileSize: DIMENSION / DEFAULT_LEVEL,
}

interface Payload {
  tiles?: TileState[]
  tilePosition?: TilePosition
  setup?: { imageSrc: string; tilesPerSide: number }
}

function reduce(state: GameState, action: { payload?: Payload; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_INITIALIZE_TILES: {
      if (!payload?.tiles?.length) return state

      const { tilesPerSide, tileSize } = state

      let emptyTileIdx = state.emptyTileIdx

      const tiles = [...payload.tiles, { correctIdx: emptyTileIdx }]

      const moves = [1, -1, tilesPerSide, tilesPerSide * -1]

      for (let i = 0; i < 100; i++) {
        let newIdx = emptyTileIdx

        while (newIdx == state.emptyTileIdx || emptyTileIdx == newIdx || !isValidMove(emptyTileIdx, newIdx, tilesPerSide)) {
          newIdx = emptyTileIdx + selectRandomFromList(moves)
        }

        swapInArray(tiles, newIdx, emptyTileIdx)

        emptyTileIdx = newIdx
      }

      updateCanvasPosition(tiles, tileSize, tilesPerSide)

      return {
        ...state,
        tiles,
        emptyTileIdx,
      }
    }

    case ACTION_TYPE_CLICK: {
      if (payload?.tilePosition == undefined) return state

      const { tilesPerSide, emptyTileIdx, tileSize } = state

      const { r, c } = payload.tilePosition

      const clickedTileIdx = tilesPerSide * r + c

      if (!isValidMove(emptyTileIdx, clickedTileIdx, tilesPerSide)) return state

      const tiles = [...state.tiles]

      swapInArray(tiles, clickedTileIdx, emptyTileIdx)
      updateCanvasPosition(tiles, tileSize, tilesPerSide)

      return {
        ...state,
        tiles,
        emptyTileIdx: clickedTileIdx,
      }
    }

    case ACTION_TYPE_CHANGE_SETUP: {
      if (!payload?.setup) return state

      const { imageSrc, tilesPerSide } = payload.setup

      return {
        ...state,
        imageSrc,
        emptyTileIdx: tilesPerSide * tilesPerSide - 1,
        tilesPerSide,
        tileSize: DIMENSION / tilesPerSide,
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
      payload: { tilePosition: position },
    })
  }, [])

  const changeSetup = useCallback((setup: Payload['setup']) => {
    dispatch({
      type: ACTION_TYPE_CHANGE_SETUP,
      payload: { setup },
    })
  }, [])

  return { state, newGame, initializeTiles, clickTile, changeSetup }
}

export default useGameState
