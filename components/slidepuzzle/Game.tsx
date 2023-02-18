import StatusBar from 'components/window/StatusBar'
import useGameState from 'hooks/useSlidePuzzle'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/slidepuzzle/Game.module.scss'
import { DIMENSION, TileState } from 'utils/slidePuzzle'

const Game: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { newGame, state, clickTile, initializeTiles } = useGameState()
  const { imageSrc, tiles, tilesPerSide, tileSize } = state

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(DIMENSION, DIMENSION).parent(canvasParentRef)

    p5.loadImage(imageSrc, (img) => {
      const tilesCutFromImage: TileState[] = []

      for (let r = 0; r < tilesPerSide; r++) {
        for (let c = 0; c < tilesPerSide; c++) {
          const idx = tilesPerSide * r + c

          const width = img.width / tilesPerSide
          const height = img.height / tilesPerSide

          const cutImg = p5.createImage(width, height)

          cutImg.copy(img, c * width, r * height, width, height, 0, 0, width, height)

          tilesCutFromImage.push({ img: cutImg, correctIdx: idx })
        }
      }

      tilesCutFromImage.pop()

      initializeTiles(tilesCutFromImage)
    })

    p5.stroke('#6c9d66')
    p5.strokeWeight(0.5)
  }

  const draw = (p5: p5Types) => {
    p5.background('#6c9d66')

    // draw images
    for (let i = 0; i < tiles.length; i++) {
      const { canvasPosition, img } = tiles[i]

      if (!img || !canvasPosition) continue

      p5.image(img, canvasPosition.x, canvasPosition.y, tileSize, tileSize)
    }

    // draw lines
    for (let i = 1; i < tilesPerSide; i++) {
      p5.line((i * DIMENSION) / tilesPerSide, 0, (i * DIMENSION) / tilesPerSide, DIMENSION)
      p5.line(0, (i * DIMENSION) / tilesPerSide, DIMENSION, (i * DIMENSION) / tilesPerSide)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    if (disabled) return

    const { mouseX, mouseY, floor } = p5

    const clickedOutsideSketch = mouseX <= 0 || mouseY <= 0 || mouseX >= DIMENSION || mouseY >= DIMENSION

    if (clickedOutsideSketch) return

    let c = floor((mouseX / DIMENSION) * tilesPerSide)
    let r = floor((mouseY / DIMENSION) * tilesPerSide)

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
        <Sketch key={imageSrc + tilesPerSide} setup={setup} draw={draw} mouseClicked={mouseClicked} />
      </div>
    </div>
  )
}

export default Game
