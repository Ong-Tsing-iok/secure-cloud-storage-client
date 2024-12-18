import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  Input
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useState, useContext } from 'react'
import { CurPathContext } from './Contexts'

function AddFolderDialog({ open, setOpen }) {
  const [folderName, setFolderName] = useState('')
  const { curPath } = useContext(CurPathContext)
  function addFolderHandler() {
    // TODO: check folder name format and length
    window.electronAPI.askAddFolder(curPath.at(-1).folderId, folderName)
    setOpen(!open)
  }

  return (
    <Dialog open={open} handler={setOpen}>
      <DialogHeader>新增資料夾</DialogHeader>
      <DialogBody>
        <Input
          label="資料夾名稱"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value)
          }}
        ></Input>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={() => setOpen(!open)}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={() => addFolderHandler()}>
          新增
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

AddFolderDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default AddFolderDialog
