import React, { useEffect, useState } from 'react'
import styles from 'styles/Modal.module.scss'
import { IoCloseSharp } from 'react-icons/io5'

interface ModalProps {
  name?: string
  children: JSX.Element | JSX.Element[]
  onClose?: () => void
  showOnRender?: boolean
  timeOut?: number
}

const Modal: React.FC<ModalProps> = ({ name, children, onClose, showOnRender = false, timeOut = 200 }) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (onClose) {
      onClose()
    }
  }

  useEffect(() => {
    if (showOnRender) {
      setTimeout(() => {
        handleOpen()
      }, timeOut)
    }
  }, [])

  return (
    <div>
      {!showOnRender && <button onClick={handleOpen}>{name}</button>}
      <div onClick={(e) => e.stopPropagation()} className={`${styles.backdrop} ` + `${showOnRender && open ? styles['show-on-render'] : open ? styles.show : ''}`}>
        <div className={styles.modal}>
          <div className={styles['title-bar']}>
            <div>{name}</div>
            <div>
              <button className={styles['close-btn']} aria-label="Close modal" onClick={handleClose}>
                <IoCloseSharp />
              </button>
            </div>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
