import React, { useCallback, useRef, useState } from 'react'
import { DropdownItemProps } from './DropdownItem'
import styles from 'styles/Dropdown.module.scss'
import useClickOutsideElement from 'hooks/useClickOutsideElement'

interface DropdownProps {
  name: string
  children: React.ReactElement<DropdownItemProps> | React.ReactElement<DropdownItemProps>[]
}

const Dropdown: React.FC<DropdownProps> = ({ name, children }) => {
  const [open, setOpen] = useState(false)

  const toggleOpen = useCallback(() => {
    setOpen((curr) => !curr)
  }, [])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])

  const ref = useRef(null)
  useClickOutsideElement(ref, onClose)

  return (
    <div ref={ref} className={styles.wrapper}>
      <button onClick={toggleOpen}>{name}</button>
      <div onClick={(e) => e.stopPropagation()} className={`${styles.items} ` + ` ${open ? styles.show : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default Dropdown
