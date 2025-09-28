import { useState, useEffect, useMemo } from 'react'
import NavBar, { PageType } from './components/NavBar.jsx'
import MainView from './components/MainView.jsx'
// import ProgressView from './components/ProgressView.jsx'
import Console from './components/Console.jsx'
import {
  ProfileContext,
  PageContext,
  SearchContext,
  RequestContext
} from './components/Contexts.jsx'
import toast, { Toaster } from 'react-hot-toast'
import { ResponseType, SearchType } from './components/Types.jsx'

function App() {
  const [pageType, setPageType] = useState(PageType.file)
  const [storedName, setStoredName] = useState('')
  const [storedEmail, setStoredEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [searchType, setSearchType] = useState(SearchType.name)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimes, setSearchTimes] = useState(0)
  const [requestList, setRequestList] = useState([])
  const [requestedList, setRequestedList] = useState([])
  const [seenRequests, setSeenRequests] = useState(0)
  const [seenReplies, setSeenReplies] = useState(0)

  const profileContextValue = useMemo(
    () => ({
      storedNameC: [storedName, setStoredName],
      storedEmailC: [storedEmail, setStoredEmail],
      userIdC: userId
    }),
    [storedName, storedEmail, userId]
  )
  const requestContextValue = useMemo(
    () => ({
      requestListC: [requestList, setRequestList],
      requestedListC: [requestedList, setRequestedList]
    }),
    [requestList, requestedList]
  )
  const searchContextValue = useMemo(
    () => ({
      searchTypeC: [searchType, setSearchType],
      searchTermC: [searchTerm, setSearchTerm],
      searchTimesC: [searchTimes, setSearchTimes]
    }),
    [searchType, searchTerm, searchTimes]
  )
  const pageContextValue = useMemo(() => [pageType, swapPageHandler], [pageType])
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
      // console.log(name, email, userId)
      setStoredName(name)
      setStoredEmail(email)
      setUserId(userId)
    })
    window.electronAPI.onRequestValue(({ seenRequests, seenReplies }) => {
      setSeenRequests(seenRequests)
      setSeenReplies(seenReplies)
    })
  }, [])

  function swapPageHandler(newPageType) {
    if (newPageType === PageType.reply) {
      window.electronAPI.updateRequestValue({
        seenRequests: seenRequests,
        seenReplies: requestList.filter((file) => file.status !== ResponseType.N).length
      })
      setSeenReplies(requestList.filter((file) => file.status !== ResponseType.N).length)
    }
    if (newPageType === PageType.request) {
      window.electronAPI.updateRequestValue({
        seenRequests: requestedList.length,
        seenReplies: seenReplies
      })
      setSeenRequests(requestedList.length)
    }
    setSearchTerm('')
    switch (newPageType) {
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
    setPageType(newPageType)
  }

  return (
    <>
      <Toaster position="bottom-left" containerClassName="font-sans" reverseOrder={false} />
      <ProfileContext.Provider value={profileContextValue}>
        <PageContext.Provider value={pageContextValue}>
          <RequestContext.Provider value={requestContextValue}>
            <SearchContext.Provider value={searchContextValue}>
              <div className="flex flex-row h-screen w-screen justify-center">
                <NavBar
                  pageType={pageType}
                  setPageType={swapPageHandler}
                  seenRequest={seenRequests}
                  seenReply={seenReplies}
                />
                <div className="flex flex-col grow">
                  <MainView />
                  <Console />
                </div>
              </div>
            </SearchContext.Provider>
          </RequestContext.Provider>
        </PageContext.Provider>
      </ProfileContext.Provider>
      {/* <ProgressView /> */}
    </>
  )
}

export default App
