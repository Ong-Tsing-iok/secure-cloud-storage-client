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
  public: '公開',
  private: '私人',
  unlisted: '不公開'
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
