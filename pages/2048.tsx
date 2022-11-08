import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Game from 'components/2048/Game'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game2048: NextPage = () => {
  return <Window minH={580} minW={520} component={Game} title="2048"></Window>
}

export default Game2048
