import { SyntheticEvent, useContext, useState } from 'react'
import Draggable, { ControlPosition, DraggableEventHandler } from 'react-draggable'
import { IoCloseSharp } from 'react-icons/io5'
import { Resizable, ResizeCallbackData } from 'react-resizable'
import styles from 'styles/Window.module.scss'
import 'react-resizable/css/styles.css'
import { WindowsManagerContext } from './WindowsManager'
import Folder from 'components/miscellaneous/Folder'

interface WindowProps {
  component: React.ComponentType<any>
  title: string
  minWidth: number
  minHeight: number
  disableResize?: boolean
}

type WindowSizeAndPosition = {
  height: number
  width: number
  position: ControlPosition
}

const Window: React.FC<WindowProps> = ({ component: Component, title, minHeight, minWidth, disableResize = false }) => {
  const { currentHighestZIndex, currentActiveGame, updateCurrentActiveGame } = useContext(WindowsManagerContext)
  const [open, setOpen] = useState(false)
  const [zIndex, setZIndex] = useState(50)

  const defaultState: WindowSizeAndPosition = {
    height: minHeight,
    width: minWidth,
    position: {
      x: (window.innerWidth - minWidth) / 3,
      y: window.innerHeight - minHeight - 88,
    },
  }

  const [{ height, position, width }, setWindowSizeAndPosition] = useState(defaultState)

  const moveWindowForward = () => {
    setZIndex(currentHighestZIndex + 1)
    updateCurrentActiveGame(title)
  }

  const onOpen = () => {
    setOpen(true)
    moveWindowForward()
  }
  const onClose = () => {
    setOpen(false)
  }

  const onResize = (_event: SyntheticEvent, { size }: ResizeCallbackData) => {
    if (disableResize) return
    setWindowSizeAndPosition((prev) => {
      return { ...prev, height: size.height, width: size.width }
    })
  }

  const onDrag: DraggableEventHandler = (_event, { x, y }) => {
    setWindowSizeAndPosition((prev) => {
      return { ...prev, position: { x, y } }
    })
  }

  return (
    <>
      <div className={styles.folder} onClick={onOpen}>
        <Folder />
        <p>{title}</p>
      </div>
      {open && (
        <Draggable handle=".drag-handle" bounds="body" onDrag={onDrag} position={position}>
          <Resizable width={width} height={height} onResize={onResize} minConstraints={[minWidth, minHeight]} maxConstraints={[window.innerWidth, window.innerHeight]} resizeHandles={['se', 'e', 's']}>
            <div
              className={styles.window + (disableResize ? ' disable-resize' : '')}
              onClick={moveWindowForward}
              style={{
                width: width,
                height: height,
                zIndex,
              }}
            >
              <div className={styles['title-bar'] + ' drag-handle'}>
                <div>{title}</div>
                <div>
                  <button className={styles['close-btn']} aria-label="Close window" onClick={onClose}>
                    <IoCloseSharp />
                  </button>
                </div>
              </div>
              <div className={styles.inner}>
                <Component disabled={currentActiveGame !== title} />
              </div>
            </div>
          </Resizable>
        </Draggable>
      )}
    </>
  )
}

export default Window
