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

// to find optimal path
interface PathNode {
  position: TilePosition
  f: number // cost from start to finish through this node, f = g+h
  g: number // cost from start to this node
  h: number // cost from this node to end
  neighbors: PathNode[]
  previous?: PathNode
  block: boolean // whether we can travel through this node
}

// Constants
export const DIMENSION = 495
export const SIZE = 9
export const ALL_TILES_POS = getAllTilePositions(SIZE, SIZE)
export const BALL_BOUNCE_SPEED = 0.25
export const BIG_BALL_SIZE = DIMENSION / (1.45 * SIZE)
export const SMALL_BALL_SIZE = DIMENSION / (4 * SIZE)

// helper functions
export const getStartingBalls = (): BallState[] => {
  const tiles = getMultipleRandomEmptyTiles(ALL_TILES_POS, 10)

  return tiles.map((tile, idx) => {
    const ball = createBall(tile.position, idx < 7)
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
  return { x: ((position.c + 0.5) * DIMENSION) / SIZE, y: ((position.r + 0.5) * DIMENSION) / SIZE }
}

export const findConsecutiveBalls = (balls: BallState[]) => {
  const board = putTilesInBoard(
    SIZE,
    SIZE,
    balls.filter((b) => b.isActive)
  )

  let ballsToRemove: TilePosition[] = []

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]?.isActive) continue

      //   only check active balls
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

// path finding astar algo
const dist = (a: TilePosition, b: TilePosition) => {
  let d = Math.abs(a.c - b.c) + Math.abs(a.r - b.r)
  return d
}

const addNeighbors = ({ c, r }: TilePosition, board: PathNode[][]) => {
  const neighbors = []

  if (r < SIZE - 1) {
    neighbors.push(board[r + 1][c])
  }
  if (r > 0) {
    neighbors.push(board[r - 1][c])
  }
  if (c < SIZE - 1) {
    neighbors.push(board[r][c + 1])
  }
  if (c > 0) {
    neighbors.push(board[r][c - 1])
  }

  return neighbors
}

// use this if want ball to move slower by adding extra points between every 2 nodes in path
export const transformPath = (path: TilePosition[]) => {
  //   transforming node position to position in canvas for animation effect
  if (!path.length) return []

  let updatedPath: { x: number; y: number }[] = []

  let num = 2
  let speed = DIMENSION / (SIZE * (num + 1))
  // add 2 extra points between every two nodes

  for (let i = 0; i < path.length; i++) {
    updatedPath.push(getCanvasPosition(path[i]))
    if (i < path.length - 1) {
      for (let k = 0; k < num; k++) {
        //   initialize extra points with this coordinate, will update correct position later
        updatedPath.push({ x: 0, y: 0 })
      }
    }
  }

  // traverse to update positions of new points
  for (let i = 1; i < updatedPath.length - 1; i += num + 1) {
    const prevNode = updatedPath[i - 1]
    const nextNode = updatedPath[i + num]

    let xDirection = prevNode.x === nextNode.x ? 0 : prevNode.x < nextNode.x ? 1 : -1
    let yDirection = prevNode.y === nextNode.y ? 0 : prevNode.y < nextNode.y ? 1 : -1

    for (let k = 0; k < num; k++) {
      updatedPath[i + k].x = prevNode.x + (k + 1) * speed * xDirection
      updatedPath[i + k].y = prevNode.y + (k + 1) * speed * yDirection
    }
  }

  return updatedPath
}

export const findPath = (balls: BallState[], start: TilePosition, end: TilePosition) => {
  let openSet: PathNode[] = []
  let closedSet: PathNode[] = []

  let board: PathNode[][] = []
  let path: TilePosition[] = []
  let current: PathNode | undefined

  // initialize board
  for (let r = 0; r < SIZE; r++) {
    board.push([])
    for (let c = 0; c < SIZE; c++) {
      board[r].push({ position: { r, c }, f: 0, g: 0, h: 0, neighbors: [], block: false })
    }
  }

  //loop through current balls. if ball is active then the node at that position will be a block
  for (const ball of balls) {
    if (ball.isActive) {
      const { r, c } = ball.position
      board[r][c].block = true
    }
  }

  // add neighbors for each node
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      board[r][c].neighbors = addNeighbors({ r, c }, board)
    }
  }

  // add starting point to open set
  openSet.push(board[start.r][start.c])

  //   time to traverse and check each node
  while (openSet.length) {
    //   find the node with lowest f score
    let winner = 0
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i
      }
    }

    //   set current to node with lowest f score => most optimal node
    current = openSet[winner]

    //  if current is the same as our destination, we have arrived
    if (current.position.c === end.c && current.position.r === end.r) {
      // go back to each node's previous to form the path from start to end
      while (current) {
        path.push(current.position)
        current = current.previous
      }
      break
    }

    // if we haven't arrived yet
    // move current from open to closed set
    openSet = openSet.filter((_p, idx) => idx !== winner)
    closedSet.push(current)

    //  find the next node in path by checking current's neighbors
    for (const neighbor of current.neighbors) {
      if (neighbor.block) continue
      // only check if it's not a block and not already in closed set
      if (!closedSet.includes(neighbor)) {
        //   add 1 because we make one more step from current
        const tempG = current.g + 1
        neighbor.g = Math.min(tempG, neighbor.g)
        neighbor.h = dist(neighbor.position, end)
        neighbor.f = neighbor.g + neighbor.h
        neighbor.previous = current
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
        }
      }
    }
  }

  // convert row and col to actual position in canvas
  return path.map((p) => getCanvasPosition(p))
}

export const clickedOnActiveBall = (clickedPos: TilePosition, activeBalls: BallState[]) => {
  for (const ball of activeBalls) {
    if (ball.position.c == clickedPos.c && ball.position.r == clickedPos.r && ball.isActive) {
      return true
    }
  }

  return false
}
