import { BasicTile } from './tile'
import p5Types from 'p5'

export interface TileState extends BasicTile {
  img: p5Types.Image
  correctIdx: number
  currentIdx: number
}

export const DIMENSION = 495
