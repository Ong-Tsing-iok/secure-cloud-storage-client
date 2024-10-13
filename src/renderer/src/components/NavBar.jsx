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

function NavBar() {
  return (
    <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray">
          Sidebar
        </Typography>
      </div>
      <List>
        <ListItem>
          <ListItemPrefix>
            <RectangleStackIcon className="h-5 w-5" />
          </ListItemPrefix>
          公開列表
        </ListItem>
        <ListItem>
          <ListItemPrefix>
            <DocumentTextIcon className="h-5 w-5" />
          </ListItemPrefix>
          檔案列表
        </ListItem>
        <ListItem>
          <ListItemPrefix>
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
          </ListItemPrefix>
          回覆列表
          <ListItemSuffix>
            <Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
          </ListItemSuffix>
        </ListItem>
        <ListItem>
          <ListItemPrefix>
            <ClipboardDocumentListIcon className="h-5 w-5" />
          </ListItemPrefix>
          請求列表
        </ListItem>
        <ListItem>
          <ListItemPrefix>
            <PaperAirplaneIcon className="h-5 w-5" />
          </ListItemPrefix>
          請求檔案
        </ListItem>
        <ListItem>
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          使用者資料
        </ListItem>
      </List>
    </Card>
  )
}

export default NavBar
