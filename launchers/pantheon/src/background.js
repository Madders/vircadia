'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'
const storage = require('electron-json-storage');
const electronDl = require('electron-dl');
const { readdirSync } = require('fs')
const { forEach } = require('p-iteration');

var glob = require('glob');
 
electronDl();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ 
    width: 1000, 
    height: 800, 
    icon: path.join(__static, '/resources/launcher.ico'), 
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      // devTools: true
    } 
  })

  // This line disables the default menu behavior on Windows.
  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
  await installVueDevtools()
} catch (e) {
  // console.error('Vue Devtools failed to install:', e.toString())
}

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// Settings.JSON bootstrapping
// storage.setDataPath(app.getAppPath() + "/settings");

console.log("Data Path: " + storage.getDataPath());

// if(process.env.LAST_ATHENA_INSTALLED) {
//   var lastInstalled = process.env.LAST_ATHENA_INSTALLED;
//   storage.set('athena_interface.location', lastInstalled, function(error) {
//     if (error) throw error;
//   });
// }

var storagePath = {
	default: storage.getDefaultDataPath(),
	interface: null,
	interfaceSettings: null,
};

// storage.set('testObject', { foo: 'bar' }, { dataPath: storagePath.default }, function(error) {
//   if (error) throw error;
// });

var requireInterfaceSelection;

async function generateInterfaceList(interfaces) {
  var interfacesArray = [];
  var dataPath;
  
  for (var i in interfaces) {
    var client = interfaces[i];
    dataPath = client + "launcher_settings";
    
    console.info("Well:",dataPath, "Based on:", client);
    
    await getSetting('interface_package', dataPath).then(function(pkg){
		var appName = pkg.package.name;
		var appObject = { 
			[appName]: {
				"location": client,
			}
		};
		interfacesArray.push(appObject);
		console.info(interfacesArray);
    });
  }
  return interfacesArray;
  console.info(interfacesArray);
}

var getDirectories = function (src, callback) {
  if(glob(src + '/*/launcher_settings/interface_package.json')) {
    glob(src + '/*/', callback);
  }
};

async function getLibraryInterfaces() {
	var interfaces = [];

	let getLibraryPromise = new Promise((res, rej) => {
		var res_p = res;
		var rej_p = rej;
		getSetting('athena_interface.library', storagePath.default).then(function(libraryPath){
			if(libraryPath) {
				getDirectories(libraryPath, function (err, res) {
					if (err) {
						console.log('Error', err);
						rej_p("Error: " + error);
					} else {
						interfaces = res;
						res_p("Success!");
					}
				});
			} else {
				interfaces = ["Select a library folder."];
				rej_p("Select a library folder.");
			}
			
		});
	});
  
  let result = await getLibraryPromise; 
  return interfaces;
}

function setLibraryDialog() {
  const {dialog} = require('electron') 

  dialog.showOpenDialog(win, {
    title: "Select the Athena Interface app library folder",
    properties: ['openDirectory'],
  }).then(result => {
    console.log(result.canceled)
    console.log(result.filePaths)
    if(!result.canceled && result.filePaths[0]) {
      storage.set('athena_interface.library', result.filePaths[0], {dataPath: storagePath.default}, function(error) {
        if (error) {
          throw error;
        } else {
          return true;
        }
      });
    } else {
      return false;
    }
  }).catch(err => {
    console.log(err)
    return false;
  })
}

async function getSetting(setting, storageDataPath) {
  var returnValue;
  
  let storagePromise = new Promise((res, rej) => {
    storage.get(setting, {dataPath: storageDataPath}, function(error, data) {
      if (error) {
        throw error;
        returnValue = false;
        rej("Error: " + error);
      } else if (data == {}) {
        returnValue = false;
        rej("Not found.")
      }
      returnValue = data;
      res("Success!");
    });
  });
  
  // because async won't work otherwise. 
  let result = await storagePromise; 
  return returnValue;
}

const { ipcMain } = require('electron')

