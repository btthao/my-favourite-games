import React from 'react'
import Dropdown from 'components/window/dropdown/Dropdown'
import DropdownItem from 'components/window/dropdown/DropdownItem'

interface LevelOptionsDropdownProps {
  isShowingHint: boolean
  toggleShowHint: () => void
}

const ShowHintDropdown: React.FC<LevelOptionsDropdownProps> = ({ isShowingHint, toggleShowHint }) => {
  return (
    <Dropdown name="Help">
      <DropdownItem isActive={isShowingHint} text="Show Hint" onClick={toggleShowHint} />
    </Dropdown>
  )
}

export default ShowHintDropdown
