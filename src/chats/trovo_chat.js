const ChatCapture = require('./chat_capture');
const urlPrefix = 'https://trovo.live/chat/';

class TrovoChat extends ChatCapture {
    constructor(settings = {}, setState) {
        let options = {};
        options['url'] = urlPrefix + settings['Trovo Chat User Name'] + '?';
        options['height'] = settings['Trovo Chat Height'];
        options['width'] = settings['Trovo Chat Width'];
        options['interval'] = parseInt(settings['Trovo Chat Snapshot Time'],10) * 1000;
        options['snapshotSelector']='ul.chat-list';
        super(options, setState);
        this.timestampEnabled = false;
        this.highContrastEnabled = false;
        this.fontSize = 1;
        this.stateVal = 'streamchat_trovo_chat_image';

    }
    async changeSetting(settingName,value){
        let parent = this;
        let changeAppearance = false;
        let appearanceSelectors = new Array();
        console.log('Changing Setting',settingName,value);
        switch(settingName) {
            case 'Trovo Chat Height':
                parent.height = parseInt(value,10);
               this.changeViewport();
              break;
            case 'Trovo Chat Width':
                parent.width = parseInt(value,10);
                this.changeViewport();
              break;
            case 'Trovo Chat Device Scale Factor':
                parent.deviceScaleFactor = parseInt(value,10);
                this.changeViewport();
              break;
            case 'Trovo Chat Snapshot Time':
                parent.captureInterval = parseInt(value,10) * 1000;
              break;
        }
    }
}

module.exports = TrovoChat;