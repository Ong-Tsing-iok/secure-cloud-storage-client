import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const ipcHandle = (message) => window.electron.ipcRenderer.send(message)

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('send-message')}>
            Send message
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('get-keys')}>
            get keys
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={() => ipcHandle('login')}>
            login
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
