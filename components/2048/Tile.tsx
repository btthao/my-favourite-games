import { TileState } from 'utils/2048'
import styles from 'styles/2048/Tile.module.scss'
import { TILE_ANIMATION_DELAY } from 'hooks/use2048State'
import { TILE_GAP } from '../../constants'

interface TileProps extends TileState {
  width: number
  height: number
}

const Tile: React.FC<TileProps> = ({
  value,
  isNew,
  isMerged,
  position,
  prevPosition,
  animationDelay,
  width,
  height,
}) => {
  let className = styles.tile
  let style: any = {
    width,
    height,
  }

  if (isNew) {
    className += ' ' + styles.new
  }

  if (isMerged) {
    className += ' ' + styles.merged
    style = { ...style, '--animation-delay': animationDelay + 'ms' }
  }

  if (prevPosition) {
    style = {
      ...style,
      left: `${prevPosition.c * (TILE_GAP + width)}px`,
      top: `${prevPosition.r * (TILE_GAP + height)}px`,
      '--move-x': `${(position.c - prevPosition.c) * (TILE_GAP + width)}px`,
      '--move-y': `${(position.r - prevPosition.r) * (TILE_GAP + height)}px`,
      '--duration': `${
        Math.max(
          Math.abs(position.r - prevPosition.r),
          Math.abs(position.c - prevPosition.c)
        ) * TILE_ANIMATION_DELAY
      }ms`,
    }
    className += ' ' + styles.move
  } else {
    style = {
      ...style,
      left: `${position.c * (TILE_GAP + width)}px`,
      top: `${position.r * (TILE_GAP + height)}px`,
    }
  }

  return (
    <div className={className} data-value={value} style={style}>
      {value}
    </div>
  )
}

export default Tile
