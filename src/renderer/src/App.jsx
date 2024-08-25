import Versions from './components/Versions'
import LogViewer from './components/LogViewer'
import AskForFileInput from './components/AskForFileInput'
import RequestResponse from './components/RequestResponse'

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
      <RequestResponse></RequestResponse>
      <div className="actions">
        {/* <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('send-message')}>
            Send message
          </a>
        </div> */}
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('change-protocol')}>
            change protocol
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('login')}>
            login
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('upload')}>
            upload files
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-file-list')}>
            get file list
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-request-list')}>
            get request list
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-requested-list')}>
            get requested list
          </a>
        </div>
      </div>
      <LogViewer></LogViewer>
      <Versions></Versions>
    </>
  )
}

export default App
