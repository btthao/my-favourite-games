import produce from 'immer'
import { selectRandomFromList } from './helpers'

export type TilePosition = {
  r: number
  c: number
}

export interface BasicTile {
  position: TilePosition
}

export const getAllTilePositions = (row: number, col: number): TilePosition[] => {
  let positions: TilePosition[] = []

  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      positions.push({ r, c })
    }
  }

  return positions
}

export const getRandomTilePositionFromList = (positions: TilePosition[]): TilePosition => {
  return selectRandomFromList(positions)
}

export const getAllEmptyTilePositions = (activeTiles: BasicTile[], allPositions: TilePosition[]): TilePosition[] => {
  let emptyTilePositions = allPositions

  for (const tile of activeTiles) {
    emptyTilePositions = emptyTilePositions.filter((currTile) => currTile.c !== tile.position.c || currTile.r !== tile.position.r)
  }

  return emptyTilePositions
}

export const getMultipleRandomEmptyTiles = (emptyTiles: TilePosition[], numberOfTilesWanted: number): BasicTile[] => {
  let output: BasicTile[] = []

  while (output.length < numberOfTilesWanted) {
    const { r, c } = getRandomTilePositionFromList(emptyTiles)
    emptyTiles = emptyTiles.filter((tile) => tile.c !== c || tile.r !== r)
    output.push({
      position: { r, c },
    })
  }

  return output
}

export const putTilesInBoard = <T extends BasicTile>(row: number, col: number, tiles: T[], callback?: (tile: T) => boolean, defaultTileProps?: Partial<T>): T[][] => {
  let board: T[][] = new Array(row).fill(new Array(col).fill(null))

  board = produce<T[][], T[][]>(board, (draft) => {
    for (const tile of tiles) {
      if (callback && !callback(tile)) continue

      const { r, c } = tile.position
      draft[r][c] = {
        ...tile,
        ...defaultTileProps,
      }
    }
  })

  return board
}

export const findActiveTileAtClickedPosition = <T extends BasicTile>(clickedPos: TilePosition, activeTiles: T[], callback: (tile: T) => boolean) => {
  let clickedTileIdx = -1

  const clickedTile = activeTiles.filter((tile, i) => {
    if (tile.position.c == clickedPos.c && tile.position.r == clickedPos.r && callback(tile)) {
      clickedTileIdx = i
      return true
    }
    return false
  })

  return { clickedTileIdx, clickedTile: clickedTile.length ? clickedTile[0] : null }
}
