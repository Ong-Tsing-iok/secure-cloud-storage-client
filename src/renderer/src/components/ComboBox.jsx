import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  Button,
  Checkbox,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography
} from '@material-tailwind/react'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

const attrs = ['123', '456', '789', '788', '787', '786']
function ComboBox({ selectedAttrs, setSelectedAttrs }) {
  function isSelected(tag) {
    return selectedAttrs.includes(tag)
  }
  function selectTag(tag) {
    if (isSelected(tag)) {
      setSelectedAttrs(selectedAttrs.filter((t) => t !== tag))
    } else {
      setSelectedAttrs([...selectedAttrs, tag])
    }
  }
  return (
    <Menu dismiss={{ itemPress: false }}>
      <MenuHandler>
        <Button fullWidth variant="outlined" className="flex items-center">
          <div className="w-full">
            <Typography className=''>
              {selectedAttrs.slice(0, 5).join(' ') + (selectedAttrs.length > 5 ? '...' : '')}
            </Typography>
          </div>
          <ChevronDownIcon className="size-4"></ChevronDownIcon>
        </Button>
      </MenuHandler>
      <MenuList className="z-[9999] w-[36rem] max-h-72">
        {attrs.map((attr) => {
          return (
            <MenuItem>
              <Checkbox
                ripple={false}
                key={attr}
                onChange={() => selectTag(attr)}
                checked={isSelected(attr)}
              ></Checkbox>
              {attr}
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}

ComboBox.propTypes = {
  selectedAttrs: PropTypes.array.isRequired,
  setSelectedAttrs: PropTypes.func.isRequired
}

export default ComboBox
