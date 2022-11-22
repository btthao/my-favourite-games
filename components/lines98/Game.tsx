import React, { useRef, useEffect, useState } from 'react'
import p5 from 'p5'
import useGameState, { DEFAULT_STATE, GameState } from 'hooks/useLines98State'
import styles from 'styles/lines98/Game.module.scss'
import StatusBar from 'components/StatusBar'
import useLocalStorage from 'hooks/useLocalStorage'
import { createBall, DIMENSION, getStartingBalls, SIZE } from 'utils/lines98'

const Game = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useLocalStorage<GameState>(
    'lines98',
    DEFAULT_STATE
  )

  const { selectBall, state, bounceSelectedBall } = useGameState(gameState)
  const { balls, gameOver, board } = state

  const Sketch = (p: any) => {
    p.setup = () => {
      p.createCanvas(DIMENSION, DIMENSION)
    }

    p.draw = () => {
      bounceSelectedBall()

      p.background('#BAC3C6')

      // draw lines
      p.stroke('#b3a199')
      for (let i = 1; i < SIZE; i++) {
        p.line((i * DIMENSION) / SIZE, 0, (i * DIMENSION) / SIZE, DIMENSION)
        p.line(0, (i * DIMENSION) / SIZE, DIMENSION, (i * DIMENSION) / SIZE)
      }

      // draw balls
      p.noStroke()

      //   console.log('total balls', balls.length)

      for (let i = 0; i < balls.length; i++) {
        const { color, isMoving, isSelected, canvasPosition, size } = balls[i]
        const { x, y } = canvasPosition

        console.log(isSelected)

        p.fill(color)

        p.ellipse(x, y, size)
      }
    }

    p.mouseClicked = () => {
      const { mouseX, mouseY, floor } = p

      let c = floor((mouseX / DIMENSION) * SIZE)
      let r = floor((mouseY / DIMENSION) * SIZE)

      selectBall({ r, c })

      // Passing information from the child up to the parent
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      new p5(Sketch, containerRef.current)
    }
  }, [])

  // Note: you're going to want to defined an element to contain the p5.js canvas
  return (
    <div className={styles.container}>
      <div>
        {/* <StatusBar
          won={false}
          gameOver={gameOver}
          onClick={() => console.log('hi')}
          leftComponent={
            <>
              <div>Score</div>
            </>
          }
          rightComponent={
            <>
              <div>Best</div>
            </>
          }
        /> */}
      </div>
      <div ref={containerRef}></div>
    </div>
  )
}

export default Game
