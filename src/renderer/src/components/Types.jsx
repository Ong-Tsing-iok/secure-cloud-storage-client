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
  // name: "檔案名稱",
  // owner: "擁有者",
  // fileId: "檔案ID",
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
