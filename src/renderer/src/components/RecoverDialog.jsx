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
import toast, { Toaster } from 'react-hot-toast'

function RecoverDialog({ open, setOpen }) {
  const [email, setEmail] = useState('')
  const [emailAuth, setEmailAuth] = useState('')
  const [extraKey, setExtraKey] = useState('')
  const [currentState, setCurrentState] = useState(0)
  const { login } = useContext(ProfileContext)

  function dialogHandler() {
    setOpen(!open)
    setEmail('')
    setEmailAuth('')
    setExtraKey('')
    setCurrentState(0)
  }

  function cancelHandler() {
    dialogHandler()
    toast.error('Recover canceled.')
  }

  function updateHandler() {
    switch (currentState) {
      case 0: // Input email
        {
          if (!checkEmailValid(email)) {
            toast.error('請檢查輸入格式')
            return
          }
          const askRecoverSecretPromise = window.electronAPI.askRecoverSecret({ email })
          toast.promise(askRecoverSecretPromise)
          askRecoverSecretPromise
            .then(() => {
              setCurrentState(currentState + 1)
            })
            .catch((error) => {
              dialogHandler()
              toast.error('Failed to recover secrets.')
            })
        }

        break
      case 1: // Input email auth
        window.electronAPI
          .sendEmailAuth({ emailAuth })
          .then(() => {
            setCurrentState(currentState + 1)
          })
          .catch((error) => {
            dialogHandler()
            toast.error('Failed to recover secrets.')
          })
        break
      case 2: // Input extra key
        if (!validatePassword(extraKey)) {
          toast.error('密碼需至少八位，包含大小寫英文、數字、特殊符號')
          return
        }
        window.electronAPI
          .sendRecoverExtraKey({ extraKey })
          .then(() => {
            dialogHandler()
            toast.success('Secret recover succeeded')
            // login()
          })
          .catch((error) => {
            dialogHandler()
            toast.error('Failed to recover secrets.')
          })
        break
      default:
        dialogHandler()
        break
    }
  }

  function renderText() {
    switch (currentState) {
      case 0:
        return '輸入電子信箱以復原帳號。'
      case 1:
        return '輸入驗證碼。'
      case 2:
        return '輸入備份使用的密碼。'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} handler={cancelHandler}>
      <DialogHeader>帳號復原</DialogHeader>
      <DialogBody className="space-y-2">
        <Typography variant="lead">{renderText()}</Typography>

        <Input
          label="電子信箱"
          size="lg"
          value={email}
          error={!checkEmailValid(email)}
          readOnly={currentState != 0}
          onChange={(e) => setEmail(e.target.value)}
        />
        {currentState > 0 && (
          <Input
            label="驗證碼"
            size="lg"
            value={emailAuth}
            readOnly={currentState != 1}
            onChange={(e) => setEmailAuth(e.target.value)}
          />
        )}
        {currentState > 1 && (
          <Input
            label="密碼"
            size="lg"
            error={!validatePassword(extraKey)}
            value={extraKey}
            onChange={(e) => setExtraKey(e.target.value)}
          />
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={cancelHandler}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={updateHandler}>
          確定
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

RecoverDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}
export default RecoverDialog
