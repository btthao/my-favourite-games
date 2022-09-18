import Grid from 'components/minesweeper/Grid'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import {
  ASPECT_RATIO_MINESWEEPER,
  MAX_WIDTH_MINESWEEPER,
  MAX_HEIGHT_MINESWEEPER,
} from '../constants'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Minesweeper: NextPage = () => {
  return (
    <Window
      aspectRatio={ASPECT_RATIO_MINESWEEPER}
      max_height={MAX_HEIGHT_MINESWEEPER}
      max_width={MAX_WIDTH_MINESWEEPER}
      component={Grid}
      title="Minesweeper"
    ></Window>
  )
}

export default Minesweeper
