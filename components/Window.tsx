import { SyntheticEvent, useState } from 'react'
import Draggable, { ControlPosition, DraggableEventHandler } from 'react-draggable'
import { IoCloseSharp } from 'react-icons/io5'
import { Resizable, ResizeCallbackData } from 'react-resizable'
import styles from 'styles/Window.module.scss'
import 'react-resizable/css/styles.css'

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
  const [open, setOpen] = useState(false)

  const defaultState: WindowSizeAndPosition = {
    height: minHeight,
    width: minWidth,
    position: {
      x: (window.innerWidth - minWidth) / 2,
      y: (window.innerHeight - minHeight) / 2,
    },
  }

  const [{ height, position, width }, setWindowSizeAndPosition] = useState(defaultState)
  const [isResizing, setIsResizing] = useState(false)

  const onOpen = () => {
    setOpen(true)
  }
  const onClose = () => {
    setOpen(false)
  }

  const onResize = (_event: SyntheticEvent, { size }: ResizeCallbackData) => {
    if (disableResize) return
    setWindowSizeAndPosition((prev) => {
      return { ...prev, height: size.height, width: size.width }
    })
    setIsResizing(true)
  }

  const onDrag: DraggableEventHandler = (_event, { x, y }) => {
    setWindowSizeAndPosition((prev) => {
      return { ...prev, position: { x, y } }
    })
    setIsResizing(true)
  }

  return (
    <>
      <div className={styles.folder} onClick={onOpen}>
        <Folder />
        <p>{title}</p>
      </div>
      {open && (
        <Draggable handle=".drag-handle" bounds="body" onDrag={onDrag} position={position} onStop={() => setIsResizing(false)}>
          <Resizable width={width} height={height} onResize={onResize} onResizeStop={() => setIsResizing(false)} minConstraints={[minWidth, minHeight]} maxConstraints={[window.innerWidth, window.innerHeight]} resizeHandles={['se', 'e', 's']}>
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
                  <button className={styles['close-btn']} aria-label="Close window" onClick={onClose}>
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
      )}
    </>
  )
}

export default Window

const Folder: React.FC = () => {
  return (
    <div>
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path id="folder-back" d="M38,12H22l-4-4H8c-2.2,0-4,1.8-4,4v24c0,2.2,1.8,4,4,4h31c1.7,0,3-1.3,3-3V16C42,13.8,40.2,12,38,12z"></path>
        <path id="folder-front" d="M42.2,18H15.3c-1.9,0-3.6,1.4-3.9,3.3L8,40h31.7c1.9,0,3.6-1.4,3.9-3.3l2.5-14C46.6,20.3,44.7,18,42.2,18z"></path>
      </svg>
    </div>
  )
}
