import React from 'react'
import styles from 'styles/MenuBar.module.scss'

interface MenuBarProps {
  children: JSX.Element | JSX.Element[]
}

const MenuBar: React.FC<MenuBarProps> = ({ children }) => {
  return <div className={styles.container}>{children}</div>
}

export default MenuBar
