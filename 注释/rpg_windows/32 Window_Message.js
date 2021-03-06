
/**-----------------------------------------------------------------------------   
 * Window_Message   
 * 窗口消息   
 * The window for displaying text messages.   
 * 显示文本消息的窗口 */

function Window_Message() {
    this.initialize.apply(this, arguments);
}

/**设置原形  */
Window_Message.prototype = Object.create(Window_Base.prototype);
/**设置创造者 */
Window_Message.prototype.constructor = Window_Message;
/**初始化 */
Window_Message.prototype.initialize = function() {
    //宽 = 窗口宽()
    var width = this.windowWidth();
    //高 = 窗口高()
    var height = this.windowHeight();
    //x = (图形 盒宽 - 宽) / 2
    var x = (Graphics.boxWidth - width) / 2;
    //窗口基础 初始化 呼叫(this , x ,0 , 宽 , 高)
    Window_Base.prototype.initialize.call(this, x, 0, width, height);
    //开放性 = 0
    this.openness = 0;
    //初始化成员()
    this.initMembers();
    //创建辅助窗口()
    this.createSubWindows();
    //更新位置()
    this.updatePlacement();
};
/**初始化成员 */
Window_Message.prototype.initMembers = function() {
    this._imageReservationId = Utils.generateRuntimeId();
    //背景 = 0 
    this._background = 0;
    //位置种类 = 2 
    this._positionType = 2;
    //等待计数 = 0 
    this._waitCount = 0;
    //脸位图 = null 
    this._faceBitmap = null;
    //文本状态 = null 
    this._textState = null;
    //清除标志()
    this.clearFlags();
};
/**辅助窗口 */
Window_Message.prototype.subWindows = function() {
    //返回 [金钱窗口, 选择窗口,数字窗口,物品窗口]
    return [this._goldWindow, this._choiceWindow,
            this._numberWindow, this._itemWindow];
};
/**创建辅助窗口 */
Window_Message.prototype.createSubWindows = function() {
    //金钱窗口 = 新 窗口金钱(0,0)
    this._goldWindow = new Window_Gold(0, 0);
    //金钱窗口 x = 图形 盒宽 - 金钱窗口 宽
    this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
    //金钱窗口 开放性 = 0
    this._goldWindow.openness = 0;
    //选择窗口 = 新 窗口选择(this)
    this._choiceWindow = new Window_ChoiceList(this);
    //数字窗口 = 新 窗口数字输入(this)
    this._numberWindow = new Window_NumberInput(this);
    //物品窗口 = 新 窗口事件物品(this)
    this._itemWindow = new Window_EventItem(this);
};
/**窗口宽 */
Window_Message.prototype.windowWidth = function() {
    //返回 图形 盒宽
    return Graphics.boxWidth;
};
/**窗口高 */
Window_Message.prototype.windowHeight = function() {
    //返回 适宜高(可见行数目())
    return this.fittingHeight(this.numVisibleRows());
};
/**清除标志 */
Window_Message.prototype.clearFlags = function() {
    //显示快速 = false
    this._showFast = false;
    //行显示快速 = false
    this._lineShowFast = false;
    //暂停跳过 = false
    this._pauseSkip = false;
};
/**可见行数目 */
Window_Message.prototype.numVisibleRows = function() {
    //返回 4
    return 4;
};
/**更新 */
Window_Message.prototype.update = function() {
    //检查不要关闭()
    this.checkToNotClose();
    Window_Base.prototype.update.call(this);
    //循环(不是 是打开中() 并且  不是 是关闭中())
    while (!this.isOpening() && !this.isClosing()) {
        //如果(更新等待())
        if (this.updateWait()) {
            //返回
            return;
        } else if (this.updateLoading()) {
            //返回
            return;
        } else if (this.updateInput()) {
            //返回
            return;
        } else if (this.updateMessage()) {
            //返回
            return;
        //否则 如果(能开始())
        } else if (this.canStart()) {
            //开始消息()
            this.startMessage();
        //否则
        } else {
            //开始输入()
            this.startInput();
            //返回
            return;
        }
    }
};
/**检查不要关闭 */
Window_Message.prototype.checkToNotClose = function() {
    //如果(是关闭中() 并且 是打开() )
    if (this.isClosing() && this.isOpen()) {
        //如果(做继续())
        if (this.doesContinue()) {
            //打开()
            this.open();
        }
    }
};
/**能开始 */
Window_Message.prototype.canStart = function() {
    //返回 游戏消息 有文本() && !游戏消息 滚动方式()
    return $gameMessage.hasText() && !$gameMessage.scrollMode();
};
/**开始消息 */
Window_Message.prototype.startMessage = function() {
    //文本状态 = {}
    this._textState = {};
    //文本状态 索引 = 0
    this._textState.index = 0;
    //文本状态 文本 = 转换换码字符(游戏消息 所有文本() )
    this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
    //新页(文本状态)
    this.newPage(this._textState);
    //更新位置()
    this.updatePlacement();
    //更新背景()
    this.updateBackground();
    //打开()
    this.open();
};
/**更新位置 */
Window_Message.prototype.updatePlacement = function() {
    this._positionType = $gameMessage.positionType();
    this.y = this._positionType * (Graphics.boxHeight - this.height) / 2;
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};
/**更新背景 */
Window_Message.prototype.updateBackground = function() {
    this._background = $gameMessage.background();
    this.setBackgroundType(this._background);
};
/**终止消息 */
Window_Message.prototype.terminateMessage = function() {
    this.close();
    this._goldWindow.close();
    $gameMessage.clear();
};
/**更新等待 */
Window_Message.prototype.updateWait = function() {
    if (this._waitCount > 0) {
        this._waitCount--;
        return true;
    } else {
        return false;
    }
};
/**更新读取 */
Window_Message.prototype.updateLoading = function() {
    if (this._faceBitmap) {
        if (this._faceBitmap.isReady()) {
            this.drawMessageFace();
            this._faceBitmap = null;
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
};
/**更新输入 */
Window_Message.prototype.updateInput = function() {
    //如果(是任何辅助窗口活动())
    if (this.isAnySubWindowActive()) {
        //返回 true
        return true;
    }
    //如果(暂停)
    if (this.pause) {
        //如果(是触发())
        if (this.isTriggered()) {
            //输入 更新()
            Input.update();
            //暂停 = false
            this.pause = false;
            //如果(不是 文本状态)
            if (!this._textState) {
                //终止消息()
                this.terminateMessage();
            }
        }
        //返回 true
        return true;
    }
    //返回 false
    return false;
};
/**是任何辅助窗口活动 */
Window_Message.prototype.isAnySubWindowActive = function() {
    return (this._choiceWindow.active ||
            this._numberWindow.active ||
            this._itemWindow.active);
};
/**更新消息 */
Window_Message.prototype.updateMessage = function() {
    if (this._textState) {
        while (!this.isEndOfText(this._textState)) {
            if (this.needsNewPage(this._textState)) {
                this.newPage(this._textState);
            }
            this.updateShowFast();
            this.processCharacter(this._textState);
            if (!this._showFast && !this._lineShowFast) {
                break;
            }
            if (this.pause || this._waitCount > 0) {
                break;
            }
        }
        if (this.isEndOfText(this._textState)) {
            this.onEndOfText();
        }
        return true;
    } else {
        return false;
    }
};
/**当文本结束 */
Window_Message.prototype.onEndOfText = function() {
    if (!this.startInput()) {
        if (!this._pauseSkip) {
            this.startPause();
        } else {
            this.terminateMessage();
        }
    }
    this._textState = null;
};
/**开始输入 */
Window_Message.prototype.startInput = function() {
    if ($gameMessage.isChoice()) {
        this._choiceWindow.start();
        return true;
    } else if ($gameMessage.isNumberInput()) {
        this._numberWindow.start();
        return true;
    } else if ($gameMessage.isItemChoice()) {
        this._itemWindow.start();
        return true;
    } else {
        return false;
    }
};
/**是触发 */
Window_Message.prototype.isTriggered = function() {
    return (Input.isRepeated('ok') || Input.isRepeated('cancel') ||
            TouchInput.isRepeated());
};
/**做继续 */
Window_Message.prototype.doesContinue = function() {
    //返回 ( 游戏消息 有文本()  并且 不是 游戏消息 滚动模式() 并且 不是 是设置改变() )
    return ($gameMessage.hasText() && !$gameMessage.scrollMode() &&
            !this.areSettingsChanged());
};
/**是设置改变
 * 
 * 背景 需要改变 或者
 * 位置种类 需要改变
 */
Window_Message.prototype.areSettingsChanged = function() {
    //返回 (背景 不等于 游戏消息 背景() 或者
    return (this._background !== $gameMessage.background() ||
            //位置种类  不等于  游戏消息 位置种类() )
            this._positionType !== $gameMessage.positionType());
};
/**更新快速显示 */
Window_Message.prototype.updateShowFast = function() {
    if (this.isTriggered()) {
        this._showFast = true;
    }
};
/**新页 */
Window_Message.prototype.newPage = function(textState) {
    this.contents.clear();
    this.resetFontSettings();
    this.clearFlags();
    this.loadMessageFace();
    textState.x = this.newLineX();
    textState.y = 0;
    textState.left = this.newLineX();
    textState.height = this.calcTextHeight(textState, false);
};
/**读取消息脸 */
Window_Message.prototype.loadMessageFace = function() {
    this._faceBitmap = ImageManager.reserveFace($gameMessage.faceName(), 0, this._imageReservationId);
};
/**绘制消息脸 */
Window_Message.prototype.drawMessageFace = function() {
    this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 0);
    ImageManager.releaseReservation(this._imageReservationId);
};
/**新行x */
Window_Message.prototype.newLineX = function() {
    return $gameMessage.faceName() === '' ? 0 : 168;
};
/**处理新行 */
Window_Message.prototype.processNewLine = function(textState) {
    this._lineShowFast = false;
    Window_Base.prototype.processNewLine.call(this, textState);
    if (this.needsNewPage(textState)) {
        this.startPause();
    }
};
/**处理新页 */
Window_Message.prototype.processNewPage = function(textState) {
    Window_Base.prototype.processNewPage.call(this, textState);
    if (textState.text[textState.index] === '\n') {
        textState.index++;
    }
    textState.y = this.contents.height;
    this.startPause();
};
/**是文本结束 */
Window_Message.prototype.isEndOfText = function(textState) {
    return textState.index >= textState.text.length;
};
/**需要新页 */
Window_Message.prototype.needsNewPage = function(textState) {
    return (!this.isEndOfText(textState) &&
            textState.y + textState.height > this.contents.height);
};
/**处理 替换符号 */
Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case '$':
        this._goldWindow.open();
        break;
    case '.':
        this.startWait(15);
        break;
    case '|':
        this.startWait(60);
        break;
    case '!':
        this.startPause();
        break;
    case '>':
        this._lineShowFast = true;
        break;
    case '<':
        this._lineShowFast = false;
        break;
    case '^':
        this._pauseSkip = true;
        break;
    default:
        Window_Base.prototype.processEscapeCharacter.call(this, code, textState);
        break;
    }
};
/**开始等待 */
Window_Message.prototype.startWait = function(count) {
    this._waitCount = count;
};
/**开始暂停 */
Window_Message.prototype.startPause = function() {
    this.startWait(10);
    this.pause = true;
};
