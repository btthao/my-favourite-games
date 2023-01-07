import Game from 'components/minesweeper/Game'
import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Minesweeper = () => {
  return <Window minHeight={525} minWidth={770} component={Game} title="Minesweeper" disableResize></Window>
}

export default Minesweeper
