import { Typography } from '@material-tailwind/react'
import { useContext, useEffect, useState } from 'react'
import FileOptionMenu from './FileOptionMenu'
import TableView from './TableView'
import { SearchContext } from './Contexts'
const TABLE_HEAD = ['name', 'size', 'date', 'owner', 'end']

const testPublicList = [
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'bfr0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bea31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'bfr0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'beg31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'bfr0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  },
  {
    name: 'abc.txt',
    fileId: 'bed31936-7b57-413a-9efa-2ad2cf6d913a',
    size: '10KB',
    date: '2024/05/18',
    owner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    originOwner: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    perm: 'public',
    desc: ''
  }
]

function PublicTable() {
  const [tableContent, setTableContent] = useState([...testPublicList])
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    setTableContent(
      testPublicList.filter(
        (item) =>
          searchType in item && item[searchType].toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, searchType])
  return (
    <TableView tableHead={TABLE_HEAD}>
      {tableContent.map((row, index) => (
        <tr key={index} className="border-t">
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
            <Typography className="truncate">{row.owner}</Typography>
          </td>
          <td>
            <FileOptionMenu fileData={row} haveRequest haveDetail />
          </td>
        </tr>
      ))}
    </TableView>
  )
}

export default PublicTable
