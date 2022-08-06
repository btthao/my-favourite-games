import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Grid from '../components/2048/Grid'

const Computer = dynamic(() => import('../components/Computer'), {
  ssr: false,
})

const Game2048: NextPage = () => {
  return <Computer component={Grid}></Computer>
}

export default Game2048
