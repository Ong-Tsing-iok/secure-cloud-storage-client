import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  Typography
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'

function DeleteDialog({ open, setOpen, name }) {
  function deleteHandler() {
    toast.success('成功刪除檔案')
    setOpen(!open)
    //TODO: call delete api
  }

  return (
    <Dialog open={open} handler={() => setOpen(!open)}>
      <DialogHeader>
        <Typography variant="h4" color="red">
          刪除檔案
        </Typography>
      </DialogHeader>
      <DialogBody>
        <Typography className="font-bold overflow-wrap">{`是否確認要刪除 '${name}' ?`}</Typography>
        <Typography className="font-bold">此行動無法被還原！</Typography>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="black" onClick={() => setOpen(!open)}>
          取消
        </Button>
        <Button variant="gradient" color="red" onClick={() => deleteHandler()}>
          確定
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
}

export default DeleteDialog
