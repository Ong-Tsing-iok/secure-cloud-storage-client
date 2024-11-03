import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  Typography,
  Textarea,
  Select,
  Option
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { PageContext } from './Contexts'
import { PageType, PermissionType, bytesToSize } from './Types'
import toast from 'react-hot-toast'

function FileDetailDialog({ open, setOpen, fileData }) {
  const [desc, setDesc] = useState(fileData.desc)
  const [pageType] = useContext(PageContext)
  const [permission, setPermission] = useState(fileData.perm)

  function updateHandler() {
    window.electronAPI.updateFileDescPerm(fileData.fileId, desc, parseInt(permission))
    setOpen(!open)
  }

  return (
    <Dialog
      open={open}
      handler={() => setOpen(!open)}
      className="flex flex-col max-h-screen overflow-auto"
    >
      <DialogHeader>檔案詳情</DialogHeader>
      <DialogBody>
        <Typography variant="h5">名稱</Typography>
        <Typography variant="small">{fileData.name}</Typography>

        <Typography variant="h5" className="pt-4">
          檔案Id
        </Typography>
        <Typography variant="small">{fileData.fileId}</Typography>

        <Typography variant="h5" className="pt-4">
          擁有者
        </Typography>
        <Typography variant="small">{fileData.owner}</Typography>

        <Typography variant="h5" className="pt-4">
          大小
        </Typography>
        <Typography variant="small">{bytesToSize(fileData.size)}</Typography>

        <Typography variant="h5" className="pt-4">
          上傳日期
        </Typography>
        <Typography variant="small">{fileData.date}</Typography>

        <Typography variant="h5" className="pt-4">
          原始擁有者
        </Typography>
        <Typography variant="small">
          {fileData.originOwner === fileData.owner ? '您' : fileData.originOwner}
        </Typography>

        <Typography variant="h5" className="pt-4">
          權限
        </Typography>
        {pageType === PageType.file && fileData.originOwner === fileData.owner ? (
          <Select
            value={String(fileData.perm)}
            onChange={(value) => {
              console.log(value)
              setPermission(value)
            }}
            labelProps={{ className: 'peer-focus:hidden' }}
            className="focus:!border-t-gray-900"
          >
            {Object.keys(PermissionType).map((key) => (
              <Option key={key} value={String(key)}>
                {PermissionType[key]}
              </Option>
            ))}
          </Select>
        ) : (
          <Typography variant="small">{PermissionType[fileData.perm]}</Typography>
        )}

        <Typography variant="h5" className="pt-4">
          檔案說明
        </Typography>
        {pageType === PageType.file ? (
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            labelProps={{ className: 'peer-focus:hidden' }}
            className="focus:!border-t-gray-900"
          ></Textarea>
        ) : (
          <Typography variant="paragraph">{fileData.desc || '無'}</Typography>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={() => setOpen(!open)}>
          取消
        </Button>
        <Button
          variant="gradient"
          color="black"
          onClick={pageType === PageType.file ? () => updateHandler() : () => setOpen(!open)}
        >
          {pageType === PageType.file ? '更新' : '確定'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

FileDetailDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  fileData: PropTypes.shape({
    fileId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    originOwner: PropTypes.string.isRequired,
    perm: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired
  })
}

export default FileDetailDialog
