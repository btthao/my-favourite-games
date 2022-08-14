import {
  ActiveTilesState,
  ALL_TILES_POS,
  getStartingActiveTiles,
  makeTilesBoard,
  TileState,
  TILE_ANIMATION_DELAY,
  TOTAL_COLS,
  TOTAL_ROWS,
  updateGameState,
} from 'utils/2048'
import { useCallback, useReducer } from 'react'

const ACTION_TYPE_MOVE_DOWN = 'move-down'
const ACTION_TYPE_MOVE_LEFT = 'move-left'
const ACTION_TYPE_MOVE_RIGHT = 'move-right'
const ACTION_TYPE_MOVE_UP = 'move-up'
const ACTION_TYPE_RESIZE_EVENT = 'resize'
const ACTION_TYPE_NEW_GAME = 'new-game'

interface GameState {
  activeTiles: ActiveTilesState
  score: number
  bestScore: number
  gameOver: boolean
}

const DEFAULT_STATE: GameState = {
  activeTiles: [],
  score: 0,
  bestScore: 0,
  gameOver: false,
}

function reduce(
  state: GameState,
  action: { payload?: any; type: string }
): GameState {
  const { type } = action

  switch (type) {
    case ACTION_TYPE_MOVE_DOWN: {
      const { activeTiles } = state
      if (!activeTiles.length) return state

      let tilesMoved = false
      let score = state.score
      let newActiveTiles: ActiveTilesState = []

      //   put active tiles in a board
      let board = makeTilesBoard(TOTAL_ROWS, TOTAL_COLS, activeTiles)

      // move down => for each column, merge from bottom
      for (let col = 0; col < TOTAL_COLS; col++) {
        let tilesInCol: TileState[] = []

        //   get active tiles in column
        for (let row = 0; row < TOTAL_ROWS; row++) {
          if (board[row][col]) {
            tilesInCol.push(board[row][col])
          }
        }

        //   fill column from bottom
        let i = tilesInCol.length - 1
        let currentRow = TOTAL_ROWS - 1

        while (i > -1 && currentRow > -1) {
          let position = { r: currentRow, c: col }

          if (i > 0 && tilesInCol[i].value == tilesInCol[i - 1]?.value) {
            //  change position of 2 tiles to be merged
            tilesMoved = true

            //   animation delay: wait till old tiles moved to new position
            let mergedTileAnimationDelay =
              Math.abs(tilesInCol[i - 1].position.r - currentRow) *
              TILE_ANIMATION_DELAY

            tilesInCol[i - 1] = {
              ...tilesInCol[i - 1],
              prevPosition: { ...tilesInCol[i - 1].position },
              position,
              toBeRemoved: true,
            }

            tilesInCol[i] = {
              ...tilesInCol[i],
              prevPosition: { ...tilesInCol[i].position },
              position,
              toBeRemoved: true,
            }

            const mergedValue = tilesInCol[i].value * 2

            // add a merged Tile
            tilesInCol.push({
              value: mergedValue,
              isMerged: true,
              position,
              animationDelay: mergedTileAnimationDelay,
            })
            score += mergedValue

            i--
          } else {
            if (!tilesMoved) {
              tilesMoved = tilesInCol[i].position.r != currentRow
            }

            tilesInCol[i] = {
              ...tilesInCol[i],
              prevPosition: { ...tilesInCol[i].position },
              position,
            }
          }

          currentRow--
          i--
        }

        newActiveTiles = [...newActiveTiles, ...tilesInCol]
      }

      const { activeTiles: updatedActiveTiles, gameOver } = updateGameState({
        tilesMoved,
        activeTiles: newActiveTiles,
      })

      return {
        ...state,
        activeTiles: updatedActiveTiles,
        gameOver,
        score,
      }
    }

    case ACTION_TYPE_MOVE_UP: {
      const { activeTiles } = state
      if (!activeTiles.length) return state

      let tilesMoved = false
      let score = state.score
      let newActiveTiles: ActiveTilesState = []

      //   put active tiles in a board
      let board = makeTilesBoard(TOTAL_ROWS, TOTAL_COLS, activeTiles)

      // move up => for each column, merge from top
      for (let col = 0; col < TOTAL_COLS; col++) {
        let tilesInCol: TileState[] = []

        //   get active tiles in column
        for (let row = TOTAL_ROWS - 1; row > -1; row--) {
          if (board[row][col]) {
            tilesInCol.push(board[row][col])
          }
        }

        //   fill column from top
        let i = tilesInCol.length - 1
        let currentRow = 0

        while (i > -1 && currentRow < TOTAL_ROWS) {
          let position = { r: currentRow, c: col }

          if (i > 0 && tilesInCol[i].value == tilesInCol[i - 1]?.value) {
            //  change position of 2 tiles to be merged
            tilesMoved = true

            //   animation delay: wait till old tiles moved to new position
            let mergedTileAnimationDelay =
              Math.abs(tilesInCol[i - 1].position.r - currentRow) *
              TILE_ANIMATION_DELAY

            tilesInCol[i - 1] = {
              ...tilesInCol[i - 1],
              prevPosition: { ...tilesInCol[i - 1].position },
              position,
              toBeRemoved: true,
            }

            tilesInCol[i] = {
              ...tilesInCol[i],
              prevPosition: { ...tilesInCol[i].position },
              position,
              toBeRemoved: true,
            }

            const mergedValue = tilesInCol[i].value * 2

            // add a merged Tile
            tilesInCol.push({
              value: mergedValue,
              isMerged: true,
              position,
              animationDelay: mergedTileAnimationDelay,
            })
            score += mergedValue

            i--
          } else {
            if (!tilesMoved) {
              tilesMoved = tilesInCol[i].position.r != currentRow
            }

            tilesInCol[i] = {
              ...tilesInCol[i],
              prevPosition: { ...tilesInCol[i].position },
              position,
            }
          }

          currentRow++
          i--
        }

        newActiveTiles = [...newActiveTiles, ...tilesInCol]
      }

      const { activeTiles: updatedActiveTiles, gameOver } = updateGameState({
        tilesMoved,
        activeTiles: newActiveTiles,
      })

      return {
        ...state,
        activeTiles: updatedActiveTiles,
        gameOver,
        score,
      }
    }

    case ACTION_TYPE_MOVE_RIGHT: {
      const { activeTiles } = state
      if (!activeTiles.length) return state

      let tilesMoved = false
      let score = state.score
      let newActiveTiles: ActiveTilesState = []

      //   put active tiles in a board
      let board = makeTilesBoard(TOTAL_ROWS, TOTAL_COLS, activeTiles)

      // move right => for each row, merge from right
      for (let row = 0; row < TOTAL_ROWS; row++) {
        let tilesInRow: TileState[] = []

        //   get active tiles in row
        for (let col = 0; col < TOTAL_COLS; col++) {
          if (board[row][col]) {
            tilesInRow.push(board[row][col])
          }
        }

        //   fill row from right
        let i = tilesInRow.length - 1
        let currentCol = TOTAL_COLS - 1

        while (i > -1 && currentCol > -1) {
          let position = { r: row, c: currentCol }

          if (i > 0 && tilesInRow[i].value == tilesInRow[i - 1]?.value) {
            //  change position of 2 tiles to be merged
            tilesMoved = true

            //   animation delay: wait till old tiles moved to new position
            let mergedTileAnimationDelay =
              Math.abs(tilesInRow[i - 1].position.c - currentCol) *
              TILE_ANIMATION_DELAY

            tilesInRow[i - 1] = {
              ...tilesInRow[i - 1],
              prevPosition: { ...tilesInRow[i - 1].position },
              position,
              toBeRemoved: true,
            }

            tilesInRow[i] = {
              ...tilesInRow[i],
              prevPosition: { ...tilesInRow[i].position },
              position,
              toBeRemoved: true,
            }
            const mergedValue = tilesInRow[i].value * 2

            // add a merged Tile
            tilesInRow.push({
              value: mergedValue,
              isMerged: true,
              position,
              animationDelay: mergedTileAnimationDelay,
            })
            score += mergedValue

            i--
          } else {
            if (!tilesMoved) {
              tilesMoved = tilesInRow[i].position.c != currentCol
            }

            tilesInRow[i] = {
              ...tilesInRow[i],
              prevPosition: { ...tilesInRow[i].position },
              position,
            }
          }

          currentCol--
          i--
        }

        newActiveTiles = [...newActiveTiles, ...tilesInRow]
      }

      const { activeTiles: updatedActiveTiles, gameOver } = updateGameState({
        tilesMoved,
        activeTiles: newActiveTiles,
      })

      return {
        ...state,
        activeTiles: updatedActiveTiles,
        gameOver,
        score,
      }
    }
    case ACTION_TYPE_MOVE_LEFT: {
      const { activeTiles } = state
      if (!activeTiles.length) return state

      let tilesMoved = false
      let score = state.score
      let newActiveTiles: ActiveTilesState = []

      //   put active tiles in a board
      let board = makeTilesBoard(TOTAL_ROWS, TOTAL_COLS, activeTiles)

      // move left => for each row, merge from left
      for (let row = 0; row < TOTAL_ROWS; row++) {
        let tilesInRow: TileState[] = []

        //   get active tiles in row
        for (let col = TOTAL_COLS - 1; col > -1; col--) {
          if (board[row][col]) {
            tilesInRow.push(board[row][col])
          }
        }

        //   fill row from left
        let i = tilesInRow.length - 1
        let currentCol = 0

        while (i > -1 && currentCol < TOTAL_COLS) {
          let position = { r: row, c: currentCol }

          if (i > 0 && tilesInRow[i].value == tilesInRow[i - 1]?.value) {
            //  change position of 2 tiles to be merged
            tilesMoved = true

            //   animation delay: wait till old tiles moved to new position
            let mergedTileAnimationDelay =
              Math.abs(tilesInRow[i - 1].position.c - currentCol) *
              TILE_ANIMATION_DELAY

            tilesInRow[i - 1] = {
              ...tilesInRow[i - 1],
              prevPosition: { ...tilesInRow[i - 1].position },
              position,
              toBeRemoved: true,
            }

            tilesInRow[i] = {
              ...tilesInRow[i],
              prevPosition: { ...tilesInRow[i].position },
              position,
              toBeRemoved: true,
            }

            const mergedValue = tilesInRow[i].value * 2

            // add a merged Tile
            tilesInRow.push({
              value: mergedValue,
              isMerged: true,
              position,
              animationDelay: mergedTileAnimationDelay,
            })
            score += mergedValue

            i--
          } else {
            if (!tilesMoved) {
              tilesMoved = tilesInRow[i].position.c != currentCol
            }

            tilesInRow[i] = {
              ...tilesInRow[i],
              prevPosition: { ...tilesInRow[i].position },
              position,
            }
          }

          currentCol++
          i--
        }

        newActiveTiles = [...newActiveTiles, ...tilesInRow]
      }

      const { activeTiles: updatedActiveTiles, gameOver } = updateGameState({
        tilesMoved,
        activeTiles: newActiveTiles,
      })

      return {
        ...state,
        activeTiles: updatedActiveTiles,
        gameOver,
        score,
      }
    }

    case ACTION_TYPE_RESIZE_EVENT: {
      const { activeTiles } = state
      if (!activeTiles.length) return state

      let newActiveTiles = []
      for (const tile of activeTiles) {
        if (tile.toBeRemoved) continue
        newActiveTiles.push({
          ...tile,
          isNew: false,
          isMerged: false,
          prevPosition: null,
          animationDelay: null,
        })
      }

      return {
        ...state,
        activeTiles: newActiveTiles,
      }
    }

    case ACTION_TYPE_NEW_GAME: {
      return DEFAULT_STATE
    }

    default: {
      return state
    }
  }
}

const useGameState = () => {
  const [state, dispatch] = useReducer(reduce, null, () => {
    const activeTiles = getStartingActiveTiles(ALL_TILES_POS)
    //   get local storage for best score or current score
    return {
      ...DEFAULT_STATE,
      activeTiles,
    }
  })

  const moveDown = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_DOWN })
  }, [])

  const moveUp = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_UP })
  }, [])

  const moveRight = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_RIGHT })
  }, [])

  const moveLeft = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_LEFT })
  }, [])

  const onResize = useCallback(() => {
    dispatch({ type: ACTION_TYPE_RESIZE_EVENT })
  }, [])

  const newGame = useCallback(() => {
    dispatch({ type: ACTION_TYPE_NEW_GAME })
  }, [])

  return { state, moveDown, moveLeft, moveUp, moveRight, onResize, newGame }
}

export { TILE_ANIMATION_DELAY, TOTAL_COLS }

export default useGameState
