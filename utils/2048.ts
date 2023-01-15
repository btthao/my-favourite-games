import { BasicTile, getAllEmptyTilePositions, getAllTilePositions, getMultipleRandomEmptyTiles, getRandomTilePositionFromList, TilePosition, putTilesInBoard } from './tile'

export interface TileState extends BasicTile {
  value: number
  isNew?: boolean
  isMerged?: boolean
  toBeRemoved?: boolean
  prevPosition?: TilePosition | null
  animationDelay?: number | null
}

export type ActiveTiles = TileState[]

// constants
export const TOTAL_ROWS = 4
export const TOTAL_COLS = 4
export const TILE_ANIMATION_DELAY = 70
export const TILE_GAP = 2
export const ALL_TILES_POS = getAllTilePositions(TOTAL_ROWS, TOTAL_COLS)

// helper functions
export const getStartingTiles = (): ActiveTiles => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 2)

  return tiles.map((tile) => {
    return { ...tile, value: 2, isNew: true }
  })
}

export const makeTilesBoard = (activeTiles: ActiveTiles): TileState[][] => {
  const callback = (tile: TileState) => {
    return !tile.toBeRemoved
  }

  const resetTileState: Partial<TileState> = {
    isNew: false,
    isMerged: false,
    prevPosition: null,
    animationDelay: null,
  }

  return putTilesInBoard<TileState>(TOTAL_ROWS, TOTAL_COLS, activeTiles, callback, resetTileState)
}

export const isGameOver = (activeTiles: ActiveTiles): boolean => {
  let board = makeTilesBoard(activeTiles)

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

export const addNewTileToActiveTilesList = (activeTiles: ActiveTiles) => {
  const emptyTiles = getAllEmptyTilePositions(activeTiles, ALL_TILES_POS)
  const hasEmptyTile = emptyTiles.length > 0

  if (hasEmptyTile) {
    const newTile = {
      isNew: true,
      value: 2,
      position: getRandomTilePositionFromList(emptyTiles),
    }
    activeTiles = [...activeTiles, newTile]
  }

  return activeTiles
}

export const updateTilePosition = (tile: TileState, newPosition: TilePosition) => {
  return {
    ...tile,
    prevPosition: { ...tile.position },
    position: newPosition,
  }
}

export const filterTilesForNewSession = (activeTiles: ActiveTiles) => {
  let newActiveTiles: ActiveTiles = []

  for (const tile of activeTiles) {
    if (tile.toBeRemoved) continue
    newActiveTiles.push({
      ...tile,
      isNew: true,
      isMerged: false,
      prevPosition: null,
      animationDelay: null,
    })
  }

  return newActiveTiles
}
