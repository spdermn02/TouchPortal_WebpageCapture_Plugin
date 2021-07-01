const puppeteer = require('puppeteer');

class WebpageCapture {
    constructor(options = {}, setState) {
        this.url = options['url'];
        this.capture = null;
        this.stateVal = options['state'];
        this.captureInterval = options['interval'] ?? 2000; //need a default of 2 seconds here incase got messed up
        this.width = ( parseInt(options['width'],10) > 0 ) ? parseInt(options['width'],10) : 300;
        this.height = ( parseInt(options['height'],10) > 0 ) ? parseInt(options['height'],10) : 600;
        this.deviceScaleFactor = ( parseInt(options['deviceScaleFactor'],10) > 0 ) ? parseInt(options['deviceScale'],10) : 2;
        this.snapshotSelector = options['snapshotSelector'] ?? undefined;
        this.setState = setState;
        this.logIt('DEBUG',JSON.stringify(options));
        this.initialize()
    }
    async initialize() {
        let parent = this;
        //parent.browser = await puppeteer.launch({ executablePath: './puppeteer/chrome.exe'});
        parent.browser = await puppeteer.launch({headless: true,
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' // Windows
        });
        parent.page = await this.browser.newPage();
        await parent.page.goto(parent.url,{ waitUntil: 'networkidle2' });
        await parent.page.setViewport({width: parent.width, height: parent.height, deviceScaleFactor: 2});
    }
    pauseCapture(){
        clearInterval(this.capture);
        this.capture = undefined;
    }
    startCapture(){
        let parent = this;
        parent.capture = setInterval(() => {
            parent.takeScreenshot();
        },parent.captureInterval);
    }
    async changeViewport(){
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

module.exports = WebpageCapture;