import { useContext, useState, useEffect } from 'react'
import { PageContext, SearchContext } from './Contexts'
import { PageType, parseFileList, SearchType } from './Types'
import PublicTable from './PublicTable'
import FileTable from './FileTable'
import ReplyTable from './ReplyTable'
import { Card } from '@material-tailwind/react'
import SearchBar from './SearchBar'
import FileViewButtonGroup from './FileViewButtonGroup'
import RequestViewButtonGroup from './RequestViewButtonGroup'
import CurPathBreadcrumbs from './CurPathBreadcrumbs'
import RequestTable from './RequestTable'
import { CurPathContext } from './Contexts'

function MainView() {
  const [curPath, setCurPath] = useState([{ name: '', folderId: null }])
  const [fileList, setFileList] = useState([])
  const [folderList, setFolderList] = useState([])
  const [pageType] = useContext(PageContext)

  useEffect(() => {
    window.electronAPI.onFileListRes((result) => {
      const { files, folders } = result
      const fileList = parseFileList(files)

      const folderList = JSON.parse(folders)
      folderList.forEach((element) => {
        element.folderId = element.id
        delete element.id
      })
      setFileList(fileList)
      setFolderList(folderList)
    })
  }, [])

  useEffect(() => {
    if (pageType === PageType.file) {
      window.electronAPI.changeCurFolder(curPath.at(-1).folderId)
    }
  }, [pageType])

  function setPathHandler(curPath) {
    setCurPath(curPath)
    window.electronAPI.changeCurFolder(curPath.at(-1).folderId)
  }

  function renderTableView(pageType) {
    switch (pageType) {
      case PageType.public:
        return <PublicTable />
      case PageType.file:
        return <FileTable fileList={fileList} folderList={folderList} />
      case PageType.reply:
        return <ReplyTable />
      case PageType.request:
        return <RequestTable />
      default:
        return null
    }
  }

  return (
    <CurPathContext.Provider value={{ curPath, setCurPath: setPathHandler }}>
      <Card className="flex grow gap-2 pt-2 items-start overflow-auto">
        <div className="flex flex-row w-full gap-4 px-2">
          <SearchBar />
          {pageType === PageType.file && <FileViewButtonGroup curPath={curPath} />}
          {pageType === PageType.request && <RequestViewButtonGroup />}
        </div>

        {pageType === PageType.file && (
          <div className="px-2">
            <CurPathBreadcrumbs />
          </div>
        )}

        {renderTableView(pageType)}
      </Card>
    </CurPathContext.Provider>
  )
}

export default MainView
