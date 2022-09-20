import styles from 'styles/minesweeper/Tile.module.scss'
import { TileState } from 'utils/minesweeper'
import { FaBomb } from 'react-icons/fa'

interface TileProps extends TileState {
  index: number
  isNull: boolean
  firstClick: (index: number) => void
}

const Tile: React.FC<TileProps> = ({
  index,
  isNull,
  firstClick,
  hasMine,
  isFlagged,
  isRevealed,
  surroundingMines,
}) => {
  if (isNull) {
    return <div className={styles.tile} onClick={() => firstClick(index)}></div>
  }

  return (
    <div className={styles.tile}>
      <div className={styles.inner}>
        {hasMine ? (
          <FaBomb className={styles.mine} />
        ) : surroundingMines > 0 ? (
          surroundingMines
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default Tile