ipcMain.on('launch-interface', (event, arg) => {
  var interface_exe = require('child_process').execFile;
  // var executablePath = "E:\\Development\\High_Fidelity\\v0860-kasen-VS-release+freshstart\\build\\interface\\Packaged_Release\\Release\\interface.exe";
  var executablePath = arg.exec;
  var parameters = [""];
  
  // arg is expected to be true or false with regards to SteamVR being enabled or not, later on it may be an object or array and we will handle it accordingly.
  if(arg.steamVR) {
    parameters += ['--disable-displays', 'OpenVR (Vive)', '--disable-inputs', 'OpenVR (Vive)'];
  }
  if(arg.allowMultipleInterfaces) {
    parameters += ['--allowMultipleInstances'];
  }
  
  interface_exe(executablePath, parameters, function(err, data) {
    console.log(err)
    console.log(data.toString());
  });
  
})

ipcMain.on('getAthenaLocation', async (event, arg) => {
	var athenaLocation = await getSetting('athena_interface.location', storagePath.interfaceSettings);
	var athenaLocationExe = athenaLocation.toString();
	console.log(athenaLocationExe);
	event.returnValue = athenaLocationExe;
})

ipcMain.on('setAthenaLocation', async (event, arg) => {
  const {dialog} = require('electron') 
  
  dialog.showOpenDialog(win, {
    title: "Select the Athena Interface executable",
    properties: ['openFile'],
    defaultPath: storage.getDataPath(),
    filters: [
      { name: 'Interface Executable', extensions: ['exe'] },
    ]
  }).then(result => {
    console.log(result.canceled)
    console.log(result.filePaths)
    if(!result.canceled && result.filePaths[0]) {
      	storage.set('athena_interface.location', result.filePaths[0], {dataPath: storagePath.interfaceSettings}, function(error) {
        if (error) throw error;
      });
    } else {
      return;
    }
  }).catch(err => {
    console.log(err)
    return;
  })
  
})

ipcMain.on('setLibraryFolder', (event, arg) => {
	setLibraryDialog();
})

ipcMain.on('setCurrentInterface', (event, arg) => {
	if(arg) {
		storage.setDataPath(arg + "/launcher_settings");
		storagePath.interface = arg;
		storagePath.interfaceSettings = arg + "/launcher_settings";
		console.info("storagePath:", JSON.stringify(storagePath));
	}
})

ipcMain.handle('isInterfaceSelectionRequired', (event, arg) => {
	if(storagePath.interface == null || storagePath.interfaceSettings == null) {
		event.sender.send('interface-selection-required', true);
	} else {
		event.sender.send('interface-selection-required', false);
	}
})

ipcMain.handle('populateInterfaceList', (event, arg) => {
	getLibraryInterfaces().then(async function(results) {
		var generatedList = await generateInterfaceList(results);
		// console.info("Returning...", generatedList, "typeof", typeof generatedList, "results", results);
		event.sender.send('interface-list', generatedList);
	});
})

ipcMain.on('downloadAthena', (event, arg) => {
  	var libraryPath;
  	// var downloadURL = "https://files.yande.re/sample/a7e8adac62ee05c905056fcfb235f951/yande.re%20572549%20sample%20bikini%20breast_hold%20cleavage%20jahy%20jahy-sama_wa_kujikenai%21%20konbu_wakame%20swimsuits.jpg";
	var downloadURL = "http://ipv4.download.thinkbroadband.com/100MB.zip";
	// var downloadURL = "http://home.darlingvr.club/hifi-community/fix-scaled-walk-speed/HighFidelity-Beta-v0.86.0-7364ac5.exe";
  
  getSetting('athena_interface.library', storagePath.default).then(function(results){
    if(results) {
      libraryPath = results;
      console.log("How many times?" + libraryPath);
      electronDl.download(win, downloadURL, {
        directory: libraryPath,
        showBadge: true,
        filename: "Setup_Latest.exe",
		onProgress: currentProgress => {
			console.info(currentProgress);
			var percent = currentProgress.percent;
			win.webContents.send('download-installer-progress', {
				percent
			});
        },
      });
    } else {
      setLibraryDialog();
    }
  });
})

ipcMain.on('installAthena', (event, arg) => {
	getSetting('athena_interface.library', storagePath.default).then(function(libPath){
		var installer_exe = require('child_process').execFile;
		var executablePath = libPath + "/Setup_Latest.exe";
		var installPath = libPath + "/testInterface";
		var parameters = [""];
		// parameters += ['/s', "/D=", installPath];

		installer_exe(executablePath, parameters, function(err, data) {
			console.log(err)
			console.log(data.toString());
		});
	});
});
