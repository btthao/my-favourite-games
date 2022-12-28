import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game = dynamic(() => import('components/lines98/Game'), {
  ssr: false,
})

// recalculate minH and W based on window size
const Lines98: NextPage = () => {
  return <Window minH={626} minW={500} component={Game} title="Lines 98" disableResize></Window>
}

export default Lines98
