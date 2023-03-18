import React from 'react'
import Modal from 'components/window/modal/Modal'

interface GameOverModalProps {
  restart: () => void
}

const GameOverModal: React.FC<GameOverModalProps> = ({ restart }) => {
  return (
    <Modal showOnRender={true} timeOut={1000}>
      <p>That&apos;s sad :(</p>
      <button className="game-over" onClick={restart}>
        Restart
      </button>
    </Modal>
  )
}

export default GameOverModal
