import { MinusIcon, NoSymbolIcon, PlusIcon } from '@heroicons/react/24/outline'
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
function BlackListDialog({ open, setOpen }) {
  const [text, setText] = useState('')

  function dialogHandler() {
    setText('')
    setOpen(!open)
  }
  function addBlackListHandler() {
    if (text !== '') {
      toast.success('成功新增黑名單')
      setText('')
    }
    // TODO: call add blacklist api
  }
  function removeBlackListHandler(userId) {
    toast.success('成功移除黑名單')
    // TODO: call remove blacklist api
  }

  return (
    <Dialog
      open={open}
      handler={dialogHandler}
      className="flex flex-col max-h-screen overflow-auto"
    >
      <Toaster position="bottom-left" />
      <DialogHeader>
        <NoSymbolIcon className="size-6" />
        黑名單
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
            onClick={() => addBlackListHandler()}
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
                  onClick={() => removeBlackListHandler(item)}
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
BlackListDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
}

export default BlackListDialog
