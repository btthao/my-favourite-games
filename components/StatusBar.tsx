import { BsFillEmojiFrownFill, BsFillEmojiSmileFill, BsFillEmojiSunglassesFill } from 'react-icons/bs'
import { IoArrowUndoCircle } from 'react-icons/io5'
import styles from 'styles/StatusBar.module.scss'

interface StatusBarProps {
  restart: () => void
  undo?: () => void
  disableUndo?: boolean
  gameOver: boolean
  won: boolean
  leftComponent: JSX.Element
  rightComponent: JSX.Element
}

const StatusBar: React.FC<StatusBarProps> = ({ undo, restart, won, gameOver, leftComponent, rightComponent, disableUndo = false }) => {
  return (
    <div className={styles['status-bar']}>
      <div className={styles.stat}>{leftComponent}</div>
      <div className={`${styles.mid} ${undo ? styles.small : ''}`}>
        <div role="button" aria-label="restart" className={styles.restart} onClick={restart}>
          {won ? <BsFillEmojiSunglassesFill /> : gameOver ? <BsFillEmojiFrownFill /> : <BsFillEmojiSmileFill />}
        </div>
        {undo && (
          <div role="button" aria-label="undo" className={`${styles.undo} ${disableUndo ? styles.disabled : ''}`} onClick={undo}>
            <IoArrowUndoCircle />
          </div>
        )}
      </div>
      <div className={styles.stat}>{rightComponent}</div>
    </div>
  )
}

export default StatusBar
