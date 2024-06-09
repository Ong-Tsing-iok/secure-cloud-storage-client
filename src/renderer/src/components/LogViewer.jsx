import React, { useEffect, useState } from 'react'

const LogViewer = () => {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const handleLog = (_event, log) => {
      setLogs((prevLogs) => [...prevLogs, log])
      // console.log(log)
    }

    // Listen for log events
    window.electron.ipcRenderer.on('log', handleLog)

    // Cleanup on component unmount
    return () => {
      window.electron.ipcRenderer.removeListener('log', handleLog)
    }
  }, [])

  return (
    <div
      style={{
        height: '300px',
        width: '100%',
        overflowY: 'scroll',
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#f9f9f9'
      }}
    >
      {logs.map((log, index) => (
        <div key={index} style={{ color: getColorForLevel(log.level) }}>
          [{log.level}] {log.message}
        </div>
      ))}
    </div>
  )
}

const getColorForLevel = (level) => {
  switch (level) {
    case 'info':
      return 'black'
    case 'warn':
      return 'orange'
    case 'error':
      return 'red'
    default:
      return 'black'
  }
}

export default LogViewer
