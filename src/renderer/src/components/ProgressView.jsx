import { Card, Button, List, ListItem, Typography, Progress } from '@material-tailwind/react'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const ProgressType = Object.freeze({
  progressing: 'progressing',
  success: 'success',
  failure: 'failure'
})

const testList = [
  {
    type: 'download',
    filename: 'test.txt',
    progress: 0.5,
    status: ProgressType.progressing
  },
  {
    type: 'upload',
    filename: 'test.txt',
    progress: 0.5,
    status: ProgressType.failure
  },
  {
    type: 'upload',
    filename: 'test1234567894561235464798.txt',
    progress: 1.0,
    status: ProgressType.success
  },
  {
    type: 'download',
    filename: 'test1234567894561235464798.txt',
    progress: 0.8,
    status: ProgressType.progressing
  },
  {
    type: 'download',
    filename: 'test1234567894561235464798.txt',
    progress: 1.1,
    status: ProgressType.success
  }
]

function CheckCardShow() {
  return false
}

function ProgressView() {
  const [cardOpen, setCardOpen] = useState(true)
  const [cardShow, setCardShow] = useState(true)
  const [progressList, setProgressList] = useState([...testList])
  if (!cardShow) return null

  return (
    <Card className="fixed flex w-64 bottom-0 right-4 z-10">
      {/**Hide List button */}
      <div className="flex flex-row w-full h-18 justify-end items-center">
        {/* <Typography className="justify-self-center m-4" variant="h5">進度</Typography> */}
        <Button variant="text" className="flex items-center" onClick={() => setCardOpen(!cardOpen)}>
          {cardOpen ? <ChevronDownIcon className="size-5" /> : <ChevronUpIcon className="size-5" />}
        </Button>
        <Button
          variant="text"
          className="flex items-center"
          onClick={() => setCardShow(CheckCardShow())}
        >
          <XMarkIcon className="size-5" />
        </Button>
      </div>
      {/**progress list*/}
      {cardOpen && (
        <List className="w-full max-h-64 overflow-auto">
          {/**progress objects */}
          {progressList.map((item, index) => {
            return (
              <ListItem className="flex flex-col divide-y-2 space-y-0.5" ripple={false} key={index}>
                <div className="flex flex-row w-full justify-start items-center space-x-1">
                  {item.type === 'download' ? (
                    <ArrowDownTrayIcon className="size-5 min-w-5 min-h-5"></ArrowDownTrayIcon>
                  ) : (
                    <ArrowUpTrayIcon className="size-5 min-w-5 min-h-5"></ArrowUpTrayIcon>
                  )}
                  <Typography className="truncate">{item.filename}</Typography>
                </div>
                <Progress
                  value={item.progress * 100}
                  color={
                    item.status === ProgressType.progressing
                      ? 'blue-gray'
                      : item.status === ProgressType.success
                        ? 'green'
                        : 'red'
                  }
                  size="sm"
                />
              </ListItem>
            )
          })}
        </List>
      )}
    </Card>
  )
}

export default ProgressView
