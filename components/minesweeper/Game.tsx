import Confetti from 'components/miscellaneous/Confetti'
import Timer from 'components/miscellaneous/Timer'
import StatusBar from 'components/window/StatusBar'
import useGameState from 'hooks/useMinesweeperState'
import styles from 'styles/minesweeper/Game.module.scss'
import Tile from './Tile'

const Game: React.FC = () => {
  const { state, newGame, reveal, flag } = useGameState()
  const { tiles, gameOver, minesCount, won } = state

  return (
    <div className={styles.container}>
      {won && <Confetti />}
      <StatusBar
        gameOver={gameOver}
        won={won}
        restart={newGame}
        leftComponent={
          <>
            <div>{minesCount}</div>
            <div>Mines</div>
          </>
        }
        rightComponent={
          <>
            <div>
              <Timer />
            </div>
            <div>Timer</div>
          </>
        }
      />
      <div className={styles.grid}>
        {tiles.map((tile, idx) => (
          <Tile key={idx} index={idx} reveal={reveal} flag={flag} gameOver={gameOver} {...tile} />
        ))}
      </div>
    </div>
  )
}

export default Game
