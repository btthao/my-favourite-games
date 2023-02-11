import StatusBar from 'components/window/StatusBar'
import useGameState from 'hooks/useSlidePuzzle'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/slidepuzzle/Game.module.scss'
import { DIMENSION, TileState } from 'utils/slidePuzzle'

const Game: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { newGame, state, clickTile, initializeTiles } = useGameState()
  const { imageSrc, tiles, difficulty } = state
  const tileSize = DIMENSION / difficulty

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(DIMENSION, DIMENSION).parent(canvasParentRef)

    p5.loadImage(imageSrc, (img) => {
      const tilesCutFromImage: TileState[] = []

      for (let r = 0; r < difficulty; r++) {
        for (let c = 0; c < difficulty; c++) {
          const idx = difficulty * r + c

          const width = img.width / 4
          const height = img.height / 4

          let cutImg = p5.createImage(width, height)

          cutImg.copy(img, c * width, r * height, width, height, 0, 0, width, height)

          tilesCutFromImage.push({ img: cutImg, correctIdx: idx, currentIdx: idx, position: { r, c } })
        }
      }

      tilesCutFromImage.pop()

      initializeTiles(tilesCutFromImage)
    })

    p5.stroke('#6c9d66')
    p5.strokeWeight(0.75)
  }

  const draw = (p5: p5Types) => {
    p5.background('#6c9d66')

    for (const tile of tiles) {
      const { img, position } = tile

      const x = tileSize * position.c
      const y = tileSize * position.r

      p5.image(img, x, y, tileSize, tileSize)
    }

    // draw lines
    for (let i = 1; i < difficulty; i++) {
      p5.line((i * DIMENSION) / difficulty, 0, (i * DIMENSION) / difficulty, DIMENSION)
      p5.line(0, (i * DIMENSION) / difficulty, DIMENSION, (i * DIMENSION) / difficulty)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    if (disabled) return

    const { mouseX, mouseY, floor } = p5

    const clickedOutsideSketch = mouseX <= 0 || mouseY <= 0 || mouseX >= DIMENSION || mouseY >= DIMENSION

    if (clickedOutsideSketch) return

    let c = floor((mouseX / DIMENSION) * difficulty)
    let r = floor((mouseY / DIMENSION) * difficulty)

    clickTile({ r, c })
  }

  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={false}
        restart={newGame}
        leftComponent={
          <>
            {/* <div>{score}</div> */}
            <div>Score</div>
          </>
        }
        rightComponent={
          <>
            {/* <div>{bestScore}</div> */}
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
