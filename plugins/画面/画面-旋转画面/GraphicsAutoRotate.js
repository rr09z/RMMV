
Graphics.rotate = function (type) {
    this.rotateTo(type)
    this.rotateLock(true) 
}


Graphics.rotateLock = function (type) {
    this._rotateLock = type
}

Graphics.rotateTo = function (type) {
    var type = type || 0
    if (this._rotate != type) {
        var list = [0, -90, -180, 90]
        var set = this._getRotateSet(list[type])
        this._setElement(this._base, set, "style")
        this._rotate = type
        Graphics._updateAllElements()
    }
}


Graphics.canAutoRotate = function () {
    return !this._rotateLock //&& Utils.isMobileDevice()
}

Graphics._updateAutoRotate = function (orientation) {
    //console.log(orientation)
    if (this.canAutoRotate()) { 
        if (orientation == 0) {
            Graphics.rotateTo(3)
        } else if (orientation == 180) {
            Graphics.rotateTo(1)
        } else if (orientation == 90) {
            Graphics.rotateTo(0)
        } else if (orientation == -90) {
            Graphics.rotateTo(2)
        }
    }
}

Graphics._onWindowResize = function () {
    if (window.innerHeight > window.innerWidth) {
        var orientation = 0
    } else {
        var orientation = 90
    }
    this._updateAutoRotate(orientation)
    this._updateAllElements();
};




Graphics._setupEventHandlers = function () {
    window.addEventListener('resize', this._onWindowResize.bind(this));
    document.addEventListener('keydown', this._onKeyDown.bind(this));
    document.addEventListener('touchend', this._onTouchEnd.bind(this));
    ("onorientationchange" in window) && document.addEventListener('onorientationchange', this._onWindowRotate.bind(this));
};



Graphics._onWindowRotate = function () {
    this._updateAutoRotate(window.orientation)
    this._updateAllElements();
};




SceneManager.initGraphics = function () {
    var type = this.preferableRendererType();
    Graphics.initialize(this._screenWidth, this._screenHeight, type);
    Graphics.boxWidth = this._boxWidth;
    Graphics.boxHeight = this._boxHeight;
    Graphics.setLoadingImage('img/system/Loading.png');
    if (Utils.isOptionValid('showfps')) {
        Graphics.showFps();
    }
    if (type === 'webgl') {
        this.checkWebGL();
    } 
    if ("orientation" in window) {
        Graphics._onWindowRotate()
    }else {
        Graphics._onWindowResize()
    } 
};