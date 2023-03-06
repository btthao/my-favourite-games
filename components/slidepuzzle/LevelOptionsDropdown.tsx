import React from 'react'
import Dropdown from 'components/window/dropdown/Dropdown'
import DropdownItem from 'components/window/dropdown/DropdownItem'
import { difficultyLevels } from 'utils/slidePuzzle'

interface LevelOptionsDropdownProps {
  activeLevel: number
}

const LevelOptionsDropdown: React.FC<LevelOptionsDropdownProps> = ({ activeLevel }) => {
  return (
    <Dropdown name="Levels">
      {difficultyLevels.map((level) => (
        <DropdownItem key={level} isActive={level == activeLevel} text={level + ' x ' + level} onSelect={() => console.log('h')} onDeselect={() => console.log('h')} />
      ))}
    </Dropdown>
  )
}

export default LevelOptionsDropdown
