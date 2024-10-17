// import Versions from './components/Versions'
import LogViewer from './components/LogViewer'
import { useState } from 'react'
import NavBar, { PageType } from './components/NavBar.jsx'
import MainView from './components/MainView.jsx'
import ProgressView from './components/ProgressView.jsx'
import Console from './components/Console.jsx'
import { ProfileContext, PageContext, SearchContext } from './components/Contexts.jsx'
import { Toaster } from 'react-hot-toast'
import { SearchType } from './components/Types.jsx'

function App() {
  const [pageType, setPageType] = useState(PageType.file)
  const [storedName, setStoredName] = useState('Jane Doe')
  const [storedEmail, setStoredEmail] = useState('lO3Zg@example.com')
  const [searchType, setSearchType] = useState(SearchType.name)
  const [searchTerm, setSearchTerm] = useState('')

  function swapPageHandler(pageType) {
    setSearchTerm('')
    switch (pageType) {
      case PageType.public:
        setSearchType(SearchType.name)
        break
      case PageType.file:
        setSearchType(SearchType.name)
        break
      case PageType.reply:
        setSearchType(SearchType.fileId)
        break
      case PageType.request:
        setSearchType(SearchType.fileId)
        break
      default:
        break
    }
    setPageType(pageType)
  }

  return (
    <>
      <Toaster position="bottom-left" containerClassName="font-sans" reverseOrder={false} />
      <ProfileContext.Provider
        value={{
          storedNameC: [storedName, setStoredName],
          storedEmailC: [storedEmail, setStoredEmail]
        }}
      >
        <PageContext.Provider value={[pageType, swapPageHandler]}>
          <SearchContext.Provider
            value={{
              searchTypeC: [searchType, setSearchType],
              searchTermC: [searchTerm, setSearchTerm]
            }}
          >
            <div className="flex flex-row h-screen w-screen justify-center">
              <NavBar pageType={pageType} setPageType={swapPageHandler} />
              <div className="flex flex-col grow">
                <MainView />
                <Console />
              </div>
            </div>
          </SearchContext.Provider>
        </PageContext.Provider>
      </ProfileContext.Provider>
      <ProgressView />
    </>
  )
}

export default App
