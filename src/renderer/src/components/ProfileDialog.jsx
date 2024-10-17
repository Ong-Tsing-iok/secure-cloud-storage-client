import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { ProfileContext } from './Contexts'

function ProfileDialog({ open, setOpen }) {
  const { storedNameC, storedEmailC } = useContext(ProfileContext)
  const [storedName, setStoredName] = storedNameC
  const [storedEmail, setStoredEmail] = storedEmailC
  const [name, setName] = useState(storedName)
  const [email, setEmail] = useState(storedEmail)

  function dialogHandler() {
    setName(storedName)
    setEmail(storedEmail)
    setOpen(!open)
  }

  function updateHandler() {
    setStoredName(name)
    setStoredEmail(email)
    setOpen(!open)
    toast.success('更新成功')
  }
  // TODO: add name and email validation
  // TODO: add notice about storing only in local storage
  return (
    <Dialog open={open} handler={dialogHandler}>
      <DialogHeader>使用者資料</DialogHeader>
      <DialogBody className="space-y-2">
        <Input
          label="使用者ID"
          size="lg"
          readOnly
          value={'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0'}
          tabIndex={-1}
        />
        <Input label="名字" size="lg" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="電子信箱"
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={dialogHandler}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={updateHandler}>
          更新
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

ProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default ProfileDialog
