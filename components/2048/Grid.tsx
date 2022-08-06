import { useEffect } from 'react'
import useGameState, { TOTAL_COLS } from '../../hooks/use2048State'
import styles from '../../styles/2048/Grid.module.scss'
import { calculateRenderSize } from '../../utils/calculateSize'
import Tile from './Tile'
import { v4 as uuidv4 } from 'uuid'

interface GridProps {
  width: number
  height: number
}

const calculateTileSize = (dimension: number) => {
  return (dimension - TOTAL_COLS - 1) / TOTAL_COLS
}

const Grid: React.FC<GridProps> = ({ width, height }) => {
  const { renderHeight, renderWidth } = calculateRenderSize({
    width,
    height,
    aspectRatio: 1,
    maxW: height * 0.9,
    maxH: height * 0.9,
  })

  const { state, moveDown, moveUp, moveLeft, moveRight, onResize } =
    useGameState()
  const { activeTiles } = state

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const { ctrlKey, key, metaKey } = event

      if (ctrlKey || metaKey) {
        return
      }

      switch (key) {
        case 'ArrowDown':
          moveDown()
          break
        case 'ArrowUp':
          moveUp()
          break
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [moveDown, moveLeft, moveRight, moveUp, onResize])

  return (
    <div className={styles.container}>
      <div
        className={styles.grid}
        style={{ width: renderWidth, height: renderHeight }}
      >
        <div className={styles.cells}>
          {new Array(16).fill(0).map((_, idx) => (
            <div key={idx}></div>
          ))}
        </div>
        <div className={styles.tiles}>
          {activeTiles.map((tile) => (
            <Tile
              key={uuidv4()}
              {...tile}
              width={calculateTileSize(renderWidth)}
              height={calculateTileSize(renderHeight)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Grid
