import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Grid from 'components/2048/Grid'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game2048: NextPage = () => {
  return <Window component={Grid} title="2048"></Window>
}

export default Game2048
