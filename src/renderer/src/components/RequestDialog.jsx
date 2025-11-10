import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Textarea
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useState } from 'react'
import toast  from 'react-hot-toast'

function RequestDialog({ open, setOpen, defaultId = '' }) {
  const [fileId, setFileId] = useState(defaultId)
  const [description, setDescription] = useState('')

  function checkFileId(fileId) {
    return String(fileId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  }

  function checkDescription(remark) {
    return String(remark).length <= 500
  }

  function dialogHandler() {
    setFileId(defaultId)
    setDescription('')
    // toast.remove()
    setOpen(!open)
  }

  function submitHandler() {
    if (!checkFileId(fileId) || !checkDescription(description)) {
      toast.error('請檢查輸入格式')
      return
    }
    // console.log(fileId, name, email, remark)
    window.electronAPI.askRequestFile({ fileId, description })
    dialogHandler()
    // toast.success('請求已送出')
  }

  return (
    <Dialog open={open} handler={() => setOpen(!open)}>
      <DialogHeader>請求檔案</DialogHeader>
      <DialogBody className="space-y-2">
        {/* <Typography>檔案ID</Typography> */}
        <Input
          className="pb-2"
          label="檔案ID"
          error={!checkFileId(fileId)}
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
        />

        {/* <Typography>備註</Typography> */}
        <Textarea
          type="text"
          label="備註"
          //   maxLength={200}
          error={!checkDescription(description)}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="red" onClick={dialogHandler}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={submitHandler}>
          送出
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

RequestDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  defaultId: PropTypes.string
}

export default RequestDialog
