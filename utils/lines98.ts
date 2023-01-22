import produce from 'immer'
import { selectRandomFromList } from './helpers'
import { BasicTile, getAllTilePositions, getMultipleRandomEmptyTiles, putTilesInBoard, TilePosition } from './tile'

export const colors = ['#19b05f', '#9a62e3', '#2fadcc', '#e636a8', '#9D2D18', '#F6D102']
export type BallColor = typeof colors[number]

export interface BallState extends BasicTile {
  color: BallColor
  isActive: boolean
  isSelected: boolean
  isMoving: boolean
  isGrowing: boolean
  toBeRemoved: boolean
  size: number
  canvasPosition: {
    x: number
    y: number
    originalX: number
    originalY: number
  }
  movingDirection: {
    x: 1 | -1
    y: 1 | -1
  }
  movingPath?: { x: number; y: number }[]
}

// Constants
export const DIMENSION = 495
export const TILES_PER_SIDE = 9
export const ALL_TILES_POS = getAllTilePositions(TILES_PER_SIDE, TILES_PER_SIDE)
export const BALL_BOUNCE_SPEED = 0.25
export const BIG_BALL_SIZE = DIMENSION / (1.45 * TILES_PER_SIDE)
export const SMALL_BALL_SIZE = DIMENSION / (4 * TILES_PER_SIDE)

// helper functions
export const clickedOnActiveBall = (clickedPos: TilePosition, activeBalls: BallState[]) => {
  for (const ball of activeBalls) {
    if (ball.position.c == clickedPos.c && ball.position.r == clickedPos.r && ball.isActive) {
      return true
    }
  }

  return false
}

export const cancelAnimationFromPreviousSession = (balls: BallState[]) => {
  const resetBalls = produce(balls, (draft) => {
    for (let i = 0; i < draft.length; i++) {
      if (draft[i].isSelected) {
        draft[i].canvasPosition.x = draft[i].canvasPosition.originalX
        draft[i].canvasPosition.y = draft[i].canvasPosition.originalY
      }

      draft[i].isSelected = false
      draft[i].isGrowing = false
      draft[i].isMoving = false
    }
  })

  return resetBalls
}

export const getStartingBalls = (): BallState[] => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 10)
  const activeBallsCount = 7

  return tiles.map((tile, idx) => {
    const ball = createBall(tile.position, idx < activeBallsCount)
    return ball
  })
}

export const createBall = (position: TilePosition, isActive: boolean, defaultValue?: Partial<BallState>): BallState => {
  const { x, y } = getCanvasPosition(position)
  return {
    position,
    isActive,
    isSelected: false,
    isMoving: false,
    isGrowing: false,
    toBeRemoved: false,
    color: selectRandomFromList(colors),
    canvasPosition: {
      x,
      y,
      originalX: x,
      originalY: y,
    },
    size: getBallSize(isActive),
    movingDirection: {
      x: 1,
      y: 1,
    },
    ...defaultValue,
  }
}

export const getBallSize = (isActive: boolean) => {
  return isActive ? BIG_BALL_SIZE : SMALL_BALL_SIZE
}

export const getCanvasPosition = (position: TilePosition) => {
  return { x: ((position.c + 0.5) * DIMENSION) / TILES_PER_SIDE, y: ((position.r + 0.5) * DIMENSION) / TILES_PER_SIDE }
}

export const findConsecutiveBalls = (balls: BallState[]): Record<string, string> => {
  const board = putTilesInBoard(
    TILES_PER_SIDE,
    TILES_PER_SIDE,
    balls.filter((b) => b.isActive)
  )

  let consecutiveBalls: TilePosition[] = []

  for (let r = 0; r < TILES_PER_SIDE; r++) {
    for (let c = 0; c < TILES_PER_SIDE; c++) {
      if (!board[r][c]?.isActive) continue

      const currentColor = board[r][c].color

      let ballsOfSameColor: TilePosition[] = [board[r][c].position]

      let counts: Record<string, { n: number; ballsPositions: TilePosition[] }> = {
        horizontal: {
          n: 1,
          ballsPositions: [],
        },
        vertical: {
          n: 1,
          ballsPositions: [],
        },
        diagonalUp: {
          n: 1,
          ballsPositions: [],
        },
        diagonalDown: {
          n: 1,
          ballsPositions: [],
        },
      }

      // go right
      while (c + counts.horizontal.n < TILES_PER_SIDE) {
        const { color, position } = board[r][c + counts.horizontal.n] || {}
        if (color !== currentColor) break
        counts.horizontal.n++
        counts.horizontal.ballsPositions.push(position)
      }

      // go down
      while (r + counts.vertical.n < TILES_PER_SIDE) {
        const { color, position } = board[r + counts.vertical.n][c] || {}
        if (color !== currentColor) break
        counts.vertical.n++
        counts.vertical.ballsPositions.push(position)
      }

      // go diagonal down
      while (r + counts.diagonalDown.n < TILES_PER_SIDE && c + counts.diagonalDown.n < TILES_PER_SIDE) {
        const { color, position } = board[r + counts.diagonalDown.n][c + counts.diagonalDown.n] || {}
        if (color !== currentColor) break
        counts.diagonalDown.n++
        counts.diagonalDown.ballsPositions.push(position)
      }

      // go diagonal up
      while (r - counts.diagonalUp.n >= 0 && c + counts.diagonalUp.n < TILES_PER_SIDE) {
        const { color, position } = board[r - counts.diagonalUp.n][c + counts.diagonalUp.n] || {}
        if (color !== currentColor) break
        counts.diagonalUp.n++
        counts.diagonalUp.ballsPositions.push(position)
      }

      for (const line of Object.values(counts)) {
        if (line.n >= 5) {
          ballsOfSameColor.push(...line.ballsPositions)
        }
      }

      if (ballsOfSameColor.length >= 5) {
        consecutiveBalls.push(...ballsOfSameColor)
      }
    }
  }

  return consecutiveBalls.reduce((prev, curr) => {
    const positionStr = curr.c + '-' + curr.r
    return { ...prev, [positionStr]: positionStr }
  }, {})
}
