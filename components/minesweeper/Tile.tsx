import { BsFillFlagFill } from 'react-icons/bs'
import { FaBomb } from 'react-icons/fa'
import { MdOutlineClose } from 'react-icons/md'
import styles from 'styles/minesweeper/Tile.module.scss'
import { TileState } from 'utils/minesweeper'

interface TileProps extends TileState {
  index: number
  reveal: (index: number) => void
  flag: (index: number) => void
  gameOver: boolean
}

const Tile: React.FC<TileProps> = ({ index, hasMine, isFlagged, isRevealed, isClickedMine, surroundingMines, reveal, flag, gameOver }) => {
  let className = styles.tile

  if (isRevealed) {
    className += ' ' + styles.revealed
  }

  if (isClickedMine) {
    className += ' ' + styles['clicked-mine']
  }

  const showSurroundingMines = isRevealed && !hasMine && surroundingMines > 0
  const showFlag = isFlagged && (!gameOver || hasMine)
  const showWrongFlag = gameOver && !hasMine && isFlagged
  const showMine = (isRevealed && hasMine) || showWrongFlag

  return (
    <div
      className={className}
      onClick={() => reveal(index)}
      onContextMenu={(e) => {
        e.preventDefault()
        flag(index)
      }}
    >
      <div className={styles.inner} data-value={showSurroundingMines ? surroundingMines : null}>
        {showFlag ? <BsFillFlagFill className={styles.flag} /> : showMine ? <FaBomb /> : showSurroundingMines ? surroundingMines : ''}
        {showWrongFlag && <MdOutlineClose className={styles['wrong-flag']} />}
      </div>
    </div>
  )
}

export default Tile
