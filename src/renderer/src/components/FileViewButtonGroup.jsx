import { ButtonGroup, Button, Typography } from '@material-tailwind/react'
import AddFolderDialog from './AddFolderDialog'
import { ArrowUpTrayIcon, FolderPlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'

function FileViewButtonGroup({ curPath }) {
  const [open, setOpen] = useState(false)

  function uploadHandler() {
    // toast('上傳檔案')
    // console.log(curPath)
    window.electronAPI.askUploadFile(curPath)
  }

  return (
    <>
      <ButtonGroup variant="outlined">
        <Button
          onClick={() => setOpen(!open)}
          className="flex flex-row w-24 p-2 gap-2 items-center justify-center"
        >
          <FolderPlusIcon className="size-4" />
          <Typography>資料夾</Typography>
        </Button>
        <Button
          onClick={() => uploadHandler()}
          className="flex flex-row w-24 p-2 gap-2 items-center justify-center"
        >
          <ArrowUpTrayIcon className="size-4" />
          <Typography>上傳</Typography>
        </Button>
      </ButtonGroup>
      <AddFolderDialog open={open} setOpen={setOpen} />
    </>
  )
}

FileViewButtonGroup.propTypes = {
  curPath: PropTypes.string.isRequired
}

export default FileViewButtonGroup
