import produce from 'immer'
import {
  BasicTile,
  getAllEmptyTilesPositions,
  getAllTilesPositions,
  getMultipleRandomEmptyTiles,
  getRandomEmptyTilePosition,
  Position,
  putTilesInBoard,
} from './tile'

export interface TileState extends BasicTile {
  value: number
  isNew?: boolean
  isMerged?: boolean
  toBeRemoved?: boolean
  prevPosition?: Position | null
  animationDelay?: number | null
}

export type ActiveTilesState = TileState[]

// constants
export const TOTAL_ROWS = 4
export const TOTAL_COLS = 4
export const TILE_ANIMATION_DELAY = 70
export const ALL_TILES_POS = getAllTilesPositions(TOTAL_ROWS, TOTAL_COLS)

// helper functions
export const getStartingActiveTiles = (): ActiveTilesState => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 2)

  return tiles.map((tile) => {
    return { ...tile, value: 2, isNew: true }
  })
}

export const makeTilesBoard = (
  row: number,
  col: number,
  activeTiles: ActiveTilesState
): TileState[][] => {
  const callback = (tile: TileState) => {
    return !tile.toBeRemoved
  }

  const resetTileState: Partial<TileState> = {
    isNew: false,
    isMerged: false,
    prevPosition: null,
    animationDelay: null,
  }

  return putTilesInBoard<TileState>(
    row,
    col,
    activeTiles,
    callback,
    resetTileState
  )
}

export const isGameOver = (activeTiles: ActiveTilesState): boolean => {
  let board = makeTilesBoard(TOTAL_ROWS, TOTAL_COLS, activeTiles)
  for (let r = 0; r < TOTAL_ROWS; r++) {
    for (let c = 0; c < TOTAL_COLS; c++) {
      if (!board[r][c]) return false
      let value = board[r][c].value
      if (c > 0 && board[r][c - 1]?.value == value) return false
      if (c < TOTAL_COLS - 1 && board[r][c + 1]?.value == value) return false
      if (r > 0 && board[r - 1][c]?.value == value) return false
      if (r < TOTAL_ROWS - 1 && board[r + 1][c]?.value == value) return false
    }
  }

  return true
}

export const updateGameState = ({
  tilesMoved,
  activeTiles,
}: {
  tilesMoved: boolean
  activeTiles: ActiveTilesState
}) => {
  // add new tile if game not over, return gameover state
  if (tilesMoved) {
    const emptyTiles = getAllEmptyTilesPositions(activeTiles, ALL_TILES_POS)
    if (emptyTiles.length) {
      activeTiles = [
        ...activeTiles,
        {
          isNew: true,
          value: 2,
          position: getRandomEmptyTilePosition(emptyTiles),
        },
      ]
    }
  }

  return { activeTiles, gameOver: isGameOver(activeTiles) }
}

export const mergeTiles = ({
  tiles,
  position,
  idx,
  mergedValue,
  animationDelay,
}: {
  tiles: TileState[]
  position: Position
  idx: number
  mergedValue: number
  animationDelay: number
}): TileState[] => {
  // delay merge animation until tile has reached new position
  tiles = produce(tiles, (draft) => {
    let count = 0
    while (++count <= 2) {
      draft[idx] = {
        ...draft[idx],
        prevPosition: { ...draft[idx].position },
        position,
        toBeRemoved: true,
      }
      idx--
    }
    draft.push({
      value: mergedValue,
      isMerged: true,
      position,
      animationDelay,
    })
  })

  return tiles
}

// only show active tiles during resize event => prevent transition
// if from previous game in localstorage => show pop in animation for all tiles
export const filterActiveTiles = (
  activeTiles: ActiveTilesState,
  fromPreviousGame: boolean
): TileState[] => {
  let newActiveTiles: TileState[] = []
  for (const tile of activeTiles) {
    if (tile.toBeRemoved) continue
    newActiveTiles.push({
      ...tile,
      isNew: fromPreviousGame,
      isMerged: false,
      prevPosition: null,
      animationDelay: null,
    })
  }

  return newActiveTiles
}
