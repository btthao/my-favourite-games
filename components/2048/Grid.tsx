import styles from '../../styles/2048/Grid.module.scss'
import { calculateRenderSize } from '../../utils/calculateSize'

interface GridProps {
  width: number
  height: number
}

const Grid: React.FC<GridProps> = ({ width, height }) => {
  const { renderHeight, renderWidth } = calculateRenderSize({
    width,
    height,
    aspectRatio: 1,
    maxW: height * 0.9,
    maxH: height * 0.9,
  })
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
      </div>
    </div>
  )
}

export default Grid
