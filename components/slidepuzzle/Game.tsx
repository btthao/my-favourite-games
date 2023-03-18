import MenuBar from 'components/window/MenuBar'
import useGameState, { GameSettings, GAME_SETTINGS } from 'hooks/useSlidePuzzle'
import p5Types from 'p5'
import Sketch from 'react-p5'
import styles from 'styles/slidepuzzle/Game.module.scss'
import { DIMENSION, TileState } from 'utils/slidePuzzle'
import PuzzleImgOptionsModal from './PuzzleImgOptionsModal'
import GameInfo from './GameInfo'
import LevelOptionsDropdown from './LevelOptionsDropdown'
import HelpDropdown from './HelpDropdown'
import Confetti from 'components/miscellaneous/Confetti'
import GameOverModal from 'components/miscellaneous/GameOverModal'
import useLocalStorage from 'hooks/useLocalStorage'
import { useEffect } from 'react'

const Game: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const [localStorage, setLocalStorage] = useLocalStorage<GameSettings>('slidepuzzle', GAME_SETTINGS)
  const { newGame, state, clickTile, initializeTiles, changeImage, changeLevel, toggleShowHint } = useGameState(localStorage)
  const { imageSrc, tiles, tilesPerSide, tileSize, moveCounts, finished, showHint, isLoading, gameCount } = state

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
      const { canvasPosition, img, correctIdx } = tiles[i]

      if (!img || !canvasPosition) continue

      p5.image(img, canvasPosition.x, canvasPosition.y, tileSize, tileSize)

      if (showHint) {
        p5.textSize(Math.max(tileSize / 7, 13))
        p5.text(correctIdx + 1, canvasPosition.x + tileSize / 15, canvasPosition.y + tileSize * 0.93)
        p5.fill(255)
      }
    }

    // draw lines
    for (let i = 1; i < tilesPerSide; i++) {
      p5.line((i * DIMENSION) / tilesPerSide, 0, (i * DIMENSION) / tilesPerSide, DIMENSION)
      p5.line(0, (i * DIMENSION) / tilesPerSide, DIMENSION, (i * DIMENSION) / tilesPerSide)
    }
  }

  const mouseClicked = (p5: p5Types) => {
    if (disabled || finished) return

    const { mouseX, mouseY, floor } = p5

    const clickedOutsideSketch = mouseX <= 0 || mouseY <= 0 || mouseX >= DIMENSION || mouseY >= DIMENSION

    if (clickedOutsideSketch) return

    let c = floor((mouseX / DIMENSION) * tilesPerSide)
    let r = floor((mouseY / DIMENSION) * tilesPerSide)

    clickTile({ r, c })
  }

  useEffect(() => {
    setLocalStorage({ imageSrc, showHint, tilesPerSide })
  }, [imageSrc, tilesPerSide, showHint])

  return (
    <div className={styles.container}>
      <MenuBar>
        <PuzzleImgOptionsModal currentImage={imageSrc} changeImage={changeImage} />
        <LevelOptionsDropdown activeLevel={tilesPerSide} changeLevel={changeLevel} />
        <HelpDropdown restart={newGame} isShowingHint={showHint} toggleShowHint={toggleShowHint} />
      </MenuBar>
      <div className={styles.grid}>
        <div className={styles.sketch}>
          {/* @ts-ignore */}
          <Sketch key={imageSrc + tilesPerSide + gameCount} setup={setup} draw={draw} mouseClicked={mouseClicked} />
          {isLoading && <div className={styles.loading}>Slicing images...</div>}
        </div>
        <GameInfo key={imageSrc + tilesPerSide + gameCount} imageSrc={imageSrc} moveCounts={moveCounts} finished={finished} />
      </div>
      {finished && <Confetti />}
      {finished && <GameOverModal won={true} restart={newGame} />}
    </div>
  )
}

export default Game
