import produce from 'immer'

export const TOTAL_ROWS = 16
export const TOTAL_COLS = 30
export const TOTAL_MINES = 99

export interface TileState {
  hasMine: boolean
  surroundingMines: number
  isRevealed: boolean
  isFlagged: boolean
}

const DEFAULT_TILE_STATE = {
  hasMine: false,
  surroundingMines: 0,
  isRevealed: false,
  isFlagged: false,
}

// initialize game

export const initMinesweeper = (clickedTileIdx: number) => {
  let tiles: TileState[] = new Array(TOTAL_COLS * TOTAL_ROWS).fill(
    DEFAULT_TILE_STATE
  )

  //   random 99 mines excluding clicked tile
  const mines = createMines(clickedTileIdx)

  tiles = produce(tiles, (draft) => {
    for (const mine of mines) {
      draft[mine].hasMine = true
    }

    // calculate surrounding mines
    for (let i = 0; i < draft.length; i++) {
      let surroundingMines = 0
      const hasTop = i - TOTAL_COLS >= 0
      const hasBottom = i + TOTAL_COLS < TOTAL_COLS * TOTAL_ROWS
      const hasLeft = i % TOTAL_COLS > 0
      const hasRight = i % TOTAL_COLS !== TOTAL_COLS - 1
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

  return tiles
}

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const createMines = (clickedTileIdx: number) => {
  let mines = Array.from(Array(TOTAL_COLS * TOTAL_ROWS).keys())

  // exclude clicked tile then shuffle
  mines.splice(clickedTileIdx, 1)
  shuffleArray(mines)

  // the first 99 tiles would be mines
  mines.splice(TOTAL_MINES)

  return mines
}
