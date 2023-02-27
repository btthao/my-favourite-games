import p5Types from 'p5'

export interface TileState {
  img?: p5Types.Image
  correctIdx: number
  canvasPosition?: { x: number; y: number }
}

export const imageOptions = [
  {
    name: 'red',
    src: '/taylor/red.jpeg',
  },
  {
    name: 'lover',
    src: '/taylor/lover.jpeg',
  },
  {
    name: 'folklore',
    src: '/taylor/folklore.jpeg',
  },
  {
    name: 'antihero',
    src: '/taylor/antihero.jpeg',
  },
]

export const difficultyLevels = [3, 4, 5, 6, 7, 8, 9, 10]

export const DIMENSION = 495
export const DEFAULT_LEVEL = difficultyLevels[1]
export const DEFAULT_IMAGE = imageOptions[0].src

export const isValidIndex = (idx: number, tilesPerSide: number) => {
  return idx >= 0 && idx < tilesPerSide * tilesPerSide
}

export const isValidMove = (oldIdx: number, newIdx: number, tilesPerSide: number) => {
  if (!isValidIndex(oldIdx, tilesPerSide) || !isValidIndex(newIdx, tilesPerSide)) return false

  const moveLeft = oldIdx - 1 == newIdx && oldIdx % tilesPerSide !== 0
  const moveRight = oldIdx + 1 == newIdx && newIdx % tilesPerSide !== 0
  const moveUp = oldIdx - tilesPerSide == newIdx
  const moveDown = oldIdx + tilesPerSide == newIdx

  return moveLeft || moveRight || moveUp || moveDown
}

export const updateCanvasPosition = (tiles: TileState[], tileSize: number, tilesPerSide: number) => {
  tiles.forEach((tile, i) => {
    tile.canvasPosition = {
      x: tileSize * (i % tilesPerSide),
      y: tileSize * Math.floor(i / tilesPerSide),
    }
  })
}
