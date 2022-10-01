import produce from 'immer'

export const TOTAL_ROWS = 16
export const TOTAL_COLS = 30
export const TOTAL_MINES = 99

export interface TileState {
  hasMine: boolean
  surroundingMines: number
  isRevealed: boolean
  isFlagged: boolean
  isClickedMine: boolean
}

export const DEFAULT_TILE_STATE = {
  hasMine: false,
  surroundingMines: 0,
  isRevealed: false,
  isFlagged: false,
  isClickedMine: false,
}

export const initMinesweeper = (tiles: TileState[], clickedTileIdx: number) => {
  //   random 99 mines excluding clicked tile and its surrounding tiles
  const mines = createMines(clickedTileIdx)

  tiles = produce(tiles, (draft) => {
    for (const mine of mines) {
      draft[mine].hasMine = true
    }

    // calculate surrounding mines
    for (let i = 0; i < draft.length; i++) {
      let surroundingMines = 0
      const { hasTop, hasBottom, hasLeft, hasRight } =
        checkPossibleSurroundingTiles(i)

      //   top
      if (hasTop && draft[i - TOTAL_COLS].hasMine) {
        surroundingMines++
      }
      //   bottom
      if (hasBottom && draft[i + TOTAL_COLS].hasMine) {
        surroundingMines++
      }
      //   left
      if (hasLeft && draft[i - 1].hasMine) {
        surroundingMines++
      }
      //   right
      if (hasRight && draft[i + 1].hasMine) {
        surroundingMines++
      }
      //   top left
      if (hasTop && hasLeft && draft[i - TOTAL_COLS - 1].hasMine) {
        surroundingMines++
      }
      //   top right
      if (hasTop && hasRight && draft[i - TOTAL_COLS + 1].hasMine) {
        surroundingMines++
      }
      //   bottom left
      if (hasBottom && hasLeft && draft[i + TOTAL_COLS - 1].hasMine) {
        surroundingMines++
      }
      //   bottom right
      if (hasBottom && hasRight && draft[i + TOTAL_COLS + 1].hasMine) {
        surroundingMines++
      }

      draft[i].surroundingMines = surroundingMines
    }
  })

  return expandMineFreeArea(tiles, clickedTileIdx)
}

export const expandMineFreeArea = (
  tiles: TileState[],
  clickedTileIdx: number
) => {
  let tilesToBeRevealed: Set<number> | number[] = new Set()
  let stack: number[] = [clickedTileIdx]

  while (stack.length > 0) {
    const i = stack.pop()

    if (i === undefined || i === null || tilesToBeRevealed.has(i)) continue

    tilesToBeRevealed.add(i)

    if (tiles[i].surroundingMines > 0) continue

    const { hasTop, hasBottom, hasLeft, hasRight } =
      checkPossibleSurroundingTiles(i)

    //   top
    if (hasTop && tileCanBeRevealed(tiles[i - TOTAL_COLS])) {
      stack.push(i - TOTAL_COLS)
    }

    //   bottom
    if (hasBottom && tileCanBeRevealed(tiles[i + TOTAL_COLS])) {
      stack.push(i + TOTAL_COLS)
    }

    //   left
    if (hasLeft && tileCanBeRevealed(tiles[i - 1])) {
      stack.push(i - 1)
    }

    //   right
    if (hasRight && tileCanBeRevealed(tiles[i + 1])) {
      stack.push(i + 1)
    }

    //   top left
    if (hasTop && hasLeft && tileCanBeRevealed(tiles[i - TOTAL_COLS - 1])) {
      stack.push(i - TOTAL_COLS - 1)
    }

    //   top right
    if (hasTop && hasRight && tileCanBeRevealed(tiles[i - TOTAL_COLS + 1])) {
      stack.push(i - TOTAL_COLS + 1)
    }

    //   bottom left
    if (hasBottom && hasLeft && tileCanBeRevealed(tiles[i + TOTAL_COLS - 1])) {
      stack.push(i + TOTAL_COLS - 1)
    }
    //   bottom right
    if (hasBottom && hasRight && tileCanBeRevealed(tiles[i + TOTAL_COLS + 1])) {
      stack.push(i + TOTAL_COLS + 1)
    }
  }

  return produce(tiles, (draft) => {
    for (const i of Array.from(tilesToBeRevealed)) {
      draft[i].isRevealed = true
    }
  })
}

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const createMines = (i: number) => {
  let mines = Array.from(Array(TOTAL_COLS * TOTAL_ROWS).keys())

  // exclude clicked tile and its surrounding tiles then shuffle
  const excludedTiles = [
    i,
    i - 1,
    i + 1,
    i - TOTAL_COLS,
    i - TOTAL_COLS - 1,
    i - TOTAL_COLS + 1,
    i + TOTAL_COLS,
    i + TOTAL_COLS - 1,
    i + TOTAL_COLS + 1,
  ]
  mines = mines.filter((x) => excludedTiles.indexOf(x) < 0)
  shuffleArray(mines)

  // the first 99 tiles would be mines
  mines.splice(TOTAL_MINES)

  return mines
}

const checkPossibleSurroundingTiles = (i: number) => {
  const hasTop = i - TOTAL_COLS >= 0
  const hasBottom = i + TOTAL_COLS < TOTAL_COLS * TOTAL_ROWS
  const hasLeft = i % TOTAL_COLS > 0
  const hasRight = i % TOTAL_COLS !== TOTAL_COLS - 1
  return { hasTop, hasBottom, hasLeft, hasRight }
}

const tileCanBeRevealed = (tile: TileState) => {
  return !tile.hasMine && !tile.isRevealed && !tile.isFlagged
}

export const checkWin = (tiles: TileState[]) => {
  for (const tile of tiles) {
    const { hasMine, isRevealed } = tile
    if (!hasMine && !isRevealed) {
      return false
    }
  }
  return true
}
