import { useState } from 'react'

const RequestResponse = () => {
  const [input, setInput] = useState('')

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter request uuid"
      />
      <button
        onClick={() => {
          window.electron.ipcRenderer.send('request-agree', input)
          setInput('')
        }}
      >
        agree
      </button>
      <button
        onClick={() => {
          window.electron.ipcRenderer.send('request-reject', input)
          setInput('')
        }}
      >
        reject
      </button>
    </div>
  )
}

export default RequestResponse
