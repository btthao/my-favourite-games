import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})
const Sketch = dynamic(() => import('components/lines98/Sketch'), {
  ssr: false,
})

// recalculate minH and W based on window size
const Lines98: NextPage = () => {
  return (
    <Window
      minH={620}
      minW={500}
      component={Sketch}
      title="Lines 98"
      disableResize
    ></Window>
  )
}

export default Lines98
