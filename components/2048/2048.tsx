import dynamic from 'next/dynamic'
import Game from 'components/2048/Game'

const Window = dynamic(() => import('components/window/Window'), {
  ssr: false,
})

const Game2048 = () => {
  return <Window minHeight={580} minWidth={520} component={Game} title="2048"></Window>
}

export default Game2048
