import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Grid from 'components/2048/Grid'
import {
  ASPECT_RATIO_2048,
  MAX_WIDTH_2048,
  MAX_HEIGHT_2048,
} from '../constants'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game2048: NextPage = () => {
  return (
    <Window
      aspectRatio={ASPECT_RATIO_2048}
      max_height={MAX_HEIGHT_2048}
      max_width={MAX_WIDTH_2048}
      component={Grid}
      title="2048"
    ></Window>
  )
}

export default Game2048
