import {
  Breadcrumbs,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography
} from '@material-tailwind/react'
import { HomeIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { useState } from 'react'

function CurPathBreadcrumbs({ curPath, setCurPath }) {
  const [open, setOpen] = useState(false)
  function setPathHandler(index) {
    // if (index === 0) {
    //   setCurPath('/')
    //   return
    // }
    setCurPath(
      curPath
        .split('/')
        .slice(0, index + 1)
        .join('/') + '/'
    )
    console.log(curPath)
  }
  function renderItem(item, index) {
    return (
      <Typography key={index} onClick={() => setPathHandler(index)}>
        {item}
      </Typography>
    )
  }
  //   function renderBreadcrumbs(curPath) {
  const pathItems = curPath.split('/').slice(0, -1)
  if (pathItems.length <= 6) {
    return (
      <Breadcrumbs>
        {pathItems.map((item, index) => {
          return index === 0 ? (
            <HomeIcon key={index} onClick={() => setPathHandler(index)} className="size-6" />
          ) : (
            renderItem(item, index)
          )
        })}
      </Breadcrumbs>
    )
  }

  return (
    <Breadcrumbs>
      <HomeIcon onClick={() => setPathHandler(0)} className="size-6" />
      {renderItem(pathItems[1], 1)}
      {renderItem(pathItems[2], 2)}
      <Menu placement="bottom">
        <MenuHandler onClick={() => setOpen(!open)}>
          <Typography>...</Typography>
        </MenuHandler>
        <MenuList className="max-h-96 overflow-auto">
          {pathItems.slice(3, -2).map((item, index) => {
            return (
              <MenuItem key={index} onClick={() => setPathHandler(index + 3)}>
                {item}
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
      {renderItem(pathItems.slice(-2, -1), pathItems.length - 2)}
      {renderItem(pathItems.slice(-1), pathItems.length - 1)}
    </Breadcrumbs>
  )
  //   }

  //   return renderBreadcrumbs(curPath);
}
CurPathBreadcrumbs.propTypes = {
  curPath: PropTypes.string.isRequired,
  setCurPath: PropTypes.func.isRequired
}

export default CurPathBreadcrumbs
