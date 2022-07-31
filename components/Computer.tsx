import React from 'react'
import styles from '../styles/Computer.module.scss'
import { useResizeDetector } from 'react-resize-detector'
import { ASPECT_RATIO, MAX_HEIGHT, MAX_WIDTH } from '../constants'

interface ComputerProps {
  children: React.ReactNode
}

const Computer: React.FC<ComputerProps> = ({ children }) => {
  const { width, height, ref } = useResizeDetector()
  let computerHeight = 0
  let computerWidth = 0

  if (width && height) {
    if (width / ASPECT_RATIO > height) {
      computerHeight = Math.min(height, MAX_HEIGHT)
      computerWidth = computerHeight * ASPECT_RATIO
    } else {
      computerWidth = Math.min(width, MAX_WIDTH)
      computerHeight = computerWidth / ASPECT_RATIO
    }
  }

  return (
    <div ref={ref} className={styles.container}>
      <div
        className={styles.computer}
        style={{
          width: computerWidth,
          height: computerHeight,
        }}
      >
        <div className={styles.screen}>
          <div className={styles.inner}>{children}</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.inner}></div>
        </div>
      </div>
    </div>
  )
}

export default Computer
