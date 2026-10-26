const path = require('path');
const { app, BrowserWindow, Menu, shell } = require('electron');

// Глобальные переменные
process.env.NODE_ENV = 'production'; //переключение режима разработчика и релиза

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin'; //проверка на мак

let mainWindow, developerWindow, settingsWindow, helpWindow;

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Личная лягушка',
        icon: 'assets/icons/icon_32x32.png',
        width: isDev ? 1100 : 600,
        height: 500,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // Open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
    return mainWindow;
};

const menu = [
    {
        label: 'Файл',
        submenu: [
            {
                label: 'Загрузить прогресс',
                click: () => mainWindow.webContents.send('loadProgress'),
                accelerator: 'CmdOrCtrl+O'
            },
            {
                label: 'Сохранить прогресс',
                click: () => mainWindow.webContents.send('saveProgress'),
                accelerator: 'CmdOrCtrl+S'
            }
        ]
    },
    {
        label: 'Настройки',
        click: settingsWindow = createSettingsWindow
    },
    {
        label: 'Информация',
        submenu: [
            {
                label: 'Справка',
                click: helpWindow = createHelpWindow
            },
            {
                label: 'О программе',
                click: developerWindow = createDeveloperWindow
            }
        ]
    },
    {
        label: 'Выход',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+W'
    }
];

function createDeveloperWindow() {
    const developerWindow = new BrowserWindow({
        title: 'О программе',
        icon: 'assets/icons/icon_32x32.png',
        width: 350,
        height: 200,
        parent: mainWindow,
        modal: true,
        resizable: false,
        minimizable: false
    });
    developerWindow.removeMenu();

    developerWindow.loadFile(path.join(__dirname, './renderer/developer.html'));

    // Открывать все ссылки из окна в браузере
    developerWindow.webContents.setWindowOpenHandler(({url}) => {
        shell.openExternal(url);
        return {action: 'deny'};
    });

    return developerWindow;
};

function createHelpWindow() {
    const helpWindow = new BrowserWindow({
        title: 'Справка',
        icon: 'assets/icons/icon_32x32.png',
        width: 700,
        height: 500,
        parent: mainWindow,
        modal: true,
        resizable: false,
        minimizable: false
    });
    helpWindow.removeMenu();

    helpWindow.loadFile(path.join(__dirname, './renderer/help.html'));

    return helpWindow;
};

function createSettingsWindow() {
    const settingsWindow = new BrowserWindow({
        title: 'Настройки',
        icon: 'assets/icons/icon_32x32.png',
        width: 400,
        height: 250,
        parent: mainWindow,
        modal: true,
        resizable: false,
        minimizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    settingsWindow.removeMenu();

    settingsWindow.loadFile(path.join(__dirname, './renderer/settings.html'));

    return settingsWindow;
};

app.whenReady().then(() => {
    mainWindow = createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow();
        };
    });
});

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit();
    };
});