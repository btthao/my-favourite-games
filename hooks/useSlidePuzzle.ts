import { DEFAULT_IMAGE, DEFAULT_LEVEL, DIMENSION, updateCanvasPosition } from './../utils/slidePuzzle'
import { selectRandomFromList, swapInArray } from './../utils/helpers'
import { useCallback, useReducer } from 'react'
import { TilePosition } from 'utils/tile'
import { isValidMove, TileState } from 'utils/slidePuzzle'

const ACTION_TYPE_NEW_GAME = 'new-game'
const ACTION_TYPE_INITIALIZE_TILES = 'initialize-tiles'
const ACTION_TYPE_CLICK = 'move-tile'
const ACTION_TYPE_CHANGE_IMAGE = 'change-image'
const ACTION_TYPE_CHANGE_LEVEL = 'change-level'
const ACTION_TYPE_TOGGLE_SHOW_HINT = 'toggle-show-hint'

export interface GameState {
  imageSrc: string
  tiles: TileState[]
  emptyTileIdx: number
  tilesPerSide: number
  tileSize: number
  moveCounts: number
  finished: boolean
  showHint: boolean
  isLoading: boolean
}

export const DEFAULT_GAME_STATE: GameState = {
  imageSrc: DEFAULT_IMAGE,
  tiles: [],
  emptyTileIdx: DEFAULT_LEVEL * DEFAULT_LEVEL - 1,
  tilesPerSide: DEFAULT_LEVEL,
  tileSize: DIMENSION / DEFAULT_LEVEL,
  moveCounts: 0,
  finished: false,
  showHint: true,
  isLoading: true,
}

interface Payload {
  tiles?: TileState[]
  tilePosition?: TilePosition
  imageSrc?: string
  level?: number
}

function reduce(state: GameState, action: { payload?: Payload; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_INITIALIZE_TILES: {
      if (!payload?.tiles?.length) return state

      const { tilesPerSide, tileSize } = state

      let emptyTileIdx = state.emptyTileIdx
      let prevEmptyTileIdx = emptyTileIdx

      const tiles = [...payload.tiles, { correctIdx: emptyTileIdx }]

      const moves = [1, -1, tilesPerSide, tilesPerSide * -1]

      for (let i = 0; i < state.tilesPerSide * 50; i++) {
        let newIdx = emptyTileIdx

        while (newIdx == prevEmptyTileIdx || newIdx == emptyTileIdx || !isValidMove(emptyTileIdx, newIdx, tilesPerSide)) {
          newIdx = emptyTileIdx + selectRandomFromList(moves)
        }

        swapInArray(tiles, newIdx, emptyTileIdx)

        prevEmptyTileIdx = emptyTileIdx
        emptyTileIdx = newIdx
      }

      updateCanvasPosition(tiles, tileSize, tilesPerSide)

      return {
        ...state,
        tiles,
        emptyTileIdx,
        isLoading: false,
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
        moveCounts: state.moveCounts + 1,
      }
    }

    case ACTION_TYPE_CHANGE_IMAGE: {
      if (!payload?.imageSrc) return state

      return {
        ...state,
        imageSrc: payload.imageSrc,
        tiles: [],
        emptyTileIdx: state.tilesPerSide * state.tilesPerSide - 1,
        moveCounts: 0,
        isLoading: true,
        finished: false,
      }
    }

    case ACTION_TYPE_CHANGE_LEVEL: {
      if (!payload?.level || payload?.level == state.tilesPerSide) return state

      const tilesPerSide = payload.level

      return {
        ...state,
        tiles: [],
        tilesPerSide,
        emptyTileIdx: tilesPerSide * tilesPerSide - 1,
        tileSize: DIMENSION / tilesPerSide,
        moveCounts: 0,
        isLoading: true,
        finished: false,
      }
    }

    case ACTION_TYPE_TOGGLE_SHOW_HINT: {
      return {
        ...state,
        showHint: !state.showHint,
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

  const changeImage = useCallback((imageSrc: string) => {
    dispatch({
      type: ACTION_TYPE_CHANGE_IMAGE,
      payload: { imageSrc },
    })
  }, [])

  const changeLevel = useCallback((level: number) => {
    dispatch({
      type: ACTION_TYPE_CHANGE_LEVEL,
      payload: { level },
    })
  }, [])

  const toggleShowHint = useCallback(() => {
    dispatch({
      type: ACTION_TYPE_TOGGLE_SHOW_HINT,
    })
  }, [])

  return { state, newGame, initializeTiles, clickTile, changeImage, changeLevel, toggleShowHint }
}

export default useGameState
