import { Typography } from '@material-tailwind/react'
import TableView from './TableView'
import { ResponseType, searchFilter } from './Types'
import RequestOptionMenu from './RequestOptionMenu'
import { useContext, useEffect, useState } from 'react'
import { SearchContext } from './Contexts'
import propTypes from 'prop-types'

const tableHead = ['fileId', 'reqDate', 'userName', 'status', 'end']

function RequestTable({ requestedList }) {
  const [tableContent, setTableContent] = useState([])
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    setTableContent(searchFilter(requestedList, searchType, searchTerm))
    console.log(requestedList)
  }, [searchTerm, searchType, requestedList])
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
            <Typography className="truncate">{row.userName}</Typography>
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

RequestTable.propTypes = {
  requestedList: propTypes.array.isRequired
}

export default RequestTable
