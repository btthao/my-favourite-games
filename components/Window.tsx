import { useRouter } from 'next/router'
import { SyntheticEvent, useEffect, useState } from 'react'
import Draggable, {
  ControlPosition,
  DraggableEventHandler,
} from 'react-draggable'
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi'
import { IoCloseSharp } from 'react-icons/io5'
import { Resizable, ResizeCallbackData } from 'react-resizable'
import styles from 'styles/Window.module.scss'
import 'react-resizable/css/styles.css'

interface WindowProps {
  component: React.ComponentType<any>
  title: string
  minW: number
  minH: number
  disableResize?: boolean
}

type WindowState = {
  height: number
  width: number
  position: ControlPosition
}

const Window: React.FC<WindowProps> = ({
  component: Component,
  title,
  minH,
  minW,
  disableResize = false,
}) => {
  const router = useRouter()
  const defaultState: WindowState = {
    height: minH,
    width: minW,
    position: {
      x: (window.innerWidth - minW) / 2,
      y: (window.innerHeight - minH) / 2,
    },
  }
  const [{ height, position, width }, setWindowState] = useState(defaultState)
  const [prevState, setPrevState] = useState(defaultState)
  const [isResizing, setIsResizing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const onResize = (_event: SyntheticEvent, { size }: ResizeCallbackData) => {
    if (disableResize) return
    setWindowState((prev) => {
      return { ...prev, height: size.height, width: size.width }
    })
    setIsResizing(true)
  }

  const onDrag: DraggableEventHandler = (e, data) => {
    const { x, y } = data
    setWindowState((prev) => {
      return { ...prev, position: { x, y } }
    })
    setIsResizing(true)
  }

  useEffect(() => {
    if (isFullscreen) {
      setPrevState({ width, height, position })
      setWindowState({
        height: window.innerHeight,
        width: window.innerWidth,
        position: { x: 0, y: 0 },
      })
    } else {
      setWindowState(prevState)
    }
  }, [isFullscreen])

  return (
    <Draggable
      handle=".drag-handle"
      bounds="body"
      onDrag={onDrag}
      position={position}
      onStop={() => setIsResizing(false)}
    >
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
          <div className={styles['title-bar'] + ' drag-handle'}>
            <div>{title}</div>
            <div>
              <button
                disabled={disableResize}
                className={styles['maximize-btn']}
                aria-label="Maximize window"
                onClick={() => setIsFullscreen((prev) => !prev)}
              >
                {isFullscreen ? <BiExitFullscreen /> : <BiFullscreen />}
              </button>
              <button
                className={styles['close-btn']}
                aria-label="Close window"
                onClick={() => router.push('/')}
              >
                <IoCloseSharp />
              </button>
            </div>
          </div>
          <div className={styles.inner}>
            <Component isResizing={isResizing} />
          </div>
        </div>
      </Resizable>
    </Draggable>
  )
}

export default Window
