const TPClient = new (require("touchportal-api").Client)();
const path = require('path');

const pluginId = 'TouchPortal_StreamChat';
const updateUrl = "https://raw.githubusercontent.com/spdermn02/TouchPortal_StreamChat_Plugin/master/package.json";

const settings = { };
let stateInterval = null;
const STATE_INTERVAL = 1000;

let states = {
    streamchat_twitch_chat_image: { value: '', updated: false},
    streamchat_trovo_chat_image: { value: '', updated: false}
};

let chats = new Map();

const updateTouchPortalStates = () => {
    let statesToUpdate = [];
    for( const state in states ) {
        if( states[state].updated ) {
            statesToUpdate.push({ id: state, value: states[state].value });
            states[state].updated = false;
        }
    }

    if( statesToUpdate.length > 0 ) {
      TPClient.stateUpdateMany( statesToUpdate );
    }
}

const setState = (state, value ) => {
    if( states[state] ) {
        if( states[state].value != value ) {
            states[state].value = value;
            states[state].updated = true;
        }
    }
    else {
        logIt("ERROR", 'attempted setState for',state,'but it is not defined');
    }
}
TPClient.on("Broadcast", () => {
    logIt('DEBUG','Received Broadcast Message, sending all states again');
    let statesToUpdate = [];
    for( const state in states ) {
        statesToUpdate.push({ id: state, value: states[state].value });
        states[state].updated = false;
    }

    if( statesToUpdate.length > 0 ) {
      TPClient.stateUpdateMany( statesToUpdate );
    }
})


// Touch Portal Client Setup
TPClient.on("Settings", async (data) => {
  if( data ) {
    data.forEach( (setting) => {
      let key = Object.keys(setting)[0];
      if( settings[key] === setting[key] ) return;
      settings[key] = setting[key];
    });

    if( settings['Twitch Chat Enabled']?.toLowerCase() === 'yes' && !chats.has('TWITCH')) {
        TPClient.createState('streamchat_twitch_chat_image','StreamChat Twitch Chat Image','');
        const TwitchChat = require(path.join(__dirname,'/chats/')+'twitch_chat.js');
        const chat = new TwitchChat(settings, setState);
        console.log(JSON.stringify(chat));
        logIt('DEBUG','before sleeping 2000 after setup');
        await sleep(2000);
        logIt('DEBUG','after sleeping 2000 after setup');
        chat.loadChat();
        chats.set('TWITCH',chat);
    }
    if( settings['Twitch Chat Enabled']?.toLowerCase() === 'yes' && chats.has('TWITCH')) {
        const chat = chats.get('TWITCH');
        logIt('DEBUG','before sleeping 2000 before settings');
        await sleep(2000);
        logIt('DEBUG','after sleeping 2000 before settings');
        chat.pauseCapture();
        for(const setting in settings ){
            if( setting.match(/^Twitch/) ) {
                chat.changeSetting(setting,settings[setting]);
            }
        }
        await sleep(5000);
        chat.resumeCapture();
    }
    if( settings['Twitch Chat Enabled']?.toLowerCase() === 'no' && chats.has('TWITCH')) {
        let chat = chats.get('TWITCH');
        chat.stopCapture();
        chat = null;
        chats.delete('TWITCH');
        TPClient.removeState('streamchat_twitch_chat_image');
    }
    if( settings['Trovo Chat Enabled']?.toLowerCase() === 'yes' && !chats.has('TROVO')) {
        TPClient.createState('streamchat_trovo_chat_image','StreamChat Trovo Chat Image','');
        const TrovoChat = require(path.join(__dirname,'/chats/')+'trovo_chat.js');
        const chat = new TrovoChat(settings, setState);
        console.log(JSON.stringify(chat));
        logIt('DEBUG','before sleeping 2000 after setup');
        await sleep(2000);
        logIt('DEBUG','after sleeping 2000 after setup');
        chat.loadChat();
        chats.set('TROVO',chat);
    }
    if( settings['Trovo Chat Enabled']?.toLowerCase() === 'yes' && chats.has('TROVO')) {
        const chat = chats.get('TROVO');
        logIt('DEBUG','before sleeping 2000 before settings');
        await sleep(2000);
        logIt('DEBUG','after sleeping 2000 before settings');
        chat.pauseCapture();
        for(const setting in settings ){
            if( setting.match(/^Trovo/) ) {
                chat.changeSetting(setting,settings[setting]);
            }
        }
        await sleep(5000);
        chat.resumeCapture();
    }
    if( settings['Trovo Chat Enabled']?.toLowerCase() === 'no' && chats.has('TROVO')) {
        let chat = chats.get('TROVO');
        chat.stopCapture();
        chat = null;
        chats.delete('TROVO');
        TPClient.removeState('streamchat_trovo_chat_image');
    }
    // if( settings['Facebook Chat Enabled']?.toLowerCase() === 'yes' && !chats.has('FACEBOOK')) {
    //     const FacebookChat = require(path.join(__dirname,'/chats/')+'facebook_chat.js');
    //     chats.set('FACEBOOK',new FacebookChat(settings, setState));
    // }
    // if( settings['Facebook Chat Enabled']?.toLowerCase() === 'no' && chats.has('FACEBOOK')) {
    //     const chat = chats.get('FACEBOOK');
    //     chat.stopCapture();
    //     chat = null;
    //     chats.delete('FACEBOOK');
    // }
    // if( settings['YouTube Chat Enabled']?.toLowerCase() === 'yes' && !chats.has('YOUTUBE')) {
    //     const YouTubeChat = require(path.join(__dirname,'/chats/')+'youtube_chat.js');
    //     chats.set('YOUTUBE',new YouTubeChat(settings, setState));
    // }
    // if( settings['YouTube Chat Enabled']?.toLowerCase() === 'no' && chats.has('YOUTUBE')) {
    //     const chat = chats.get('YOUTUBE');
    //     chat.stopCapture();
    //     chat = null;
    //     chats.delete('YOUTUBE');
    // }
  }
});
  
TPClient.on("Info", (data) => {
  //TP Is connected now
  logIt('DEBUG','We are connected, received Info message');

  stateInterval = setInterval(() => {
      updateTouchPortalStates();
  }, STATE_INTERVAL);
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