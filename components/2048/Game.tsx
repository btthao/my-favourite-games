import { useEffect } from 'react'
import useGameState, { DEFAULT_GAME_STATE, GameState } from 'hooks/use2048State'
import styles from 'styles/2048/Game.module.scss'
import Tile from './Tile'
import useLocalStorage from 'hooks/useLocalStorage'
import StatusBar from 'components/window/StatusBar'
import { GRID_SIZE, TILE_SIZE } from 'utils/2048'

const Game: React.FC = () => {
  const [localStorage, setLocalStorage] = useLocalStorage<GameState>('2048', DEFAULT_GAME_STATE)

  const { state, moveDown, moveUp, moveLeft, moveRight, newGame } = useGameState(localStorage)
  const { activeTiles, gameOver, score, bestScore, moveCount } = state

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
    setLocalStorage(state)
  }, [activeTiles, gameOver, score, bestScore, state, setLocalStorage])

  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={gameOver}
        restart={newGame}
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
        <div className={styles.grid} style={{ width: GRID_SIZE, height: GRID_SIZE }}>
          <div className={styles.cells}>
            {new Array(16).fill(0).map((_, idx) => (
              <div key={idx}></div>
            ))}
          </div>
          <div className={styles.tiles}>
            {activeTiles.map((tile) => (
              <Tile key={JSON.stringify(tile) + moveCount} {...tile} width={TILE_SIZE} height={TILE_SIZE} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
