import { useState } from 'react'

const AskForFileInput = () => {
  const [input, setInput] = useState('')

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter file uuid"
      />
      <button
        onClick={() => {
          window.electron.ipcRenderer.send('download', input)
          setInput('')
        }}
      >
        ask
      </button>
      <button
        onClick={() => {
          window.electron.ipcRenderer.send('delete', input)
          setInput('')
        }}
      >
        delete file
      </button>
      <button
        onClick={() => {
          window.electron.ipcRenderer.send('delete-request', input)
          setInput('')
        }}
      >
        delete request
      </button>
    </div>
  )
}

export default AskForFileInput
