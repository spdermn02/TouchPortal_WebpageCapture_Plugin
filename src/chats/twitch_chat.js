const ChatCapture = require('./chat_capture');
const urlPrefix = 'https://www.twitch.tv/popout/';

class TwitchChat extends ChatCapture {
    constructor(settings = {}, setState) {
        let options = {};
        const darkMode = ( settings['Twitch Chat Show Darkmode'].toLowerCase() === 'no' ) ? '' : '?darkpopout';
        const username=settings['Twitch Chat User Name'];
        options['url'] = urlPrefix + username + '/chat' + darkMode;
        options['height'] = settings['Twitch Chat Height'];
        options['width'] = settings['Twitch Chat Width'];
        options['interval'] = parseInt(settings['Twitch Chat Snapshot Time'],10) * 1000;
        options['snapshotSelector']='[data-a-target="chat-scroller"]';
        super(options, setState);
        
        this.username = username;
        this.darkMode = darkMode;
        this.timestampEnabled = false;
        this.highContrastEnabled = false;
        this.fontSize = 1;
        this.stateVal = 'streamchat_twitch_chat_image';

    }
    buildUrl(username,darkMode){
      return urlPrefix + username + '/chat' + darkMode;
    }
    async changeSetting(settingName,value){
        let parent = this;
        let changeAppearance = false;
        let appearanceSelectors = new Array();
        console.log('Changing Setting',settingName,value);
        switch(settingName) {
            case 'Twitch Chat Text Size':
                if( this.fontSize == value ) { break; }
                const twFontSize = '.notched-range--mark--label[data-index="'+value+'"]';
                await parent.page.waitForSelector('[data-a-target="chat-settings"]')
                await parent.page.click('[data-a-target="chat-settings"]');
                await parent.page.waitForSelector('button[data-a-target="chat-appearance-selector"]');
                await parent.page.click('button[data-a-target="chat-appearance-selector"]');
                await parent.page.waitForSelector(twFontSize);
                await parent.page.click(twFontSize);
                await parent.page.waitForSelector('[data-test-selector="chat-input-buttons-container"]');
                await parent.page.click('[data-test-selector="chat-input-buttons-container"]');
              break;
            case 'Twitch Chat Show Timestamp':
                if( (parent.timestampEnabled && value === 'Yes' ) || (!parent.timestampEnabled && value === 'No')) {
                    break;
                }
                console.log("Here supposed to be setting timestamp");
                parent.timestampEnabled = false;
                await parent.page.waitForSelector('[data-a-target="chat-settings"]')
                await parent.page.click('[data-a-target="chat-settings"]');
                await parent.page.waitForSelector('button[data-a-target="chat-appearance-selector"]');
                await parent.page.click('button[data-a-target="chat-appearance-selector"]');
                await parent.page.waitForSelector('[for="chat-settings-timestamp"]');
                await parent.page.click('[for="chat-settings-timestamp"]');
                await parent.page.waitForSelector('[data-test-selector="chat-input-buttons-container"]');
                await parent.page.click('[data-test-selector="chat-input-buttons-container"]');
                if( value === 'Yes' ) { parent.timestampEnabled = true; }
              break;
            case 'Twitch Chat Readable Colors':
                if( (parent.highContrastEnabled && value === 'Yes') || (!parent.highContrastEnabled && value === 'No') ) {
                    break;
                }
                parent.highContrastEnabled = false;
                await parent.page.waitForSelector('[data-a-target=chat-settings]')
                await parent.page.click('[data-a-target=chat-settings]');
                await parent.page.waitForSelector('button[data-a-target=chat-appearance-selector]');
                await parent.page.click('button[data-a-target=chat-appearance-selector]');
                await parent.page.waitForSelector('[for=chat-settings-high-contrast]');
                await parent.page.click('[for=chat-settings-high-contrast]');
                await parent.page.waitForSelector('[data-test-selector="chat-input-buttons-container"]');
                await parent.page.click('[data-test-selector="chat-input-buttons-container"]');
                if( value === 'Yes' ) { parent.highContrastEnabled = true; }
              break;
            case 'Twitch Chat Height':
                parent.height = parseInt(value,10);
               this.changeViewport();
              break;
            case 'Twitch Chat Width':
                parent.width = parseInt(value,10);
                this.changeViewport();
              break;
            case 'Twitch Chat Device Scale Factor':
                parent.deviceScaleFactor = parseInt(value,10);
                this.changeViewport();
              break;
            case 'Twitch Chat Snapshot Time':
                parent.captureInterval = parseInt(value,10) * 1000;
              break;
        }
    }
}

module.exports = TwitchChat;