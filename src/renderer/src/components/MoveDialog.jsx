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
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import CurPathBreadcrumbs from './CurPathBreadcrumbs'

const rootFolder = { name: 'root', id: null }

function MoveDialog({ open, setOpen, fileData }) {
  // TODO: it's possible to make a file view in this dialog
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState([rootFolder])
  function moveHandler() {
    // toast.success(`成功移動檔案至${selectedPath}`)
    window.electronAPI.askMoveFile(fileData.fileId, selectedPath.id)
    setOpen(!open)
    // TODO: call move api
  }

  useEffect(() => {
    async function getAllFolders() {
      const allFolders = await window.electronAPI.askAllFolder()
      setPaths([rootFolder, ...JSON.parse(allFolders)])
    }
    if (open) getAllFolders()
  }, [open])

  return (
    <Dialog
      open={open}
      handler={() => setOpen(!open)}
      className="flex flex-col max-h-screen overflow-auto"
    >
      {<Toaster position="bottom-left" /> && open}
      <DialogHeader>{`移動「${fileData.name}」至`}</DialogHeader>
      {/* <CurPathBreadcrumbs /> */}
      <DialogBody className="flex w-full grow overflow-auto">
        {/**Search box // TODO also set path in input box when selected*/}
        <List className="overflow-auto w-full">
          {paths.map((item, index) => {
            return (
              <ListItem
                key={index}
                ripple={false}
                selected={selectedPath.id === paths[index].id}
                onClick={() => setSelectedPath(paths[index])}
                className="flex flex-row w-full"
              >
                <ListItemPrefix>
                  <FolderIcon className="size-4" />
                </ListItemPrefix>
                {/* <div className="overflow-x-auto"> */}
                <Typography className="text-wrap break-all">{item.name}</Typography>
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
        <Button variant="gradient" color="black" onClick={() => moveHandler(selectedPath)}>
          移動
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
MoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  fileData: PropTypes.object.isRequired
}

export default MoveDialog
