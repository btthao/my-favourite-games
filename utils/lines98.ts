import { selectRandomFromList } from './helpers'
import { BasicTile, checkClickOnActiveTile, getAllTilesPositions, getMultipleRandomEmptyTiles, Position, putTilesInBoard } from './tile'

export const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'pink']
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
}

// Constants
export const DIMENSION = 495
export const SIZE = 9
export const ALL_TILES_POS = getAllTilesPositions(SIZE, SIZE)
export const BALL_BOUNCE_SPEED = 0.25
export const BALL_MOVE_SPEED = 12

// helper functions
export const getStartingBalls = (): BallState[] => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 10)

  return tiles.map((tile, idx) => {
    const ball = createBall(tile.position, idx < 7)
    return ball
  })
}

export const createBall = (position: Position, isActive: boolean, defaultValue?: Partial<BallState>): BallState => {
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
  return DIMENSION / ((isActive ? 1.4 : 4.5) * SIZE)
}

export const isClickOnActiveBall = (position: Position, balls: BallState[]) => {
  const { clickedTile } = checkClickOnActiveTile(position, balls, (ball: BallState) => ball.isActive)
  return clickedTile !== null
}

export const getCanvasPosition = (position: Position) => {
  return { x: ((position.c + 0.5) * DIMENSION) / SIZE, y: ((position.r + 0.5) * DIMENSION) / SIZE }
}

export const findConsecutiveBalls = (balls: BallState[]) => {
  const board = putTilesInBoard(
    SIZE,
    SIZE,
    balls.filter((b) => b.isActive)
  )

  let ballsToRemove: Position[] = []

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]?.isActive) continue

      //   only check active balls
      const currentColor = board[r][c].color

      let ballsOfSameColor: Position[] = [board[r][c].position]

      let counts: Record<string, { n: number; ballsPositions: Position[] }> = {
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

      // in each direction, find active ball of same color

      // go right
      while (c + counts.horizontal.n < SIZE) {
        const { color, position } = board[r][c + counts.horizontal.n] || {}
        if (color !== currentColor) break
        counts.horizontal.n++
        counts.horizontal.ballsPositions.push(position)
      }

      // go down
      while (r + counts.vertical.n < SIZE) {
        const { color, position } = board[r + counts.vertical.n][c] || {}
        if (color !== currentColor) break
        counts.vertical.n++
        counts.vertical.ballsPositions.push(position)
      }

      // go diagonal down
      while (r + counts.diagonalDown.n < SIZE && c + counts.diagonalDown.n < SIZE) {
        const { color, position } = board[r + counts.diagonalDown.n][c + counts.diagonalDown.n] || {}
        if (color !== currentColor) break
        counts.diagonalDown.n++
        counts.diagonalDown.ballsPositions.push(position)
      }

      // go diagonal up
      while (r - counts.diagonalUp.n >= 0 && c + counts.diagonalUp.n < SIZE) {
        const { color, position } = board[r - counts.diagonalUp.n][c + counts.diagonalUp.n] || {}
        if (color !== currentColor) break
        counts.diagonalUp.n++
        counts.diagonalUp.ballsPositions.push(position)
      }

      for (const line of Object.values(counts)) {
        if (line.n >= 5) {
          ballsOfSameColor = [...ballsOfSameColor, ...line.ballsPositions]
        }
      }

      if (ballsOfSameColor.length >= 5) {
        ballsToRemove = [...ballsToRemove, ...ballsOfSameColor]
      }
    }
  }

  return ballsToRemove
}
