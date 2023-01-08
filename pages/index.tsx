import Game2048 from 'components/2048/2048'
import Lines98 from 'components/lines98/lines98'
import Minesweeper from 'components/minesweeper/minesweeper'
import type { NextPage } from 'next'
import { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react'

const INITIAL_ZINDEX = 50

export const WindowZIndexContext = createContext<{ currentHighestZIndex: number; setCurrentHighestZIndex: Dispatch<SetStateAction<number>> }>({
  currentHighestZIndex: INITIAL_ZINDEX,
  setCurrentHighestZIndex() {
    return INITIAL_ZINDEX
  },
})

const Home: NextPage = () => {
  const [currentHighestZIndex, setCurrentHighestZIndex] = useState(INITIAL_ZINDEX)
  const value = useMemo(() => ({ currentHighestZIndex, setCurrentHighestZIndex }), [currentHighestZIndex])

  return (
    <WindowZIndexContext.Provider value={value}>
      <div className="main-page-folders">
        <Game2048 />
        <Minesweeper />
        <Lines98 />
      </div>
    </WindowZIndexContext.Provider>
  )
}

export default Home
