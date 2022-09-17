import 'styles/globals.scss'
import type { AppProps } from 'next/app'
import Menu from 'components/Menu'
import TaskBar from 'components/TaskBar'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="page-wrapper">
      <Menu />
      <Component {...pageProps} />
      <TaskBar />
    </div>
  )
}

export default MyApp
