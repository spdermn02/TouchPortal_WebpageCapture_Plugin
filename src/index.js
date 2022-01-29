const TPClient = new (require("touchportal-api").Client)();
const fs = require('fs');
const WebpageCapture = require("./webpageCapture");
const puppeteer = require('puppeteer');
const path = require('path');

const pluginId = 'TouchPortal_Webpage_Capture';
const updateUrl = "https://raw.githubusercontent.com/spdermn02/TouchPortal_WebpageCapture_Plugin/main/package.json";
const DEFAULT_CONFIG = './config/';
const DEFAULT_BROWSER_EXECUTABLE_PATH = './puppeteer/chrome.exe';

const settings = { };
let states = {};

const updateTouchPortalStates = () => {
    let statesToUpdate = [];
    for( const state in states ) {
        statesToUpdate.push({ id: state, value: states[state].value });
        states[state].updated = false;
    }

    if( statesToUpdate.length > 0 ) {
      TPClient.stateUpdateMany( statesToUpdate );
    }
}

const setState = (state, value ) => {
    if( states[state] ) {
        if( states[state].value != value ) {
            states[state].value = value;
            TPClient.stateUpdate(state,value);
        }
    }
    else {
        logIt("ERROR", 'attempted setState for',state,'but it is not defined');
    }
}

const loadWebpagesToCapture = async () => {
    const configPath = settings['Config Directory'] ?? DEFAULT_CONFIG;
    const files = fs.readdirSync(configPath);
    const webpages = files.filter(f => f.split(".").pop() === 'cnf' );
    if( webpages.length <= 0 ) {
        logIt("WARNING", "No webpages found to capture");
    }
    else {
        let browser = await puppeteer.launch({headless: true,
            executablePath: settings['Browser Executable Path'] ?? DEFAULT_BROWSER_EXECUTABLE_PATH 
        });
        webpages.forEach(async (webpage) => {
            const data = fs.readFileSync(configPath+webpage).toString();
            const state = pluginId+'_'+webpage.split(".").shift().replace(/(\n|\r)+$/,'');
            const options = data.split(/\r?\n/).reduce((obj,line,index) => {
                const strParts = line.match(/([^=]*)=(.*)/);
                if( strParts[1] && strParts[2]){
                    obj[strParts[1].replace(/\s+/g,'')] = strParts[2].replace(/(\n|\r)+$/,'');
                }
                return obj;
            },{})
            if( !states[state] ) {
                TPClient.createState(state,'Capture '+options.name,'');
            }
            states[state] = { value : ''}
            options.state = state;
            options.interval = parseInt(options.interval,10)*1000; //convert to ms
            options.interval = (options.interval <= 0 ) ? 2000 : options.interval;
            options.browser = browser;
            const capture = new WebpageCapture(options,setState);
            await capture.initialize();
            capture.startCapture();
        });
    }
}

TPClient.on("Action", (data) => {
    logIt('DEBUG','Action Message received');
});

TPClient.on("Broadcast", () => {
    logIt('DEBUG','Received Broadcast Message, sending all states again');
    updateTouchPortalStates();
})

// Touch Portal Client Setup
TPClient.on("Settings", async (data) => {
  if( data ) {
    data.forEach( (setting) => {
      let key = Object.keys(setting)[0];
      if( settings[key] === setting[key] ) return;
      settings[key] = setting[key];
    });
  }
  loadWebpagesToCapture();
});
  
TPClient.on("Info", (data) => {
  //TP Is connected now
  logIt('DEBUG','We are connected, received Info message');
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logIt() {
    var curTime = new Date().toISOString();
    var message = [...arguments];
    var type = message.shift();
    console.log(curTime,":",pluginId,":"+type+":",message.join(" "));
}

TPClient.connect({ pluginId, updateUrl });