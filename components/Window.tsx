import { SyntheticEvent, useState } from 'react'
import { FiMinusSquare, FiPlusSquare, FiXSquare } from 'react-icons/fi'
import { Resizable, ResizeCallbackData } from 'react-resizable'
import styles from 'styles/Window.module.scss'
import 'react-resizable/css/styles.css'
import { useRouter } from 'next/router'

interface WindowProps {
  component: React.ComponentType<any>
  title: string
  minW: number
  minH: number
  disableResize?: boolean
}

const Window: React.FC<WindowProps> = ({
  component: Component,
  title,
  minH,
  minW,
  disableResize = false,
}) => {
  const router = useRouter()
  const [height, setHeight] = useState(minH)
  const [width, setWidth] = useState(minW)
  const [isResizing, setIsResizing] = useState(false)

  const onResize = (
    event: SyntheticEvent,
    { size, handle }: ResizeCallbackData
  ) => {
    if (disableResize) return
    setHeight(size.height)
    setWidth(size.width)
    setIsResizing(true)
  }

  const makeFullscreen = () => {
    setHeight(window.innerHeight)
    setWidth(window.innerWidth)
    setIsResizing(true)
    setTimeout(() => {
      setIsResizing(false)
    }, 100)
  }

  return (
    <Resizable
      width={width}
      height={height}
      onResize={onResize}
      onResizeStop={() => setIsResizing(false)}
      minConstraints={[minW, minH]}
      resizeHandles={['se', 'e', 's']}
    >
      <div
        className={styles.window + (disableResize ? ' disable-resize' : '')}
        style={{
          width: width,
          height: height,
        }}
      >
        <div className={styles['title-bar']}>
          <div>{title}</div>
          <div>
            <button
              disabled={disableResize}
              className={styles['maximize-btn']}
              aria-label="Maximize window"
              onClick={makeFullscreen}
            >
              <FiPlusSquare />
            </button>
            <button
              className={styles['close-btn']}
              aria-label="Close window"
              onClick={() => router.push('/')}
            >
              <FiXSquare />
            </button>
          </div>
        </div>
        <div className={styles.inner}>
          <Component isResizing={isResizing} />
        </div>
      </div>
    </Resizable>
  )
}

export default Window
