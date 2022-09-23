import StatusBar from 'components/StatusBar'
import useGameState from 'hooks/useMinesweeperState'
import styles from 'styles/minesweeper/Grid.module.scss'
import Tile from './Tile'

interface GridProps {}

const Grid: React.FC<GridProps> = ({}) => {
  const { state, newGame, reveal, flag } = useGameState()
  const { tiles, gameOver, minesCount, timer } = state
  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={gameOver}
        onClick={newGame}
        leftComponent={<div>{minesCount}</div>}
        rightComponent={<div>{timer}</div>}
      />
      <div className={styles.grid}>
        {tiles.map((tile, idx) => (
          <Tile
            key={idx}
            index={idx}
            reveal={reveal}
            flag={flag}
            gameOver={gameOver}
            {...tile}
          />
        ))}
      </div>
    </div>
  )
}

export default Grid
