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
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const testUserIdList = [
  'dd147966-becd-4c63-9e49-9b24a243c412',
  'a0c87e67-7363-4015-9bea-e32bcfd7f7db',
  '8f625466-bb70-4629-ae8b-f43f2e2d771e',
  'dd147966-becd-4c63-9e49-9b24a243c412',
  'a0c87e67-7363-4015-9bea-e32bcfd7f7db',
  '8f625466-bb70-4629-ae8b-f43f2e2d771e',
  'dd147966-becd-4c63-9e49-9b24a243c412',
  'a0c87e67-7363-4015-9bea-e32bcfd7f7db',
  '8f625466-bb70-4629-ae8b-f43f2e2d771e',
  'dd147966-becd-4c63-9e49-9b24a243c412',
  'a0c87e67-7363-4015-9bea-e32bcfd7f7db',
  '8f625466-bb70-4629-ae8b-f43f2e2d771e'
]
function WhiteListDialog({ open, setOpen }) {
  const [text, setText] = useState('')

  function dialogHandler() {
    setText('')
    setOpen(!open)
  }
  function addWhiteListHandler() {
    if (text !== '') {
      toast.success('成功新增白名單')
      setText('')
    }
    // TODO: call add whitelist api
  }
  function removeWhiteListHandler(userId) {
    toast.success('成功移除白名單')
    // TODO: call remove whitelist api
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
        <div className="flex flex-row w-full h-fit justify-center items-center">
          <Input
            label="使用者ID"
            labelProps={{ className: 'peer-focus:hidden' }}
            size="md"
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
          {testUserIdList.map((item, index) => (
            <ListItem key={index} ripple={false}>
              <Typography>{item}</Typography>
              <ListItemSuffix>
                <Button
                  onClick={() => removeWhiteListHandler(item)}
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
