export const PageType = Object.freeze({
  public: 'public',
  file: 'file',
  reply: 'reply',
  request: 'request'
})

export const ResponseType = Object.freeze({
  N: '尚未回覆',
  A: '同意',
  R: '拒絕'
})

export const PermissionType = Object.freeze({
  0: '私人', // private
  1: '公開', // public
  2: '不公開' // unlisted
})

export const SearchType = Object.freeze({
  name: 'name',
  owner: 'owner',
  fileId: 'fileId'
})

export const HeadText = Object.freeze({
  name: '名稱',
  size: '大小',
  date: '上傳日期',
  owner: '擁有者',
  perm: '權限',
  end: '',
  icon: '',
  fileId: '檔案ID',
  reqDate: '請求日期',
  resDate: '回覆日期',
  status: '狀態',
  userName: '姓名'
})

export function bytesToSize(byteString) {
  const bytes = parseInt(byteString)
  if (bytes === 0) return '0 Bytes'
  const k = 1000
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function parseFileList(fileList, json = true) {
  if (json) fileList = JSON.parse(fileList)
  fileList.forEach((element) => {
    element.fileId = element.fileId || element.id
    element.owner = element.ownerId
    element.originOwner = element.originOwnerId
    element.date = element.timestamp.split(' ')[0]
    element.perm = element.permissions
    element.desc = element.description
    delete element.id
    delete element.ownerId
    delete element.timestamp
    delete element.permissions
    delete element.originOwnerId
    delete element.description
  })
  return fileList
}

export function parseRequestList(requestList) {
  requestList = JSON.parse(requestList)
  requestList.forEach((element) => {
    element.userId = element.requester
    delete element.requester
    element.reqDate = element.requestTime?.split(' ')[0]
    delete element.requestTime
    element.resDate = element.responseTime?.split(' ')[0]
    delete element.responseTime
    if (element.agreed === 1) {
      element.status = ResponseType.A
    } else if (element.agreed === 0) {
      element.status = ResponseType.R
    } else {
      element.status = ResponseType.N
    }
    delete element.agreed
    element.reqDesc = element.requestDescription
    delete element.requestDescription
    element.resDesc = element.responseDescription
    delete element.responseDescription
  })
  return requestList
}

export function searchFilter(fileList, searchType, searchTerm) {
  return fileList.filter((file) =>
    file[searchType]?.toLowerCase().includes(searchTerm.toLowerCase())
  )
}
