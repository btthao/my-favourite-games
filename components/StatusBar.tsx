import { BsFillEmojiFrownFill, BsFillEmojiSmileFill } from 'react-icons/bs'
import styles from 'styles/StatusBar.module.scss'

interface StatusBarProps {
  onClick: () => void
  gameOver: boolean
  leftComponent: JSX.Element
  rightComponent: JSX.Element
}

const StatusBar: React.FC<StatusBarProps> = ({
  onClick,
  gameOver,
  leftComponent,
  rightComponent,
}) => {
  return (
    <div className={styles['status-bar']}>
      <div className={styles.stat}>{leftComponent}</div>
      <div
        role="button"
        aria-label="restart"
        className={styles.restart}
        onClick={onClick}
      >
        {gameOver ? <BsFillEmojiFrownFill /> : <BsFillEmojiSmileFill />}
      </div>
      <div className={styles.stat}>{rightComponent}</div>
    </div>
  )
}

export default StatusBar
