import { Card, Typography } from '@material-tailwind/react'
import { FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import FileOptionMenu from './FileOptionMenu'
import TableView, { TableHeadContent } from './TableView'
import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { PageType, PermissionType } from './Types'
import { PageContext, SearchContext } from './Contexts'

const TABLE_HEAD = ['icon', 'name', 'size', 'date', 'perm', 'end']
const testFileList = [
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'def.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'def.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.public,
    desc: ''
  },
  {
    name: 'def.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.unlisted,
    desc: ''
  },
  {
    name: 'def.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: PermissionType.private,
    desc: ''
  }
]
const testFolderList = [{ name: 'folder1' }, { name: 'folder2' }]

function FileTable({ curPath, setCurPath }) {
  const [tableContent, setTableContent] = useState([...testFileList])
  const [folders, setFolders] = useState([...testFolderList])
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    setTableContent(
      testFileList.filter((file) =>
        file[searchType].toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFolders(
      testFolderList.filter(
        (folder) =>
          searchType in folder &&
          folder[searchType].toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, searchType])

  return (
    <TableView tableHead={TABLE_HEAD}>
      {folders.map((row, index) => (
        <tr
          key={index}
          onDoubleClick={() => setCurPath(curPath + `/${row.name}`)}
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
            <FileOptionMenu fileData={row} haveDelete />
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
            <Typography>{row.size}</Typography>
          </td>
          <td>
            <Typography>{row.date}</Typography>
          </td>
          <td>
            <Typography>{row.perm}</Typography>
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
  curPath: PropTypes.string.isRequired,
  setCurPath: PropTypes.func.isRequired
}

export default FileTable
