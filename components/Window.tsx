import styles from 'styles/Window.module.scss'
import { useResizeDetector } from 'react-resize-detector'
import { calculateRenderSize } from 'utils/calculateSize'
import { FiMinusSquare, FiPlusSquare, FiXSquare } from 'react-icons/fi'

interface WindowProps {
  component: React.ComponentType<any>
  title: string
  aspectRatio: number
  max_width: number
  max_height: number
}

const Window: React.FC<WindowProps> = ({
  component: Component,
  title,
  aspectRatio,
  max_height,
  max_width,
}) => {
  const { width, height, ref } = useResizeDetector()
  const { renderHeight, renderWidth } = calculateRenderSize({
    width,
    height,
    aspectRatio: aspectRatio,
    maxW: max_width,
    maxH: max_height,
  })

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.window}
        style={{
          width: renderWidth,
          height: renderHeight,
          fontSize: Math.floor(renderWidth / 55),
        }}
      >
        <div className={styles['title-bar']}>
          <div>{title}</div>
          <div>
            <button
              className={styles['minimize-btn']}
              aria-label="Minimize window"
            >
              <FiMinusSquare />
            </button>
            <button
              className={styles['maximize-btn']}
              aria-label="Maximize window"
            >
              <FiPlusSquare />
            </button>
            <button className={styles['close-btn']} aria-label="Close window">
              <FiXSquare />
            </button>
          </div>
        </div>
        <div className={styles.inner}>
          <Component height={renderHeight - 40} width={renderWidth} />
        </div>
      </div>
    </div>
  )
}

export default Window
