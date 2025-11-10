import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useState, useContext, useEffect } from 'react'
import { ProfileContext } from './Contexts'
import { checkEmailValid, checkIsLoggedIn, checkNameValid, validatePassword } from './Utils'
import toast from 'react-hot-toast'

function BackupDialog({ open, setOpen }) {
  const [extraKey, setExtraKey] = useState('')

  function dialogHandler() {
    setOpen(!open)
    setExtraKey('')
  }

  function updateHandler() {
    if (!validatePassword(extraKey)) {
      toast.error('密碼需至少八位，包含大小寫英文、數字、特殊符號')
      return
    }
    // Send extrakey to main process
    window.electronAPI
      .askShareSecret({ extraKey })
      .then(() => {
        toast.success('Backup succeed.')
      })
      .catch((error) => {
        toast.error('Backup failed.')
      })
    dialogHandler()
  }

  return (
    <Dialog open={open} handler={dialogHandler}>
      <DialogHeader>帳號備份</DialogHeader>
      <DialogBody className="space-y-2">
        <Typography variant="lead">使用額外的密碼讓帳號可被安全的復原。</Typography>
        <Typography variant="lead" color="red">
          注意！若是此密碼遺失，則帳號再也無法被復原。
        </Typography>
        <Typography variant="lead">若是已經執行過備份，可以輸入新的密碼來覆蓋舊的密碼。</Typography>

        <Input
          label="密碼"
          size="lg"
          error={!validatePassword(extraKey)}
          value={extraKey}
          onChange={(e) => setExtraKey(e.target.value)}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={dialogHandler}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={updateHandler}>
          確定
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

BackupDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default BackupDialog
