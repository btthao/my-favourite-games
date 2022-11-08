import Game from 'components/minesweeper/Game'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Minesweeper: NextPage = () => {
  return (
    <Window
      minH={480}
      minW={700}
      component={Game}
      title="Minesweeper"
      disableResize
    ></Window>
  )
}

export default Minesweeper
