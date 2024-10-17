import { Typography } from '@material-tailwind/react'
import TableView from './TableView'
import { ResponseType } from './Types'
import RequestOptionMenu from './RequestOptionMenu'
import { useContext, useEffect, useState } from 'react'
import { SearchContext } from './Contexts'

const tableHead = ['fileId', 'reqDate', 'resDate', 'status', 'end']
const testReplies = [
  {
    userId: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    reqId: 'b2fdc762-06d8-469c-8b67-00cd9bbf7c12',
    userName: 'Jane Doe',
    userEmail: 'lO3Zg@example.com',
    fileId: '02c22f98-2910-43c7-b323-dfe7c9676800',
    status: ResponseType.N,
    reqDate: '2023/06/15',
    resDate: '',
    reqRemark: 'Please give me this file',
    resRemark: ''
  },
  {
    userId: 'afb0dccb-ad3f-4ae8-b2ea-53a3197bfba0',
    reqId: 'b2fdc762-06d8-469c-8b67-00cd9bbf7c12',
    userName: 'Jane Doe',
    userEmail: 'lO3Zg@example.com',
    fileId: '02c22f98-2910-43c7-b323-dfe7c9676800',
    status: ResponseType.R,
    reqDate: '2023/06/15',
    resDate: '',
    reqRemark: 'Please give me this file',
    resRemark: ''
  }
]
function ReplyTable() {
  const [tableContent, setTableContent] = useState([...testReplies])
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    setTableContent(
      testReplies.filter(
        (item) =>
          searchType in item && item[searchType].toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, searchType])

  return (
    <TableView tableHead={tableHead}>
      {tableContent.map((row, index) => (
        <tr key={index} className="border-t">
          <td>
            <Typography className="truncate pr-4">{row.fileId}</Typography>
          </td>
          <td>
            <Typography>{row.reqDate}</Typography>
          </td>
          <td>
            <Typography>{row.resDate || '無'}</Typography>
          </td>
          <td>
            <Typography
              color={
                row.status === ResponseType.A
                  ? 'green'
                  : row.status === ResponseType.R
                    ? 'red'
                    : 'black'
              }
              className="font-bold"
            >
              {row.status}
            </Typography>
          </td>

          <td>
            <RequestOptionMenu requestData={row} />
          </td>
        </tr>
      ))}
    </TableView>
  )
}

export default ReplyTable
