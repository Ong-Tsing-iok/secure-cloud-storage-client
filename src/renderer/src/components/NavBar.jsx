import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip
} from '@material-tailwind/react'
import {
  UserCircleIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { useState } from 'react'
import RequestDialog from './RequestDialog'
import ProfileDialog from './ProfileDialog'
import { PageType } from './Types'

const pageList = [PageType.public, PageType.file, PageType.reply, PageType.request]

function NavBar({ pageType, setPageType }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)

  return (
    <>
      <Card className="h-full w-full max-w-80 p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-4">
          <Typography variant="h5" color="blue-gray">
            機敏雲端
          </Typography>
        </div>
        <List>
          <ListItem
            selected={pageType === PageType.public}
            onClick={() => setPageType(PageType.public)}
            ripple={false}
            className="focus:bg-none"
          >
            <ListItemPrefix>
              <RectangleStackIcon className="h-5 w-5" />
            </ListItemPrefix>
            公開列表
          </ListItem>
          <ListItem
            selected={pageType === PageType.file}
            onClick={() => setPageType(PageType.file)}
            ripple={false}
            className="focus:bg-none"
          >
            <ListItemPrefix>
              <DocumentTextIcon className="h-5 w-5" />
            </ListItemPrefix>
            檔案列表
          </ListItem>
          <ListItem
            selected={pageType === PageType.reply}
            onClick={() => setPageType(PageType.reply)}
            ripple={false}
            className="focus:bg-none"
          >
            <ListItemPrefix>
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
            </ListItemPrefix>
            回覆列表
            <ListItemSuffix>
              <Chip
                value="14"
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded-full"
              />
            </ListItemSuffix>
          </ListItem>
          <ListItem
            selected={pageType === PageType.request}
            onClick={() => setPageType(PageType.request)}
            ripple={false}
            className="focus:bg-none"
          >
            <ListItemPrefix>
              <ClipboardDocumentListIcon className="h-5 w-5" />
            </ListItemPrefix>
            請求列表
          </ListItem>
          <ListItem
            onClick={() => setRequestOpen(!requestOpen)}
            ripple={false}
            className="focus:bg-white"
          >
            <ListItemPrefix>
              <PaperAirplaneIcon className="h-5 w-5" />
            </ListItemPrefix>
            請求檔案
          </ListItem>
          <ListItem
            onClick={() => setProfileOpen(!profileOpen)}
            ripple={false}
            className="focus:bg-white"
          >
            <ListItemPrefix>
              <UserCircleIcon className="h-5 w-5" />
            </ListItemPrefix>
            使用者資料
          </ListItem>
        </List>
      </Card>
      <RequestDialog open={requestOpen} setOpen={setRequestOpen} />
      <ProfileDialog open={profileOpen} setOpen={setProfileOpen} />
    </>
  )
}

NavBar.propTypes = {
  pageType: PropTypes.oneOf([PageType.public, PageType.file, PageType.reply, PageType.request])
    .isRequired,
  setPageType: PropTypes.func.isRequired
}

export default NavBar
export { PageType }
