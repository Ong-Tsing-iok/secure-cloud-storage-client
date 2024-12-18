import { createContext } from 'react'

export const ProfileContext = createContext({
  storedNameC: ['', null],
  storedEmailC: ['', null],
  userIdC: ''
})
export const PageContext = createContext(['', null])
export const SearchContext = createContext({
  searchTypeC: ['', null],
  searchTermC: ['', null]
})
export const CurPathContext = createContext([[], null])
export const RequestContext = createContext({
  requestListC: [[], null],
  requestedListC: [[], null]
})
export const UserListContext = createContext({
  whiteListC: [[], null],
  blackListC: [[], null]
})
