// import Versions from './components/Versions'
import LogViewer from './components/LogViewer'
import AskForFileInput from './components/AskForFileInput'
import RequestResponse from './components/RequestResponse'
import NavBar from './components/NavBar'
import MainView from './components/MainView'
import { Button } from '@material-tailwind/react'

function App() {
  const ipcHandle = (message) => window.electron.ipcRenderer.send(message)

  return (
    // <div className="flex h-screen">
    <div className="flex flex-row">
      <NavBar></NavBar>
      <MainView></MainView>
    </div>
    // </div>
  )
}

export default App
