import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Grid from 'components/2048/Grid'
import { ASPECT_RATIO, MAX_WIDTH, MAX_HEIGHT } from '../constants'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game2048: NextPage = () => {
  return (
    <Window
      aspectRatio={ASPECT_RATIO}
      max_height={MAX_HEIGHT}
      max_width={MAX_WIDTH}
      component={Grid}
      title="2048"
    ></Window>
  )
}

export default Game2048
