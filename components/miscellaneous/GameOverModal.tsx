import React from 'react'
import Modal from 'components/window/modal/Modal'

interface GameOverModalProps {
  restart: () => void
  won?: boolean
}

const GameOverModal: React.FC<GameOverModalProps> = ({ restart, won = false }) => {
  const text = won ? 'Yass' : "That' sad :("
  return (
    <Modal showOnRender={true} timeOut={1000}>
      <p>{text}</p>
      <button className="game-over" onClick={restart}>
        New game
      </button>
    </Modal>
  )
}

export default GameOverModal
