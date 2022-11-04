import styles from 'styles/Menu.module.scss'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Folder: React.FC = () => {
  return (
    <div>
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        version="1"
        viewBox="0 0 48 48"
        enableBackground="new 0 0 48 48"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="folder-back"
          d="M38,12H22l-4-4H8c-2.2,0-4,1.8-4,4v24c0,2.2,1.8,4,4,4h31c1.7,0,3-1.3,3-3V16C42,13.8,40.2,12,38,12z"
        ></path>
        <path
          id="folder-front"
          d="M42.2,18H15.3c-1.9,0-3.6,1.4-3.9,3.3L8,40h31.7c1.9,0,3.6-1.4,3.9-3.3l2.5-14C46.6,20.3,44.7,18,42.2,18z"
        ></path>
      </svg>
    </div>
  )
}

const games = [
  {
    name: '2048',
    link: '/2048',
  },
  {
    name: 'minesweeper',
    link: '/minesweeper',
  },
  {
    name: 'lines 98',
    link: '/lines98',
  },
]

const Menu: React.FC = () => {
  const router = useRouter()
  return (
    <div className={styles.menu}>
      {games.map((game) => (
        <div
          key={game.name}
          className={`${router.asPath === game.link ? styles.disabled : ''}`}
        >
          <Link href={game.link}>
            <div className={styles.folder}>
              <Folder />
              <p>{game.name}</p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Menu
