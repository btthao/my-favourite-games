import StatusBar from 'components/StatusBar'
import useGameState, { DEFAULT_GAME_STATE, GameState } from 'hooks/useLines98State'
import useLocalStorage from 'hooks/useLocalStorage'
import p5Types from 'p5'
import { useEffect } from 'react'
import Sketch from 'react-p5'
import styles from 'styles/lines98/Game.module.scss'
import { adjustColorIntensity } from 'utils/helpers'
import { clickedOnActiveBall, DIMENSION, SIZE } from 'utils/lines98'

const Game = () => {
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
    for (let i = 1; i < SIZE; i++) {
      p5.line((i * DIMENSION) / SIZE, 0, (i * DIMENSION) / SIZE, DIMENSION)
      p5.line(0, (i * DIMENSION) / SIZE, DIMENSION, (i * DIMENSION) / SIZE)
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
    if (gameOver) return

    const { mouseX, mouseY, floor } = p5

    let c = floor((mouseX / DIMENSION) * SIZE)
    let r = floor((mouseY / DIMENSION) * SIZE)

    if (clickedOnActiveBall({ r, c }, balls)) {
      selectBall({ r, c })
    } else if (r >= 0 && c >= 0) {
      selectDestination({ r, c })
    }
  }

  useEffect(() => {
    setLocalStorage(state)
  }, [setLocalStorage, state])

  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={gameOver}
        restart={restart}
        undo={undo}
        disableUndo={!prevBalls.length}
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
      </div>
    </div>
  )
}

export default Game
