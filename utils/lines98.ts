import { selectRandomFromList } from './helpers'
import {
  BasicTile,
  checkClickOnActiveTile,
  getAllTilesPositions,
  getMultipleRandomEmptyTiles,
  Position,
  putTilesInBoard,
} from './tile'

export const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'pink']
export type BallColor = typeof colors[number]

export interface BallState extends BasicTile {
  color: BallColor
  isActive: boolean
  isSelected: boolean
  isMoving: boolean
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

// helper functions
export const getStartingBalls = (): BallState[] => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 10)

  return tiles.map((tile, idx) => {
    const ball = createBall(tile.position, idx < 7)
    return ball
  })
}

export const createBall = (
  position: Position,
  isActive: boolean
): BallState => {
  const [x, y] = [getCanvasPosition(position.c), getCanvasPosition(position.r)]
  return {
    position,
    isActive,
    isSelected: false,
    isMoving: false,
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
  }
}

export const getBallSize = (isActive: boolean) => {
  return DIMENSION / ((isActive ? 1.4 : 4.5) * SIZE)
}

export const findClickedBall = (position: Position, balls: BallState[]) => {
  const { clickedTile, idx } = checkClickOnActiveTile(
    position,
    balls,
    (ball: BallState) => ball.isActive
  )
  return { clickedBall: clickedTile, clickedBallIdx: idx }
}

export const getCanvasPosition = (idx: number) => {
  return ((idx + 0.5) * DIMENSION) / SIZE
}

export const putBallsInBoard = (balls: BallState[]) => {
  return putTilesInBoard(SIZE, SIZE, balls)
}
