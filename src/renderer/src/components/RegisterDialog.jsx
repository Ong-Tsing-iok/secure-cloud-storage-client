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
import { checkEmailValid, checkIsLoggedIn, checkNameValid } from './Utils'
import toast, { Toaster } from 'react-hot-toast'

function RegisterDialog({ open, setOpen }) {
  const {
    storedNameC: [storedName, setStoredName],
    storedEmailC: [storedEmail, setStoredEmail],
    userIdC: [userId, setUserId]
  } = useContext(ProfileContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailAuth, setEmailAuth] = useState('')
  const [currentState, setCurrentState] = useState(0)

  function dialogHandler() {
    setOpen(!open)
    setName('')
    setEmail('')
    setEmailAuth('')
    setCurrentState(0)
  }

  function cancelHandler() {
    dialogHandler()
    toast.error('Register canceled')
  }

  function updateHandler() {
    switch (currentState) {
      case 0:
        {
          if (!checkNameValid(name) || !checkEmailValid(email)) {
            toast.error('請檢查輸入格式')
            return
          }
          // Ask to register
          const askRegisterPromise = window.electronAPI.askRegister({ name, email })
          toast.promise(askRegisterPromise)
          askRegisterPromise
            .then(() => {
              setCurrentState((prevState) => prevState + 1)
            })
            .catch((error) => {
              dialogHandler()
              toast.error(`Failed to register: ${error.message}`)
            })
        }

        break
      case 1:
        // input email auth
        window.electronAPI
          .sendEmailAuth({ emailAuth })
          .then(({ userId }) => {
            if (userId) {
              setStoredName(name)
              setStoredEmail(email)
              setUserId(userId)
              dialogHandler()
              toast.success('Register success')
            } else {
              throw new Error('UserId not returned')
            }
          })
          .catch((error) => {
            if (error.message.includes('did not match')) {
              toast.error('Authentication code did not match')
            } else {
              dialogHandler()
              toast.error(`Failed to register: ${error.message}.`)
            }
          })
        break
    }
  }
  return (
    <Dialog open={open} handler={cancelHandler}>
      <DialogHeader>註冊帳號</DialogHeader>
      <DialogBody className="space-y-2">
        <Typography variant="lead">
          {currentState == 0 ? '輸入名字與電子信箱' : '輸入驗證碼'}
        </Typography>
        <Input
          label="名字"
          size="lg"
          value={name}
          error={!checkNameValid(name)}
          readOnly={currentState != 0}
          onChange={(e) => setName(e.target.value)}
        />
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
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={cancelHandler}>
          取消
        </Button>
        <Button variant="gradient" color="black" onClick={updateHandler}>
          {currentState != 0 ? '確定' : '註冊'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

RegisterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default RegisterDialog
