import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import LogViewer from './components/LogViewer'
import AskForFileInput from './components/AskForFileInput'

function App() {
  const ipcHandle = (message) => window.electron.ipcRenderer.send(message)

  return (
    <>
      {/* <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p> */}
      <AskForFileInput></AskForFileInput>
      <div className="actions">
        {/* <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('send-message')}>
            Send message
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-keys')}>
            get keys
          </a>
        </div> */}
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('login')}>
            login
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('upload')}>
            upload a file
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-file-list')}>
            get file list
          </a>
        </div>
      </div>
      <LogViewer></LogViewer>
      <Versions></Versions>
    </>
  )
}

export default App
