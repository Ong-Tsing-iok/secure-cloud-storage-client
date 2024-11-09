import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { login, sendMessage } from './MessageManager'
import { logger } from './Logger'
import {
  uploadFileProcess,
  getFileListProcess,
  downloadFileProcess,
  deleteFileProcess,
  addFolderProcess,
  deleteFolderProcess,
  getAllFoldersProcess,
  moveFileProcess,
  getAllPublicFilesProcess,
  updateFileDescPermProcess
} from './FileManager'
import {
  agreeRequestProcess,
  deleteRequestProcess,
  getRequestListProcess,
  getRequestedListProcess,
  rejectRequestProcess,
  requestFileProcess,
  respondRequestProcess
} from './RequestManager'
import GlobalValueManager from './GlobalValueManager'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  GlobalValueManager.mainWindow = mainWindow
  mainWindow.setBackgroundColor('#fff')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    login()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('send-message', () => sendMessage('test message'))
  // ipcMain.on('get-keys', () =>
  //   getKeyEngine().then((result) => {
  //     logger.info('key is get in index.js')
  //     console.log(result.export(false))
  //   })
  // )
  ipcMain.on('login', () => login())
  ipcMain.on('upload', (_event, parentFolderId) => uploadFileProcess(parentFolderId))
  ipcMain.on('change-cur-folder', (_event, curFolderId) => {
    GlobalValueManager.curFolderId = curFolderId
    getFileListProcess(curFolderId)
  })
  ipcMain.on('download', (_event, uuid) => downloadFileProcess(uuid))
  ipcMain.on('delete', (_event, uuid) => deleteFileProcess(uuid))
  ipcMain.on('add-folder', (_event, curPath, folderName) => addFolderProcess(curPath, folderName))
  ipcMain.on('delete-folder', (_event, folderId) => deleteFolderProcess(folderId))
  ipcMain.on('change-protocol', () => {
    if (process.env.FILE_PROTOCOL === 'https') {
      process.env.FILE_PROTOCOL = 'ftps'
    } else {
      process.env.FILE_PROTOCOL = 'https'
    }
    logger.info(`File protocol changed to ${process.env.FILE_PROTOCOL}`)
  })
  ipcMain.on('get-request-list', () => getRequestListProcess())
  ipcMain.on('get-requested-list', () => getRequestedListProcess())
  ipcMain.on('delete-request', (_event, uuid) => {
    deleteRequestProcess(uuid)
  })
  ipcMain.on('request-file', (_event, requestInfo) => {
    requestFileProcess(requestInfo)
  })
  ipcMain.on('request-agree', (_event, uuid) => {
    agreeRequestProcess(uuid)
  })
  ipcMain.on('request-reject', (_event, uuid) => {
    rejectRequestProcess(uuid)
  })
  ipcMain.on('respond-request', (_event, responseInfo) => {
    respondRequestProcess(responseInfo)
  })
  ipcMain.handle('get-folders', async () => {
    return await getAllFoldersProcess()
  })
  ipcMain.on('move-file', (_event, uuid, targetFolderId) => moveFileProcess(uuid, targetFolderId))
  ipcMain.handle('get-public-files', async () => {
    return await getAllPublicFilesProcess()
  })
  ipcMain.on('update-user-config', (_event, config) => {
    GlobalValueManager.updateUser(config)
  })
  ipcMain.on('update-request-value', (_event, values) => {
    GlobalValueManager.updateRequest(values)
  })
  ipcMain.on('update-user-list', (_event, users) => {
    GlobalValueManager.updateUserList(users)
  })
  ipcMain.on('update-file-desc-perm', (_event, fileId, desc, perm) => {
    updateFileDescPermProcess(fileId, desc, perm)
  })
  createWindow()
  // login()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// TODO: might need to remove in production
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
