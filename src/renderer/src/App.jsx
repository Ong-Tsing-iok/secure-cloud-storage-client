// import Versions from './components/Versions'
import LogViewer from './components/LogViewer'
import { useState, useEffect } from 'react'
import NavBar, { PageType } from './components/NavBar.jsx'
import MainView from './components/MainView.jsx'
import ProgressView from './components/ProgressView.jsx'
import Console from './components/Console.jsx'
import { ProfileContext, PageContext, SearchContext } from './components/Contexts.jsx'
import { Toaster } from 'react-hot-toast'
import { SearchType } from './components/Types.jsx'
import toast from 'react-hot-toast'

function App() {
  const [pageType, setPageType] = useState(PageType.file)
  const [storedName, setStoredName] = useState('')
  const [storedEmail, setStoredEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [searchType, setSearchType] = useState(SearchType.name)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    window.electronAPI.onNotice((result, level) => {
      if (level === 'error') {
        toast.error(result)
      } else if (level === 'success') {
        toast.success(result)
      } else {
        toast(result)
      }
    })
    window.electronAPI.onUserConfig(({ name, email, userId }) => {
      console.log(name, email, userId)
      setStoredName(name)
      setStoredEmail(email)
      setUserId(userId)
    })
  }, [])

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
        window.electronAPI.askRequestList()
        break
      case PageType.request:
        window.electronAPI.askRequestedList()
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
          storedEmailC: [storedEmail, setStoredEmail],
          userIdC: userId
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
