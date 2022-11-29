import produce from 'immer'
import { selectRandomFromList } from './helpers'

export type Position = {
  r: number
  c: number
}

export interface BasicTile {
  position: Position
}

export const getAllTilesPositions = (row: number, col: number): Position[] => {
  let tiles: Position[] = []

  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      tiles.push({ r, c })
    }
  }

  return tiles
}

export const getRandomEmptyTilePosition = (
  emptyTiles: Position[]
): Position => {
  return selectRandomFromList(emptyTiles)
}

export const getAllEmptyTilesPositions = (
  activeTiles: BasicTile[],
  allTiles: Position[]
): Position[] => {
  let emptyTiles = allTiles

  for (const tile of activeTiles) {
    emptyTiles = emptyTiles.filter(
      (currTile) =>
        currTile.c !== tile.position.c || currTile.r !== tile.position.r
    )
  }

  return emptyTiles
}

export const getMultipleRandomEmptyTiles = (
  emptyTiles: Position[],
  number: number
): BasicTile[] => {
  let output: BasicTile[] = []

  while (output.length < number) {
    const { r, c } = getRandomEmptyTilePosition(emptyTiles)
    emptyTiles = emptyTiles.filter((tile) => tile.c !== c || tile.r !== r)
    output.push({
      position: { r, c },
    })
  }

  return output
}

export const putTilesInBoard = <T extends BasicTile>(
  row: number,
  col: number,
  tiles: T[],
  callback?: (tile: T) => boolean,
  overwriteProps?: Partial<T>
): T[][] => {
  let board: T[][] = new Array(row).fill(new Array(col).fill(null))

  board = produce<T[][], T[][]>(board, (draft) => {
    for (const tile of tiles) {
      if (callback && !callback(tile)) continue

      const { r, c } = tile.position
      draft[r][c] = {
        ...tile,
        ...overwriteProps,
      }
    }
  })

  return board
}

export const checkClickOnActiveTile = <T extends BasicTile>(
  position: Position,
  activeTiles: T[],
  callback: (tile: T) => boolean = () => {
    return true
  }
) => {
  let idx = -1

  const clickedTile = activeTiles.filter((tile, i) => {
    if (
      tile.position.c == position.c &&
      tile.position.r == position.r &&
      callback(tile)
    ) {
      idx = i
      return true
    }
    return false
  })

  return { idx, clickedTile: clickedTile.length ? clickedTile[0] : null }
}
