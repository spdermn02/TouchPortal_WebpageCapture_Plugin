const puppeteer = require('puppeteer');

class ChatCapture {
    constructor(options = {}, setState) {
        this.url = options['url'];
        this.capture = null;
        this.captureInterval = options['interval'] ?? 2000; //need a default of 2 seconds here incase got messed up
        this.width = ( parseInt(options['width'],10) > 0 ) ? parseInt(options['width'],10) : 300;
        this.height = ( parseInt(options['height'],10) > 0 ) ? parseInt(options['height'],10) : 600;
        this.deviceScaleFactor = ( parseInt(options['deviceScaleFactor'],10) > 0 ) ? parseInt(options['deviceScale'],10) : 2;
        this.snapshotSelector = options['snapshotSelector'] ?? undefined;
        this.setState = setState;
        this.initialize()
    }
    async initialize() {
        this.browser = await puppeteer.launch({ executablePath: './puppeteer/chrome.exe'});
        //this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }
    async loadChat(){
        let parent = this;
        await parent.page.goto(parent.url,{ waitUntil: 'networkidle2' });
        await parent.page.setViewport({width: parent.width, height: parent.height, deviceScaleFactor: 2});
        console.log("interval is "+parent.captureInterval);
        // parent.capture = setInterval(() => {
        //     parent.takeScreenshot();
        // },parent.captureInterval);
    }
    pauseCapture(){
        clearInterval(this.capture);
        this.capture = undefined;
    }
    resumeCapture(){
        let parent = this;
        console.log("interval is "+parent.captureInterval);
        parent.capture = setInterval(() => {
            parent.takeScreenshot();
        },parent.captureInterval);
    }
    async changeViewport(){
        console.log('changing viewport height:'+ this.height + ' width: '+ this.width)
        await this.page.setViewport({width: this.width, height: this.height, deviceScaleFactor: 2});
    }
    stopCapture(){
        clearInterval(this.capture);
        this.capture = null;
    }
    async takeScreenshot(){

        let snapshotPage = this.page;
        if( this.snapshotSelector != undefined ) { 
            await this.page.waitForSelector(this.snapshotSelector);
            snapshotPage = await this.page.$(this.snapshotSelector);
        }

        let screenshot = await snapshotPage.screenshot({encoding: "base64"});
        this.setState(this.stateVal,screenshot);
    }

     logIt() {
        var curTime = new Date().toISOString();
        var message = [...arguments];
        var type = message.shift();
        console.log(curTime,":"+type+":",message.join(" "));
    }
}

module.exports = ChatCapture;