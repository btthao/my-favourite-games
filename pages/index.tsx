import Game2048 from 'components/2048/2048'
import Lines98 from 'components/lines98/lines98'
import Minesweeper from 'components/minesweeper/minesweeper'
import WindowsManager from 'components/window/WindowsManager'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <WindowsManager>
      <div className="main-page-folders">
        <Game2048 />
        <Minesweeper />
        <Lines98 />
      </div>
    </WindowsManager>
  )
}

export default Home
