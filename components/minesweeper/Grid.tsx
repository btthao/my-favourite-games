import StatusBar from 'components/StatusBar'
import styles from 'styles/minesweeper/Grid.module.scss'

interface GridProps {}

const Grid: React.FC<GridProps> = ({}) => {
  return (
    <div className={styles.container}>
      <StatusBar
        gameOver={false}
        onClick={() => console.log('new game')}
        leftComponent={<div>mines left</div>}
        rightComponent={<div>timer</div>}
      />
      <div className={styles.grid}>
        {new Array(480).fill(0).map((_, idx) => (
          <div key={idx} className={styles.tile}>
            <div className={styles.inner}>
              {/* {Math.floor(idx / 30)} - {idx % 30} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Grid
