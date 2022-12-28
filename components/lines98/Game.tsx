import StatusBar from 'components/StatusBar'
import useGameState, { DEFAULT_STATE, GameState } from 'hooks/useLines98State'
import useLocalStorage from 'hooks/useLocalStorage'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/lines98/Game.module.scss'
import { adjustColor } from 'utils/helpers'
import { DIMENSION, isClickOnActiveBall, SIZE } from 'utils/lines98'

const Game = () => {
  const [gameState, setGameState] = useLocalStorage<GameState>('lines98', DEFAULT_STATE)

  const { moveSelectedBall, selectBall, selectDestination, bounceSelectedBall, state, restart, growBalls, shrinkBalls, undo } = useGameState(gameState)
  const { balls, score, currentState, isAnimating, prevBalls, gameOver } = state

  const reorderBalls = () => {
    const activeBalls = []
    const inactiveBalls = []
    const movingBall = []
    for (const ball of balls) {
      if (ball.isMoving) {
        movingBall.push(ball)
      } else if (ball.isActive) {
        activeBalls.push(ball)
      } else {
        inactiveBalls.push(ball)
      }
    }
    return [...inactiveBalls, ...activeBalls, ...movingBall]
  }

  const ballsWithCorrectRenderOrder = reorderBalls()

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(DIMENSION, DIMENSION).parent(canvasParentRef)
  }

  const draw = (p5: p5Types) => {
    p5.background('#d6e0e4')

    // draw lines
    p5.stroke('#a0a3ae')
    for (let i = 1; i < SIZE; i++) {
      p5.line((i * DIMENSION) / SIZE, 0, (i * DIMENSION) / SIZE, DIMENSION)
      p5.line(0, (i * DIMENSION) / SIZE, DIMENSION, (i * DIMENSION) / SIZE)
    }

    // draw balls
    p5.noStroke()

    if (currentState === 'selected') {
      bounceSelectedBall()
    } else if (currentState === 'moving') {
      moveSelectedBall()
    } else if (isAnimating) {
      growBalls()
      shrinkBalls()
    }

    for (let i = 0; i < ballsWithCorrectRenderOrder.length; i++) {
      const { color, canvasPosition, size } = ballsWithCorrectRenderOrder[i]
      const { x, y } = canvasPosition
      const d = size / 2

      const gradient = p5.drawingContext.createLinearGradient(x + d, y - d, x - d, y + d)
      gradient.addColorStop(0.25, adjustColor(color, 25))
      gradient.addColorStop(0.75, adjustColor(color, -85))
      p5.drawingContext.fillStyle = gradient
      p5.rect(x - d, y - d, size, size, size)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    const { mouseX, mouseY, floor } = p5

    let c = floor((mouseX / DIMENSION) * SIZE)
    let r = floor((mouseY / DIMENSION) * SIZE)

    if (isClickOnActiveBall({ r, c }, balls)) {
      selectBall({ r, c })
    } else if (r >= 0 && c >= 0) {
      selectDestination({ r, c })
    }
  }

  return (
    <div className={styles.container}>
      <StatusBar
        won={false}
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
            <div>0</div>
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
