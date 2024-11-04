import { useContext, useState, useEffect } from 'react'
import { PageContext, SearchContext } from './Contexts'
import { PageType, parseFileList, parseRequestList, ResponseType, SearchType } from './Types'
import PublicTable from './PublicTable'
import FileTable from './FileTable'
import ReplyTable from './ReplyTable'
import { Card } from '@material-tailwind/react'
import SearchBar from './SearchBar'
import FileViewButtonGroup from './FileViewButtonGroup'
import RequestViewButtonGroup from './RequestViewButtonGroup'
import CurPathBreadcrumbs from './CurPathBreadcrumbs'
import RequestTable from './RequestTable'
import { CurPathContext, RequestContext, UserListContext } from './Contexts'

function MainView() {
  const [curPath, setCurPath] = useState([{ name: '', folderId: null }])
  const [fileList, setFileList] = useState([])
  const [folderList, setFolderList] = useState([])
  const [whiteList, setWhiteList] = useState([])
  const [blackList, setBlackList] = useState([])

  const {
    requestListC: [requestList, setRequestList],
    requestedListC: [requestedList, setRequestedList]
  } = useContext(RequestContext)
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
    window.electronAPI.onRequestListRes((result) => {
      // console.log(result)
      const requestList = parseRequestList(result)
      // console.log(requestList)
      setRequestList(requestList)
    })
    window.electronAPI.onRequestedListRes((result) => {
      const requestedList = parseFileList(parseRequestList(result), false)
      // console.log(requestedList)
      setRequestedList(requestedList)
    })
    window.electronAPI.onUserList(({ whiteList, blackList }) => {
      // console.log(whiteList)
      // console.log(blackList)
      setWhiteList(whiteList)
      setBlackList(blackList)
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
  function setWhiteListHandler(whiteList) {
    setWhiteList(whiteList)
    window.electronAPI.updateUserList({ whiteList, blackList })
  }
  function setBlackListHandler(blackList) {
    setBlackList(blackList)
    window.electronAPI.updateUserList({ whiteList, blackList })
  }

  function renderTableView(pageType) {
    switch (pageType) {
      case PageType.public:
        return <PublicTable />
      case PageType.file:
        return <FileTable fileList={fileList} folderList={folderList} />
      case PageType.reply:
        return <ReplyTable replyList={requestList} />
      case PageType.request:
        return <RequestTable requestedList={requestedList} />
      default:
        return null
    }
  }

  return (
    <CurPathContext.Provider value={{ curPath, setCurPath: setPathHandler }}>
      <UserListContext.Provider
        value={{
          whiteListC: [whiteList, setWhiteListHandler],
          blackListC: [blackList, setBlackListHandler]
        }}
      >
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
      </UserListContext.Provider>
    </CurPathContext.Provider>
  )
}

export default MainView
