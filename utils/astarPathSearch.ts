import { BallState, getCanvasPosition, TILES_PER_SIDE } from './lines98'
import { TilePosition } from './tile'

interface PathNode {
  position: TilePosition
  f: number // cost from start to end through this node, f = g+h
  g: number // cost from start to this node
  h: number // cost from this node to end
  neighbors: PathNode[]
  previous?: PathNode
  block: boolean // whether we can travel through this node
}

export const findPath = (balls: BallState[], start: TilePosition, end: TilePosition) => {
  const board: PathNode[][] = createPathFindBoard(balls)

  let openSet: PathNode[] = [board[start.r][start.c]]
  let closedSet: PathNode[] = []

  let path: TilePosition[] = []
  let current: PathNode | undefined

  while (openSet.length) {
    let mostOptimalNodeIdx = findMostOptimalNodeIdx(openSet)

    current = openSet[mostOptimalNodeIdx]

    const arrivedAtDestination = current.position.c === end.c && current.position.r === end.r

    if (arrivedAtDestination) {
      // go back to each node's previous to form the path from start to end
      while (current) {
        path.push(current.position)
        current = current.previous
      }
      break
    }

    openSet = openSet.filter((_p, idx) => idx !== mostOptimalNodeIdx)
    closedSet.push(current)

    for (const neighbor of current.neighbors) {
      if (neighbor.block) continue

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

  return path.map((p) => getCanvasPosition(p))
}

const dist = (a: TilePosition, b: TilePosition) => {
  return Math.abs(a.c - b.c) + Math.abs(a.r - b.r)
}

const addNeighbors = ({ c, r }: TilePosition, board: PathNode[][]) => {
  const neighbors = []

  if (r < TILES_PER_SIDE - 1) {
    neighbors.push(board[r + 1][c])
  }
  if (r > 0) {
    neighbors.push(board[r - 1][c])
  }
  if (c < TILES_PER_SIDE - 1) {
    neighbors.push(board[r][c + 1])
  }
  if (c > 0) {
    neighbors.push(board[r][c - 1])
  }

  return neighbors
}

const createPathFindBoard = (balls: BallState[]): PathNode[][] => {
  let board: PathNode[][] = []

  for (let r = 0; r < TILES_PER_SIDE; r++) {
    board.push([])
    for (let c = 0; c < TILES_PER_SIDE; c++) {
      board[r].push({ position: { r, c }, f: 0, g: 0, h: 0, neighbors: [], block: false })
    }
  }

  for (const ball of balls) {
    if (ball.isActive) {
      const { r, c } = ball.position
      board[r][c].block = true
    }
  }

  for (let r = 0; r < TILES_PER_SIDE; r++) {
    for (let c = 0; c < TILES_PER_SIDE; c++) {
      board[r][c].neighbors = addNeighbors({ r, c }, board)
    }
  }

  return board
}

const findMostOptimalNodeIdx = (set: PathNode[]) => {
  let winner = 0

  for (let i = 0; i < set.length; i++) {
    if (set[i].f < set[winner].f) {
      winner = i
    }
  }

  return winner
}
