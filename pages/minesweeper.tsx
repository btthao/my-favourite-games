import Grid from 'components/minesweeper/Grid'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { ASPECT_RATIO, MAX_WIDTH, MAX_HEIGHT } from '../constants'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Minesweeper: NextPage = () => {
  return (
    <Window
      aspectRatio={ASPECT_RATIO}
      max_height={MAX_HEIGHT}
      max_width={MAX_WIDTH}
      component={Grid}
      title="Minesweeper"
    ></Window>
  )
}

export default Minesweeper
