import { Card, Textarea, Typography } from '@material-tailwind/react'
import { useState } from 'react'

function Console() {
  const [consoleText, setConsoleText] = useState(
    '登入成功嘗試獲取\ntoken1232132123132132132123123132123132132121321321321321321321321321321321321321321asdfasdfasdf\n\n\n\n\n123'
  )

  return (
    <Card className="h-36 min-h-36 w-full p-4 border-2 overflow-auto">
      <Typography className="w-full h-full text-left whitespace-pre-wrap break-all">
        {consoleText}
      </Typography>
    </Card>
  )
}

export default Console
