import { useEffect } from 'react'
import useGameState, {
  DEFAULT_STATE,
  GameState,
  TOTAL_COLS,
} from 'hooks/use2048State'
import styles from 'styles/2048/Game.module.scss'
import Tile from './Tile'
import { v4 as uuidv4 } from 'uuid'
import { TILE_GAP_2048 } from '../../constants'
import GameOverModal from 'components/GameOverModal'
import useLocalStorage from 'hooks/useLocalStorage'
import StatusBar from 'components/StatusBar'

interface GameProps {
  isResizing: boolean
}

const calculateTileSize = (dimension: number) => {
  return (dimension - TILE_GAP_2048 * (TOTAL_COLS + 1)) / TOTAL_COLS
}

const DIMENSION = 400

const Game: React.FC<GameProps> = ({ isResizing }) => {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    '2048',
    DEFAULT_STATE
  )

  const { state, moveDown, moveUp, moveLeft, moveRight, onResize, newGame } =
    useGameState(gameState)
  const { activeTiles, gameOver, score, bestScore } = state

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      const { ctrlKey, key, metaKey } = event

      if (ctrlKey || metaKey || gameOver) {
        return
      }

      switch (key) {
        case 'ArrowDown':
          moveDown()
          break
        case 'ArrowUp':
          moveUp()
          break
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [moveDown, moveLeft, moveRight, moveUp, gameOver])

  useEffect(() => {
    if (isResizing) {
      onResize()
    }
  }, [isResizing, onResize])

  useEffect(() => {
    setGameState(state)
  }, [activeTiles, gameOver, score, bestScore, state, setGameState])

  return (
    <div className={styles.container}>
      <StatusBar
        won={false}
        gameOver={gameOver}
        onClick={newGame}
        leftComponent={
          <>
            <div>{score}</div>
            <div>Score</div>
          </>
        }
        rightComponent={
          <>
            <div>{bestScore}</div>
            <div>Best</div>
          </>
        }
      />
      <div className={styles.inner}>
        <div
          className={styles.grid}
          style={{ width: DIMENSION, height: DIMENSION }}
        >
          <div className={styles.cells}>
            {new Array(16).fill(0).map((_, idx) => (
              <div key={idx}></div>
            ))}
          </div>
          <div className={styles.tiles}>
            {activeTiles.map((tile) => (
              <Tile
                key={uuidv4()}
                {...tile}
                width={calculateTileSize(DIMENSION)}
                height={calculateTileSize(DIMENSION)}
              />
            ))}
          </div>
        </div>
        {gameOver && <GameOverModal onClick={newGame} />}
      </div>
    </div>
  )
}

export default Game
