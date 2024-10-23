import { useContext, useState } from 'react'
import { PageContext, SearchContext } from './Contexts'
import { PageType, SearchType } from './Types'
import PublicTable from './PublicTable'
import FileTable from './FileTable'
import ReplyTable from './ReplyTable'
import { Card } from '@material-tailwind/react'
import SearchBar from './SearchBar'
import FileViewButtonGroup from './FileViewButtonGroup'
import RequestViewButtonGroup from './RequestViewButtonGroup'
import CurPathBreadcrumbs from './CurPathBreadcrumbs'
import RequestTable from './RequestTable'

function MainView() {
  const [curPath, setCurPath] = useState([{ name: '', folderId: null }])

  const [pageType] = useContext(PageContext)

  function renderTableView(pageType, curPath, setCurPath) {
    switch (pageType) {
      case PageType.public:
        return <PublicTable />
      case PageType.file:
        return <FileTable curPath={curPath} setCurPath={setCurPath} />
      case PageType.reply:
        return <ReplyTable />
      case PageType.request:
        return <RequestTable />
      default:
        return null
    }
  }

  return (
    <Card className="flex grow gap-2 pt-2 items-start overflow-auto">
      <div className="flex flex-row w-full gap-4 px-2">
        <SearchBar />
        {pageType === PageType.file && <FileViewButtonGroup curPath={curPath} />}
        {pageType === PageType.request && <RequestViewButtonGroup />}
      </div>

      {pageType === PageType.file && (
        <div className="px-2">
          <CurPathBreadcrumbs curPath={curPath} setCurPath={setCurPath} />
        </div>
      )}

      {renderTableView(pageType, curPath, setCurPath)}
    </Card>
  )
}

export default MainView
