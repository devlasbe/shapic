import LeftPanel from './left-panel'
import CenterPanel from './center-panel'
import RightPanel from './right-panel'
import ProgressBar from '../progress-bar'

const AppLayout = () => {
  return (
    <div className="flex flex-col w-screen h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <ProgressBar />
    </div>
  )
}

export default AppLayout
