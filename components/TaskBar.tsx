import { GiVampireDracula } from 'react-icons/gi'
import styles from 'styles/TaskBar.module.scss'

interface TaskBarProps {}

const TaskBar: React.FC<TaskBarProps> = ({}) => {
  return (
    <div className={styles.container}>
      <div>
        <GiVampireDracula />
      </div>
    </div>
  )
}

export default TaskBar
