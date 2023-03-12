import React from 'react'
import Dropdown from 'components/window/dropdown/Dropdown'
import DropdownItem from 'components/window/dropdown/DropdownItem'

interface HelpDropdownProps {
  isShowingHint: boolean
  restart: () => void
  toggleShowHint: () => void
}

const HelpDropdown: React.FC<HelpDropdownProps> = ({ isShowingHint, toggleShowHint, restart }) => {
  return (
    <Dropdown name="Help">
      <DropdownItem isActive={isShowingHint} text="Show Hint" onClick={toggleShowHint} />
      <DropdownItem text="Restart" onClick={restart} />
    </Dropdown>
  )
}

export default HelpDropdown
