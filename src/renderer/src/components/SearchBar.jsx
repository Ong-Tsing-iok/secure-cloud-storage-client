import { Button, Menu, MenuHandler, MenuList, MenuItem, Input } from '@material-tailwind/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { SearchContext } from './Contexts'
import { SearchType } from './Types'

function SearchBar() {
  const {
    searchTypeC: [type, setType],
    searchTermC: [searchTerm, setSearchTerm]
  } = useContext(SearchContext)

  // TODO: remove some search (like public) incase to costly
  return (
    <div className="flex flex-row grow justify-center items-center">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Button
            ripple={false}
            variant="text"
            className="rounded-r-none h-full min-w-24 !px-0 justify-center border border-gray-400"
          >
            {type}
          </Button>
        </MenuHandler>
        <MenuList>
          {Object.entries(SearchType).map(([key, value]) => (
            <MenuItem key={key} onClick={() => setType(value)} className="bg-white items-center">
              {value}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Input
        label="搜尋"
        labelProps={{ className: 'font-sans peer-focus:hidden' }}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
        }}
        size="lg"
        className="grow rounded-none focus:!border-t-gray-900"
      ></Input>
      <Button
        className="h-full min-w-12 rounded-l-none justify-center"
        size="sm"
        variant="gradient"
      >
        <MagnifyingGlassIcon className="size-4" />
      </Button>
    </div>
  )
}

export default SearchBar
