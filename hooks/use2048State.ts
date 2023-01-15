import { useCallback, useReducer } from 'react'
import { ActiveTiles, getStartingTiles, makeTilesBoard, TileState, TILE_ANIMATION_DELAY, TOTAL_COLS, TOTAL_ROWS, addNewTileToActiveTilesList, isGameOver, filterTilesForNewSession, updateTilePosition } from 'utils/2048'

const ACTION_TYPE_MOVE_VERTICAL = 'move-vertical'
const ACTION_TYPE_MOVE_HORIZONTAL = 'move-horizontal'
const ACTION_TYPE_NEW_GAME = 'new-game'
const DIRECTION_UP = 'up'
const DIRECTION_DOWN = 'down'
const DIRECTION_RIGHT = 'right'
const DIRECTION_LEFT = 'left'

export interface GameState {
  activeTiles: ActiveTiles
  score: number
  bestScore: number
  gameOver: boolean
  moveCount: number
}

export const DEFAULT_GAME_STATE: GameState = {
  activeTiles: [],
  score: 0,
  bestScore: 0,
  gameOver: false,
  moveCount: 0,
}

function reduce(state: GameState, action: { payload?: string; type: string }): GameState {
  const { type, payload } = action

  switch (type) {
    case ACTION_TYPE_MOVE_VERTICAL: {
      if (!state.activeTiles.length) return state

      let moveUp = payload == DIRECTION_UP

      let needNewTile = false
      let score = state.score
      let newActiveTiles: ActiveTiles = []

      let board = makeTilesBoard(state.activeTiles)

      for (let col = 0; col < TOTAL_COLS; col++) {
        let tilesInCol: TileState[] = []

        for (let row = 0; row < TOTAL_ROWS; row++) {
          if (board[row][col]) {
            tilesInCol.push(board[row][col])
          }
        }

        if (moveUp) {
          tilesInCol.reverse()
        }

        let currentRow = moveUp ? 0 : TOTAL_ROWS - 1

        for (let i = tilesInCol.length - 1; i >= 0; i--) {
          if (currentRow < 0 || currentRow >= TOTAL_ROWS) break

          const currentPosition = { r: currentRow, c: col }

          const currentTileMatchAdjacentTile: boolean = i > 0 && tilesInCol[i].value == tilesInCol[i - 1]?.value

          const tileMovesToNewPosition: boolean = tilesInCol[i].position.r != currentRow

          if (tileMovesToNewPosition || currentTileMatchAdjacentTile) {
            needNewTile = true
          }

          if (currentTileMatchAdjacentTile) {
            const mergedTileValue = tilesInCol[i].value * 2
            const adjacentTileRow = tilesInCol[i - 1].position.r

            tilesInCol[i] = { ...updateTilePosition(tilesInCol[i], currentPosition), toBeRemoved: true }
            tilesInCol[i - 1] = { ...updateTilePosition(tilesInCol[i - 1], currentPosition), toBeRemoved: true }

            const newTileWithMergedValue = {
              value: mergedTileValue,
              isMerged: true,
              position: currentPosition,
              animationDelay: Math.abs(adjacentTileRow - currentRow) * TILE_ANIMATION_DELAY,
            }

            tilesInCol.push(newTileWithMergedValue)

            score += mergedTileValue

            // skip adjacent tile
            i--
          } else {
            tilesInCol[i] = updateTilePosition(tilesInCol[i], currentPosition)
          }

          if (moveUp) {
            currentRow++
          } else {
            currentRow--
          }
        }

        newActiveTiles.push(...tilesInCol)
      }

      if (needNewTile) {
        newActiveTiles = addNewTileToActiveTilesList(newActiveTiles)
      }

      const gameOver = isGameOver(newActiveTiles)

      return {
        ...state,
        gameOver,
        score,
        activeTiles: newActiveTiles,
        bestScore: Math.max(score, state.bestScore),
        moveCount: state.moveCount + 1,
      }
    }

    case ACTION_TYPE_MOVE_HORIZONTAL: {
      if (!state.activeTiles.length) return state

      let moveLeft = payload == DIRECTION_LEFT

      let needNewTile = false
      let score = state.score
      let newActiveTiles: ActiveTiles = []

      let board = makeTilesBoard(state.activeTiles)

      for (let row = 0; row < TOTAL_ROWS; row++) {
        let tilesInRow: TileState[] = []

        for (let col = 0; col < TOTAL_COLS; col++) {
          if (board[row][col]) {
            tilesInRow.push(board[row][col])
          }
        }

        if (moveLeft) {
          tilesInRow.reverse()
        }

        let currentCol = moveLeft ? 0 : TOTAL_COLS - 1

        for (let i = tilesInRow.length - 1; i >= 0; i--) {
          if (currentCol < 0 || currentCol >= TOTAL_COLS) break

          const currentPosition = { r: row, c: currentCol }

          const currentTileMatchAdjacentTile: boolean = i > 0 && tilesInRow[i].value == tilesInRow[i - 1]?.value

          const tileMovesToNewPosition: boolean = tilesInRow[i].position.c != currentCol

          if (tileMovesToNewPosition || currentTileMatchAdjacentTile) {
            needNewTile = true
          }

          if (currentTileMatchAdjacentTile) {
            const mergedTileValue = tilesInRow[i].value * 2
            const adjacentTileCol = tilesInRow[i - 1].position.c

            tilesInRow[i] = { ...updateTilePosition(tilesInRow[i], currentPosition), toBeRemoved: true }
            tilesInRow[i - 1] = { ...updateTilePosition(tilesInRow[i - 1], currentPosition), toBeRemoved: true }

            const newTileWithMergedValue = {
              value: mergedTileValue,
              isMerged: true,
              position: currentPosition,
              animationDelay: Math.abs(adjacentTileCol - currentCol) * TILE_ANIMATION_DELAY,
            }

            tilesInRow.push(newTileWithMergedValue)

            score += mergedTileValue

            // skip adjacent tile
            i--
          } else {
            tilesInRow[i] = updateTilePosition(tilesInRow[i], currentPosition)
          }

          if (moveLeft) {
            currentCol++
          } else {
            currentCol--
          }
        }

        newActiveTiles.push(...tilesInRow)
      }

      if (needNewTile) {
        newActiveTiles = addNewTileToActiveTilesList(newActiveTiles)
      }

      const gameOver = isGameOver(newActiveTiles)

      return {
        ...state,
        gameOver,
        score,
        activeTiles: newActiveTiles,
        bestScore: Math.max(score, state.bestScore),
        moveCount: state.moveCount + 1,
      }
    }

    case ACTION_TYPE_NEW_GAME: {
      return {
        ...DEFAULT_GAME_STATE,
        activeTiles: getStartingTiles(),
        bestScore: state.bestScore,
      }
    }

    default: {
      return state
    }
  }
}

const useGameState = (initialState: GameState) => {
  const [state, dispatch] = useReducer(reduce, null, () => {
    const { activeTiles, gameOver, bestScore } = initialState
    if (activeTiles?.length && !gameOver) {
      return {
        ...initialState,
        activeTiles: filterTilesForNewSession(activeTiles),
      }
    }
    return {
      ...DEFAULT_GAME_STATE,
      activeTiles: getStartingTiles(),
      bestScore,
    }
  })

  const moveDown = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_VERTICAL, payload: DIRECTION_DOWN })
  }, [])

  const moveUp = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_VERTICAL, payload: DIRECTION_UP })
  }, [])

  const moveRight = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_HORIZONTAL, payload: DIRECTION_RIGHT })
  }, [])

  const moveLeft = useCallback(() => {
    dispatch({ type: ACTION_TYPE_MOVE_HORIZONTAL, payload: DIRECTION_LEFT })
  }, [])

  const newGame = useCallback(() => {
    dispatch({ type: ACTION_TYPE_NEW_GAME })
  }, [])

  return { state, moveDown, moveLeft, moveUp, moveRight, newGame }
}

export default useGameState
