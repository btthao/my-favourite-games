import React, { useState } from 'react'
import Modal from 'components/window/Modal'
import { imageOptions } from 'utils/slidePuzzle'
import ImageCard from '../miscellaneous/ImageCard'
import styles from 'styles/slidepuzzle/OptionsModal.module.scss'

interface OptionsModalProps {
  currentImage: string
  changeImage: (name: string) => void
}

const OptionsModal: React.FC<OptionsModalProps> = ({ currentImage, changeImage }) => {
  const [selectedImage, setSelectedImage] = useState(currentImage)

  const onClose = () => {
    if (selectedImage !== currentImage) {
      changeImage(selectedImage)
    }
  }

  return (
    <Modal name="Puzzles" onClose={onClose}>
      <div className={styles['options-modal']}>
        {imageOptions.map((img) => (
          <ImageCard key={img.name} {...img} onClick={() => setSelectedImage(img.src)} selected={img.src === selectedImage} width={150} height={150} />
        ))}
      </div>
    </Modal>
  )
}

export default OptionsModal
