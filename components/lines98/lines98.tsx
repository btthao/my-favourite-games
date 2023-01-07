import dynamic from 'next/dynamic'

const Window = dynamic(() => import('components/Window'), {
  ssr: false,
})

const Game = dynamic(() => import('components/lines98/Game'), {
  ssr: false,
})

const Lines98 = () => {
  return <Window minHeight={626} minWidth={500} component={Game} title="Lines 98" disableResize></Window>
}

export default Lines98
