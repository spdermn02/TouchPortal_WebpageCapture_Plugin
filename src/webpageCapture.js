const puppeteer = require('puppeteer');

class WebpageCapture {
    constructor(options = {}, setState) {
        this.url = options['url'];
        this.capture = null;
        this.stateVal = options['state'];
        this.captureInterval = options['interval'] ?? 2000; //need a default of 2 seconds here incase got messed up
        this.width = ( parseInt(options['width'],10) > 0 ) ? parseInt(options['width'],10) : 300;
        this.height = ( parseInt(options['height'],10) > 0 ) ? parseInt(options['height'],10) : 600;
        this.deviceScaleFactor = ( parseInt(options['deviceScaleFactor'],10) > 0 ) ? parseInt(options['deviceScaleFactor'],10) : 2;
        this.snapshotSelector = options['snapshotSelector'] ?? undefined;
        this.executablePath = options['executablePath'];
        this.cleanElements = options['cleanElements'] != '' ? options['cleanElements'].split(",") : [];
        this.setState = setState;
    }
    async initialize() {
        let parent = this;
        parent.browser = await puppeteer.launch({headless: true,
            executablePath: this.executablePath 
        });
        parent.page = await this.browser.newPage();
        await parent.page.setViewport({width: parent.width, height: parent.height, deviceScaleFactor: parent.deviceScaleFactor});
        await parent.page.goto(parent.url,{ waitUntil: 'networkidle2' });
        parent.cleanElements.forEach(async (selText) => {
            await this.page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for(var i=0; i< elements.length; i++){
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, selText);
        });

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
        await this.page.setViewport({width: this.width, height: this.height, deviceScaleFactor: this.deviceScaleFactor});
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