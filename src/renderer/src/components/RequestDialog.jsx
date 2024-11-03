import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Typography,
  Button,
  Textarea
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { ProfileContext } from './Contexts'

function RequestDialog({ open, setOpen, defaultId = '' }) {
  const [fileId, setFileId] = useState(defaultId)
  const { storedNameC, storedEmailC } = useContext(ProfileContext)
  const [storedName] = storedNameC
  const [storedEmail] = storedEmailC
  const [name, setName] = useState(storedName)
  const [email, setEmail] = useState(storedEmail)
  const [remark, setRemark] = useState('')

  function checkEmail(email) {
    return (
      String(email).match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) || email === ''
    )
  }

  function checkFileId(fileId) {
    return String(fileId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  }

  function checkName(name) {
    return String(name).length <= 20
    // TODO: check name with regex
  }
  function checkRemark(remark) {
    return String(remark).length <= 200
  }

  function dialogHandler() {
    setFileId(defaultId)
    setName(storedName)
    setEmail(storedEmail)
    setRemark('')
    // toast.remove()
    setOpen(!open)
  }

  function submitHandler() {
    if (!checkFileId(fileId) || !checkName(name) || !checkEmail(email) || !checkRemark(remark)) {
      toast.error('請檢查輸入格式')
      return
    }
    // console.log(fileId, name, email, remark)
    window.electronAPI.askRequestFile({ fileId, name, email, remark })
    dialogHandler()
    // toast.success('請求已送出')
  }

  useEffect(() => {
    setName(storedName)
    setEmail(storedEmail)
  }, [storedName, storedEmail])

  // TODO: add notice about storing as plain text
  return (
    <Dialog open={open} handler={() => setOpen(!open)}>
      {<Toaster position="bottom-left" reverseOrder={false} /> && open}
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

        {/* <Typography>名字</Typography> */}
        <Input
          className="pb-2"
          type="name"
          label="名字"
          error={!checkName(name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* <Typography>電子信箱</Typography> */}
        <Input
          className="pb-2"
          type="email"
          label="電子信箱"
          error={!checkEmail(email)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* <Typography>備註</Typography> */}
        <Textarea
          type="text"
          label="備註"
          //   maxLength={200}
          error={!checkRemark(remark)}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
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
