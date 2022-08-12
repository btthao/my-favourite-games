import styles from '../styles/Window.module.scss'
import { useResizeDetector } from 'react-resize-detector'
import { ASPECT_RATIO, MAX_HEIGHT, MAX_WIDTH } from '../constants'
import { calculateRenderSize } from '../utils/calculateSize'
import { BiSquare } from 'react-icons/bi'
import { GrFormClose } from 'react-icons/gr'
import { AiOutlineMinus } from 'react-icons/ai'

interface WindowProps {
  component: React.ComponentType<any>
  title: string
}

const Window: React.FC<WindowProps> = ({ component: Component, title }) => {
  const { width, height, ref } = useResizeDetector()
  const { renderHeight, renderWidth } = calculateRenderSize({
    width,
    height,
    aspectRatio: ASPECT_RATIO,
    maxW: MAX_WIDTH,
    maxH: MAX_HEIGHT,
  })

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.window}
        style={{
          width: renderWidth,
          height: renderHeight,
        }}
      >
        <div className={styles['title-bar']}>
          <div>{title}</div>
          <div>
            <button
              className={styles['minimize-btn']}
              aria-label="Minimize window"
            >
              <AiOutlineMinus />
            </button>
            <button
              className={styles['maximize-btn']}
              aria-label="Maximize window"
            >
              <BiSquare />
            </button>
            <button className={styles['close-btn']} aria-label="Close window">
              <GrFormClose />
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
