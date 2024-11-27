import { Typography } from '@material-tailwind/react'
import { useContext, useEffect, useState } from 'react'
import FileOptionMenu from './FileOptionMenu'
import TableView from './TableView'
import { PageContext, SearchContext } from './Contexts'
import { PageType, parseFileList, searchFilter, bytesToSize } from './Types'
const TABLE_HEAD = ['name', 'size', 'date', 'owner', 'end']

function PublicTable() {
  const [publicFileList, setPublicFileList] = useState([])
  const [tableContent, setTableContent] = useState([])
  const [pageType] = useContext(PageContext)
  const {
    searchTypeC: [searchType],
    searchTermC: [searchTerm]
  } = useContext(SearchContext)

  useEffect(() => {
    async function getAllPublicFiles() {
      const allPublicFiles = await window.electronAPI.askAllPublicFile()
      const fileList = parseFileList(allPublicFiles)
      setPublicFileList(fileList)
    }
    if (pageType === PageType.public) {
      getAllPublicFiles()
    }
  }, [pageType])

  useEffect(() => {
    setTableContent(searchFilter(publicFileList, searchType, searchTerm))
  }, [searchTerm, searchType, publicFileList])
  return (
    <TableView tableHead={TABLE_HEAD}>
      {tableContent.map((row) => (
        <tr key={row.fileId} className="border-t">
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
