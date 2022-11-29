import useGameState, { DEFAULT_STATE, GameState } from 'hooks/useLines98State'
import useLocalStorage from 'hooks/useLocalStorage'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/lines98/Game.module.scss'
import { DIMENSION, SIZE } from 'utils/lines98'

const Game = () => {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    'lines98',
    DEFAULT_STATE
  )

  const { click, state, bounceSelectedBall } = useGameState(gameState)
  const { balls, gameOver } = state

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
    for (let i = 0; i < balls.length; i++) {
      const { color, canvasPosition, size, isSelected } = balls[i]
      const { x, y } = canvasPosition

      if (isSelected) {
        bounceSelectedBall()
      }

      p5.fill(color)
      p5.ellipse(x, y, size)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    const { mouseX, mouseY, floor } = p5

    let c = floor((mouseX / DIMENSION) * SIZE)
    let r = floor((mouseY / DIMENSION) * SIZE)

    click({ r, c })
  }

  return (
    <div className={styles.container}>
      <div></div>
      <div>
        {/* @ts-ignore */}
        <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />
      </div>
    </div>
  )
}

export default Game
