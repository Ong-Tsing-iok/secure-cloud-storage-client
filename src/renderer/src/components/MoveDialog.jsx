import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  List,
  ListItem,
  Typography,
  ListItemPrefix
} from '@material-tailwind/react'
import { FolderIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { useState } from 'react'
import toast from 'react-hot-toast'

function MoveDialog({ open, setOpen, fileId }) {
  const [paths, setPaths] = useState([
    '/',
    '/folder146546546546546546546546546546546546546546546546546654654654654654656546546546546546546546546546546546',
    '/folder2',
    '/folder3',
    '/folder4',
    '/',
    '/folder1',
    '/folder2',
    '/folder3',
    '/folder4',
    '/',
    '/folder1',
    '/folder2',
    '/folder3',
    '/folder4',
    '/',
    '/folder1',
    '/folder2',
    '/folder3',
    '/folder4'
  ])
  const [selectedPath, setSelectedPath] = useState('/')
  function moveHandler() {
    toast.success(`成功移動檔案至${selectedPath}`)
    setOpen(!open)
    // TODO: call move api
  }
  return (
    <Dialog
      open={open}
      handler={() => setOpen(!open)}
      className="flex flex-col max-h-screen overflow-auto"
    >
      <DialogHeader>移動檔案至</DialogHeader>
      <DialogBody className="flex w-full grow overflow-auto">
        {/**Search box // TODO also set path in input box when selected*/}
        <List className="overflow-auto">
          {paths.map((item, index) => {
            return (
              <ListItem
                key={index}
                ripple={false}
                selected={selectedPath === paths[index]}
                onClick={() => setSelectedPath(paths[index])}
                className="flex flex-row"
              >
                <ListItemPrefix>
                  <FolderIcon className="size-4" />
                </ListItemPrefix>
                {/* <div className="overflow-x-auto"> */}
                <Typography className="text-wrap break-all">{item}</Typography>
                {/* </div> */}
              </ListItem>
            )
          })}
        </List>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={() => setOpen(!open)}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={() => moveHandler()}>
          移動
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
MoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  fileId: PropTypes.string.isRequired
}

export default MoveDialog
