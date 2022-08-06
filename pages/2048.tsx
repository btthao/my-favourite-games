import type { NextPage } from 'next'
import Grid from '../components/2048/Grid'
import Computer from '../components/Computer'

const Game2048: NextPage = () => {
  return <Computer component={Grid}></Computer>
}

export default Game2048
