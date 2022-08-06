import React from 'react'
import styles from '../styles/Computer.module.scss'
import { useResizeDetector } from 'react-resize-detector'
import { ASPECT_RATIO, MAX_HEIGHT, MAX_WIDTH } from '../constants'
import { calculateRenderSize } from '../utils/calculateSize'

interface ComputerProps {
  component: React.ComponentType<any>
}

const Computer: React.FC<ComputerProps> = ({ component: Component }) => {
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
        className={styles.computer}
        style={{
          width: renderWidth,
          height: renderHeight,
        }}
      >
        <div className={styles.screen}>
          <div className={styles.inner}>
            <Component height={renderHeight * 0.54} width={renderWidth * 0.8} />
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.inner}></div>
        </div>
      </div>
    </div>
  )
}

export default Computer
