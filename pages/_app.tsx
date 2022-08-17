import 'styles/globals.scss'
import type { AppProps } from 'next/app'
import Menu from 'components/Menu'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="page-wrapper">
      <Menu />
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
