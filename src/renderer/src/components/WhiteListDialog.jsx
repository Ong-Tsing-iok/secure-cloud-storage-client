import { BookmarkSquareIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  Input,
  List,
  ListItem,
  Typography,
  ListItemSuffix
} from '@material-tailwind/react'

import PropTypes from 'prop-types'
import { useState, useContext } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { UserListContext } from './Contexts'

function WhiteListDialog({ open, setOpen }) {
  const [text, setText] = useState('')
  const {
    whiteListC: [whiteList, setWhiteList]
  } = useContext(UserListContext)
  function dialogHandler() {
    setText('')
    setOpen(!open)
  }
  function addWhiteListHandler() {
    if (text !== '') {
      if (whiteList.includes(text)) {
        toast('該使用者已存在')
      } else {
        setWhiteList([...whiteList, text])
        toast.success('成功新增白名單')
      }
      setText('')
    }
  }
  function removeWhiteListHandler(index) {
    setWhiteList(whiteList.splice(index, index))
    toast.success('成功移除白名單')
  }

  return (
    <Dialog
      open={open}
      handler={dialogHandler}
      className="flex flex-col max-h-screen overflow-auto"
    >
      <Toaster position="bottom-left" />
      <DialogHeader>
        <BookmarkSquareIcon className="size-6" />
        白名單
      </DialogHeader>
      <DialogBody className="flex flex-col w-full gap-2 grow overflow-auto">
        <div className="flex flex-row w-full h-fit px-4 justify-center items-center">
          <Input
            label="使用者ID"
            labelProps={{ className: 'peer-focus:hidden' }}
            size="lg"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
            }}
            className="rounded-r-none focus:!border-t-gray-900"
          />
          <Button
            onClick={() => addWhiteListHandler()}
            className="min-w-12 rounded-l-none justify-center"
            size="md"
            variant="gradient"
          >
            <PlusIcon className="size-5" />
          </Button>
        </div>
        <List className="flex flex-col grow overflow-auto">
          {whiteList.map((item, index) => (
            <ListItem key={index} ripple={false}>
              <Typography>{item}</Typography>
              <ListItemSuffix>
                <Button
                  onClick={() => removeWhiteListHandler(index)}
                  className="justify-center"
                  size="sm"
                  variant="gradient"
                >
                  <MinusIcon className="size-5" />
                </Button>
              </ListItemSuffix>
            </ListItem>
          ))}
        </List>
      </DialogBody>
      <DialogFooter>
        <Button variant="gradient" color="black" onClick={() => dialogHandler()}>
          確定
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
WhiteListDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default WhiteListDialog
