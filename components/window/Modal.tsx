import React, { useState } from 'react'
import styles from 'styles/Modal.module.scss'
import { IoCloseSharp } from 'react-icons/io5'

interface ModalProps {
  name: string
  children: JSX.Element[]
}

const Modal: React.FC<ModalProps> = ({ name, children }) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <button onClick={handleOpen}>{name}</button>
      <div className={`${styles.backdrop} ` + ` ${open ? styles.show : ''}`}>
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
