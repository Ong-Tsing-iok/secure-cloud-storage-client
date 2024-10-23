import { Card, Typography } from '@material-tailwind/react'
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import FileOptionMenu from './FileOptionMenu'
import TableView, { TableHeadContent } from './TableView'
import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { PageType, PermissionType, bytesToSize } from './Types'
import { PageContext, SearchContext } from './Contexts'

const TABLE_HEAD = ['icon', 'name', 'size', 'date', 'perm', 'end']

const testFolderList = [
  { name: 'folder1', folderId: '1' },
  { name: 'folder2', folderId: '2' }
]

function FileTable({ curPath, setCurPath }) {
  const [fileList, setFileList] = useState([])
  const [tableContent, setTableContent] = useState([])
  const [folders, setFolders] = useState([])
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    window.electronAPI.askFileList()
    window.electronAPI.onFileListRes((result) => {
      const fileList = JSON.parse(result)
      fileList.forEach((element) => {
        element.fileId = element.id
        element.owner = element.ownerId
        element.originOwner = element.originOwnerId
        element.date = element.timestamp.split(' ')[0]
        element.perm = element.permissions
        delete element.id,
          element.ownerId,
          element.timestamp,
          element.permissions,
          element.originOwnerId
      })
      setFileList(fileList)
    })
  }, [])

  useEffect(() => {
    setTableContent(
      fileList.filter((file) => file[searchType].toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFolders(
      testFolderList.filter(
        (folder) =>
          searchType in folder &&
          folder[searchType].toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, searchType, fileList])

  return (
    <TableView tableHead={TABLE_HEAD}>
      {folders.map((row, index) => (
        <tr
          key={index}
          onDoubleClick={() => setCurPath([...curPath, { name: row.name, folderId: row.folderId }])}
          className="border-t"
        >
          <td>
            <FolderIcon className="size-5" />
          </td>
          <td>
            <Typography className="truncate pr-4">{row.name}</Typography>
          </td>
          <td>
            <Typography>--</Typography>
          </td>
          <td>
            <Typography>--</Typography>
          </td>
          <td>
            <Typography>--</Typography>
          </td>
          <td>
            <FileOptionMenu fileData={row} haveDelete isFolder />
          </td>
        </tr>
      ))}
      {tableContent.map((row, index) => (
        <tr key={index} className="border-t">
          <td>
            <DocumentTextIcon className="size-5" />
          </td>
          <td>
            <Typography className="truncate pr-4">{row.name}</Typography>
          </td>
          <td>
            <Typography>{bytesToSize(row.size)}</Typography>
          </td>
          <td>
            <Typography>{row.date}</Typography>
          </td>
          <td>
            <Typography>{PermissionType[row.perm]}</Typography>
          </td>
          <td>
            <FileOptionMenu fileData={row} haveDetail haveDelete haveDownload haveMove />
          </td>
        </tr>
      ))}
    </TableView>
  )
}

FileTable.propTypes = {
  curPath: PropTypes.array.isRequired,
  setCurPath: PropTypes.func.isRequired
}

export default FileTable
