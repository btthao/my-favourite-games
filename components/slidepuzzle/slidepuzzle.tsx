import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/window/Window'), {
  ssr: false,
})

const Game = dynamic(() => import('components/slidepuzzle/Game'), {
  ssr: false,
})

const SlidePuzzle = () => {
  return <Window minHeight={626} minWidth={500} component={Game} title="Taylor's Puzzle" disableResize></Window>
}

export default SlidePuzzle