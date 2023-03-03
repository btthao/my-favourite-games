import React from 'react'
import { GameState } from 'hooks/useSlidePuzzle'
import Image from 'next/image'
import styles from 'styles/slidepuzzle/GameInfo.module.scss'
import Timer from 'components/miscellaneous/Timer'

type GameInfoProps = Required<Pick<GameState, 'imageSrc' | 'moveCounts'>>

const GameInfo: React.FC<GameInfoProps> = ({ imageSrc, moveCounts }) => {
  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <div>
          <h6>Moves: </h6>
          <p>{moveCounts}</p>
        </div>
        <div>
          <h6>Timer: </h6>
          <p>
            <Timer />
          </p>
        </div>
      </div>
      <div className={styles.preview}>
        <h6>Preview</h6>
        <div>
          <Image src={imageSrc} alt={'main'} width="200px" height="200px" />
        </div>
      </div>
    </div>
  )
}

export default GameInfo
