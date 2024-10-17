import { createContext } from 'react'

export const ProfileContext = createContext({
  storedNameC: ['', null],
  storedEmailC: ['', null]
})
export const PageContext = createContext(['', null])
export const SearchContext = createContext({
  searchTypeC: ['', null],
  searchTermC: ['', null]
})
