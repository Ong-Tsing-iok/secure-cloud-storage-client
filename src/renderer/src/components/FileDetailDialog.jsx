import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Button,
  Typography,
  Textarea,
  Select,
  Option,
  Input
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { PageContext, ProfileContext } from './Contexts'
import { PageType, PermissionType, bytesToSize } from './Types'
import ComboBox from './ComboBox'

function FileDetailDialog({ open, setOpen, fileData }) {
  const [desc, setDesc] = useState(fileData.desc)
  const [pageType] = useContext(PageContext)
  const [permission, setPermission] = useState(fileData.perm)
  const [selectedAttrs, setSelectedAttrs] = useState(fileData.attrs || [])
  const [tags, setTags] = useState(fileData.tags ? fileData.tags.join(' ') : '')
  const { userIdC: userId } = useContext(ProfileContext)

  function dialogHandler(update = false) {
    if (update) {
      window.electronAPI.updateFileDescPerm({
        fileId: fileData.fileId,
        desc,
        perm: parseInt(permission),
        selectedAttrs,
        tags: tags.split(' ').slice(0, 5)
      })
    } else {
      setDesc(fileData.desc)
      setPermission(fileData.perm)
      setSelectedAttrs(fileData.attrs || [])
      setTags(fileData.tags ? fileData.tags.join(' ') : '')
    }
    setOpen(!open)
  }

  function parseOriginalOwner(originOwner) {
    if (!originOwner) return '用戶不存在'
    if (userId === originOwner) return '您'
    return originOwner
  }

  return (
    <Dialog
      open={open}
      handler={() => dialogHandler(false)}
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
        <Typography variant="small">{userId === fileData.owner ? '您' : fileData.owner}</Typography>

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
        <Typography variant="small">{parseOriginalOwner(fileData.originOwner)}</Typography>

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

        {pageType == PageType.file && (
          <div>
            <Typography variant="h5" className="pt-4">
              屬性
            </Typography>
            <ComboBox selectedAttrs={selectedAttrs} setSelectedAttrs={setSelectedAttrs}></ComboBox>
          </div>
        )}

        {pageType == PageType.file && (
          <div>
            <Typography variant="h5" className="pt-4">
              標籤
            </Typography>
            <Input
              label="最多五個，以空格隔開"
              labelProps={{ className: 'font-sans peer-focus:hidden' }}
              value={tags}
              onChange={(e) => {
                if ((e.target.value.match(/ /g) || []).length < 5)
                  setTags(e.target.value.replace(/\s+/g, ' '))
              }}
              size="lg"
              className="grow rounded-none focus:!border-t-gray-900"
            ></Input>
          </div>
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
          <Typography variant="paragraph" className="text-wrap break-all">
            {fileData.desc || '無'}
          </Typography>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={() => dialogHandler(false)}>
          取消
        </Button>
        <Button
          variant="gradient"
          color="black"
          onClick={() => dialogHandler(pageType === PageType.file)}
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
    size: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    originOwner: PropTypes.string.isRequired,
    perm: PropTypes.number.isRequired,
    desc: PropTypes.string.isRequired
  })
}

export default FileDetailDialog
