import React from 'react'
import Dropdown from 'components/window/dropdown/Dropdown'
import DropdownItem from 'components/window/dropdown/DropdownItem'
import { difficultyLevels } from 'utils/slidePuzzle'

interface LevelOptionsDropdownProps {
  activeLevel: number
  changeLevel: (level: number) => void
}

const LevelOptionsDropdown: React.FC<LevelOptionsDropdownProps> = ({ activeLevel, changeLevel }) => {
  return (
    <Dropdown name="Levels">
      {difficultyLevels.map((level) => (
        <DropdownItem key={level} isActive={level == activeLevel} text={level + ' x ' + level} onClick={() => changeLevel(level)} />
      ))}
    </Dropdown>
  )
}

export default LevelOptionsDropdown
