import GameOverModal from 'components/miscellaneous/GameOverModal'
import StatusBar from 'components/window/StatusBar'
import useGameState, { DEFAULT_GAME_STATE, GameState } from 'hooks/useLines98State'
import useLocalStorage from 'hooks/useLocalStorage'
import p5Types from 'p5'
import { useEffect } from 'react'
import Sketch from 'react-p5'
import styles from 'styles/lines98/Game.module.scss'
import { adjustColorIntensity } from 'utils/helpers'
import { clickedOnActiveBall, DIMENSION, TILES_PER_SIDE } from 'utils/lines98'

const Game: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [localStorage, setLocalStorage] = useLocalStorage<GameState>('lines98', DEFAULT_GAME_STATE)

  const { moveSelectedBall, selectBall, selectDestination, bounceSelectedBall, state, restart, growBalls, shrinkBalls, undo } = useGameState(localStorage)
  const { balls, score, currentStage, isAnimating, prevBalls, gameOver, bestScore } = state

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(DIMENSION, DIMENSION).parent(canvasParentRef)
  }

  const draw = (p5: p5Types) => {
    p5.background('#F4F4F4')

    // draw lines
    p5.stroke('#868891')
    for (let i = 1; i < TILES_PER_SIDE; i++) {
      p5.line((i * DIMENSION) / TILES_PER_SIDE, 0, (i * DIMENSION) / TILES_PER_SIDE, DIMENSION)
      p5.line(0, (i * DIMENSION) / TILES_PER_SIDE, DIMENSION, (i * DIMENSION) / TILES_PER_SIDE)
    }

    // draw balls
    p5.noStroke()

    if (currentStage === 'selected') {
      bounceSelectedBall()
    } else if (currentStage === 'moving') {
      moveSelectedBall()
    } else if (isAnimating) {
      growBalls()
      shrinkBalls()
    }

    for (let i = 0; i < balls.length; i++) {
      const { color, canvasPosition, size } = balls[i]
      const { x, y } = canvasPosition
      const radius = size / 2

      const gradient = p5.drawingContext.createLinearGradient(x + radius, y - radius, x - radius, y + radius)
      gradient.addColorStop(0.25, adjustColorIntensity(color, 25))
      gradient.addColorStop(0.75, adjustColorIntensity(color, -85))
      p5.drawingContext.fillStyle = gradient
      p5.rect(x - radius, y - radius, size, size, size)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    if (gameOver || disabled) return

    const { mouseX, mouseY, floor } = p5

    const clickedOutsideSketch = mouseX <= 0 || mouseY <= 0 || mouseX >= DIMENSION || mouseY >= DIMENSION

    if (clickedOutsideSketch) return

    let c = floor((mouseX / DIMENSION) * TILES_PER_SIDE)
    let r = floor((mouseY / DIMENSION) * TILES_PER_SIDE)

    if (clickedOnActiveBall({ r, c }, balls)) {
      selectBall({ r, c })
    } else {
      selectDestination({ r, c })
    }
  }

  useEffect(() => {
    if (state.currentStage !== 'new-cycle') return
    setLocalStorage(state)
  }, [setLocalStorage, state])

  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={gameOver}
        restart={restart}
        undo={undo}
        disableUndo={!prevBalls.length || gameOver}
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
      <div>
        {/* @ts-ignore */}
        <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />
        {gameOver && <GameOverModal restart={restart} />}
      </div>
    </div>
  )
}

export default Game
