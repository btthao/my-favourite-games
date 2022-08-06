import {
  ActiveTilesState,
  getEmptyTiles,
  getRandomEmptyTile,
  getStartingActiveTiles,
  makeTilesBoard,
  TileState,
  getAllTilesPos,
} from '../utils/2048'
import { useCallback, useReducer } from 'react'

const ACTION_TYPE_MOVE_DOWN = 'move-down'
const ACTION_TYPE_MOVE_LEFT = 'move-left'
const ACTION_TYPE_MOVE_RIGHT = 'move-right'
const ACTION_TYPE_MOVE_UP = 'move-up'
const ACTION_TYPE_RESIZE_EVENT = 'resize'
const TOTAL_ROWS = 4
const TOTAL_COLS = 4
const TILE_ANIMATION_DELAY = 70
const ALL_TILES_POS = getAllTilesPos(TOTAL_ROWS, TOTAL_COLS)

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

            // add a merged Tile
            tilesInCol.push({
              value: tilesInCol[i].value * 2,
              isMerged: true,
              position,
              animationDelay: mergedTileAnimationDelay,
            })
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

      //   if there's movement then add a new tile
      if (tilesMoved) {
        const emptyTiles = getEmptyTiles(newActiveTiles, ALL_TILES_POS)
        if (emptyTiles.length) {
          newActiveTiles.push({
            isNew: true,
            value: 2,
            position: getRandomEmptyTile(emptyTiles),
          })
        }
      }

      return {
        ...state,
        activeTiles: newActiveTiles,
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

  return { state, moveDown, moveLeft, moveUp, moveRight, onResize }
}

export default useGameState
