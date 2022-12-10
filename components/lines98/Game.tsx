import useGameState, { DEFAULT_STATE, GameState } from 'hooks/useLines98State'
import useLocalStorage from 'hooks/useLocalStorage'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/lines98/Game.module.scss'
import { DIMENSION, isClickOnActiveBall, SIZE } from 'utils/lines98'

const Game = () => {
  const [gameState, setGameState] = useLocalStorage<GameState>('lines98', DEFAULT_STATE)

  const { moveSelectedBall, selectBall, selectDestination, bounceSelectedBall, state, restart, growBalls, shrinkBalls } = useGameState(gameState)
  const { balls, score, currentState, isAnimating } = state

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
    p5.background('#BAC3C6')

    // draw lines
    p5.stroke('#b3a199')
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

      p5.fill(color)
      p5.ellipse(x, y, size)
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
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          restart()
        }}
      >
        {score}
      </div>
      <div>
        {/* @ts-ignore */}
        <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />
      </div>
    </div>
  )
}

export default Game
