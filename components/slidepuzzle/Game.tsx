import MenuBar from 'components/window/MenuBar'
import useGameState from 'hooks/useSlidePuzzle'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/slidepuzzle/Game.module.scss'
import { DIMENSION, TileState } from 'utils/slidePuzzle'
import OptionsModal from './OptionsModal'
import GameInfo from './GameInfo'

const Game: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { newGame, state, clickTile, initializeTiles, changeImage } = useGameState()
  const { imageSrc, tiles, tilesPerSide, tileSize, moveCounts, timer } = state

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

    p5.stroke('#8094bf')
    p5.strokeWeight(0.5)
  }

  const draw = (p5: p5Types) => {
    p5.background('#8094bf')

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
      <MenuBar>
        <OptionsModal currentImage={imageSrc} changeImage={changeImage} />
      </MenuBar>
      <div className={styles.grid}>
        <div>
          {/* @ts-ignore */}
          <Sketch key={imageSrc + tilesPerSide} setup={setup} draw={draw} mouseClicked={mouseClicked} />
        </div>
        <GameInfo imageSrc={imageSrc} timer={timer} moveCounts={moveCounts} />
      </div>
    </div>
  )
}

export default Game
