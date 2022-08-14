import styles from 'styles/GameOverModal.module.scss'

interface GameOverModalProps {
  onClick: () => void
}

const GameOverModal: React.FC<GameOverModalProps> = ({ onClick }) => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>Game Over</div>
      <button className={styles.button} onClick={onClick}>
        New game
      </button>
    </div>
  )
}

export default GameOverModal
