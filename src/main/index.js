import { app, shell, BrowserWindow, ipcMain, session, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { scraper } from './services/scraper'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

// 1. Définir la fonction de la fenêtre de login
// Fonction pour créer la fenêtre de login
function createLoginWindow() {
  const loginWin = new BrowserWindow({
    width: 600,
    height: 800,
    autoHideMenuBar: true,
    title: "Connexion Jeuxvideo.com"
  })

  loginWin.loadURL('https://www.jeuxvideo.com/login')

  // On surveille la navigation pour fermer quand c'est fini
  loginWin.webContents.on('did-navigate', async (event, url) => {
    if (url === 'https://www.jeuxvideo.com/' || url.includes('profil')) {

      //ON RECUPERE LE PSEUDO DEPUIS L'HTML DE JVC
      const username = await loginWin.webContents.executeJavaScript(`
        (function(){
          const el = document.querySelector('.headerAccount__pseudo');
          return el ? el.textContent.trim() : null;
        })()
        `);
        if(username == "CONNEXION"){
          console.log("Echec de la connexion !");
        } else if(username){
          console.log("Connecté en tant que :", username);
          BrowserWindow.getAllWindows().forEach(win => {
            if(win !== loginWin){
              win.webContents.send('auth:status-success', { isConnected: true, username: username });
            }
          });
        }
      // Petit délai pour l'UX
      setTimeout(() => {
        if (!loginWin.isDestroyed()) loginWin.close()
      }, 1500)
    }
  })
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

    //SCRAPER AGENT
  const userAgent = session.defaultSession.getUserAgent();
  scraper.init(userAgent);

  createWindow()

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('get-topics', async (event, url) => {
  return await scraper.getTopicList(url);
});

ipcMain.handle('get-messages', async (event, url) => {
  return await scraper.getTopicMessages(url);
});

ipcMain.handle('auth:open-login', () => {
    createLoginWindow()
});

ipcMain.handle('auth:logout', async () => {
  // On vide tous les cookies, le cache et les storages
  await session.defaultSession.clearStorageData({
    storages: ['cookies', 'localstorage', 'cache']
  });
  console.log("Session vidée avec succès");
  return { success: true };
});

ipcMain.handle('auth:check-session', async () => {
  // On crée une fenêtre invisible pour vérifier si on est co sur JVC
  const tempWin = new BrowserWindow({ show: false });
  await tempWin.loadURL('https://www.jeuxvideo.com/');
  
  const username = await tempWin.webContents.executeJavaScript(`
    document.querySelector('.headerAccount__pseudo')?.innerText.trim() || null
  `);
  
  tempWin.close();
  
  if (username) {
    return { isConnected: true, username };
  }
  return { isConnected: false, username: null };
});

// Nouveau handler pour le login
ipcMain.handle('login', async (event, { pseudo, password }) => {
  return await scraper.login(pseudo, password);
});