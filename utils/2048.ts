import produce from 'immer'

export interface TilePos {
  r: number
  c: number
}

export interface TileState {
  value: number
  isNew?: boolean
  isMerged?: boolean
  toBeRemoved?: boolean
  position: TilePos
  prevPosition?: TilePos | null
  animationDelay?: number | null
}

export type ActiveTilesState = TileState[]

export const getAllTilesPos = (row: number, col: number) => {
  let tiles: TilePos[] = []

  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      tiles.push({ r, c })
    }
  }

  return tiles
}

export const TOTAL_ROWS = 4
export const TOTAL_COLS = 4
export const TILE_ANIMATION_DELAY = 70
export const ALL_TILES_POS = getAllTilesPos(TOTAL_ROWS, TOTAL_COLS)

export const getRandomEmptyTile = (tiles: TilePos[]) => {
  return tiles[Math.floor(Math.random() * tiles.length)]
}

export const getEmptyTiles = (
  activeTiles: ActiveTilesState,
  allTiles: TilePos[]
) => {
  let emptyTiles = allTiles
  for (const tile of activeTiles) {
    emptyTiles = emptyTiles.filter(
      (currTile) =>
        currTile.c !== tile.position.c || currTile.r !== tile.position.r
    )
  }

  return emptyTiles
}

export const getStartingActiveTiles = (emptyTiles: TilePos[]) => {
  let activeTiles: ActiveTilesState = []

  while (activeTiles.length < 2) {
    const { r, c } = getRandomEmptyTile(emptyTiles)
    emptyTiles = emptyTiles.filter((tile) => tile.c !== c || tile.r !== r)
    activeTiles.push({
      value: 2,
      isNew: true,
      position: { r, c },
    })
  }

  return activeTiles
}

export const makeTilesBoard = (
  row: number,
  col: number,
  activeTiles: ActiveTilesState
) => {
  let board: TileState[][] = new Array(row).fill(new Array(col).fill(null))

  board = produce(board, (draft) => {
    for (const tile of activeTiles) {
      // remove tiles with toBeRemoved = true
      if (tile.toBeRemoved) continue
      const { r, c } = tile.position
      draft[r][c] = {
        ...tile,
        isNew: false,
        isMerged: false,
        prevPosition: null,
        animationDelay: null,
      }
    }
  })

  return board
}

export const isGameOver = (activeTiles: ActiveTilesState) => {
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
  if (tilesMoved) {
    const emptyTiles = getEmptyTiles(activeTiles, ALL_TILES_POS)
    if (emptyTiles.length) {
      activeTiles = [
        ...activeTiles,
        {
          isNew: true,
          value: 2,
          position: getRandomEmptyTile(emptyTiles),
        },
      ]
    }
  }

  return { activeTiles, gameOver: isGameOver(activeTiles) }
}
