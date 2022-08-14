import styles from '../styles/GameOverModal.module.scss'

interface GameOverModalProps {}

const GameOverModal: React.FC<GameOverModalProps> = ({}) => {
  return (
    <div className={styles.container}>
      <div className={styles.text}>Game Over</div>
      <button className={styles.button}>New game</button>
    </div>
  )
}

export default GameOverModal
