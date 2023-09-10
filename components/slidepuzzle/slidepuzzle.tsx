import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/window/Window'), {
  ssr: false,
})

const Game = dynamic(() => import('components/slidepuzzle/Game'), {
  ssr: false,
})

const SlidePuzzle = () => {
  return <Window minHeight={570} minWidth={770} component={Game} title="Slide Puzzle" disableResize></Window>
}

export default SlidePuzzle
