/**
 * @class
 * @extends BaseLayer
 */
var DialogueBaseLayer = BaseLayer.extend(/** @lends DialogueBaseLayer# */{

    _hasMessages: true,
    _hasTip: true,
    _started: false,
    _isShowingTip: false,
    _finished: false,
    _dialogueStep: 0,
    _messageLength: 0,
    _messages: null,
    _isWaitingInput: false,
    _contentLayer: null,
    _messagesLayer: null,
    _tipLayer: null,
    /** @type cc.LabelBMFont */
    _textLabel: null,
    _skipMenuItem: null,
    _skipMenu: null,
    _dialogueMark: null,

    /**
     *
     * @param {string} tipMessage
     * @param {string[]} messages
     */
    init: function(tipMessage, messages) {
        this._super();

        this._hasMessages = true;
        this._started = false;
        this._isShowingTip = false;
        this._finished = false;

        var winSize = this._winSize;
        var spriteCache = cc.SpriteFrameCache.getInstance();

        spriteCache.addSpriteFrames(res.plist_Hud);

        this.addChild(cc.LayerColor.create(gbDarkestColor));

        if (typeof tipMessage === "undefined")
            tipMessage = "";

        this._hasTip = tipMessage !== "";
        this._hasMessages = messages && messages.length > 0;

        if (!this._hasTip && !this._hasMessages)
            return;

        var contentLayer = cc.Layer.create();

        if (this._hasMessages) {

            var baseDialogHeight = winSize.height - 40;
            var messagesMargin = 5;
            var messagesWidth = winSize.width - (messagesMargin * 2) - 1;

            var dialogueMark = cc.Sprite.createWithSpriteFrameName("arrowdown");
            dialogueMark.setAnchorPoint(0.5, 1);
            dialogueMark.setPosition(winSize.width / 2, baseDialogHeight - 48);
            dialogueMark.setVisible(false);

            var textLabel = cc.LabelBMFont.create("", res.fnt_MainMicro, messagesWidth, cc.TEXT_ALIGNMENT_LEFT);
            textLabel.setAnchorPoint(0, 1);
            textLabel.setPosition(messagesMargin, baseDialogHeight + kMicroFontOffset - messagesMargin + 3);
            textLabel.setColor(gbLightestColor3);

            var messagesBg = cc.Scale9Sprite.createWithSpriteFrameName("messages-bg", cc.rect(8, 8, 8, 8));
            messagesBg.setContentSize(winSize.width - 2, 52);
            messagesBg.setAnchorPoint(0, 1);
            messagesBg.setPosition(1, baseDialogHeight);

            var messagesLayer = cc.Layer.create();
            messagesLayer.setVisible(false);

            messagesLayer.addChild(messagesBg);
            messagesLayer.addChild(textLabel);
            messagesLayer.addChild(dialogueMark);

            contentLayer.addChild(messagesLayer);

            this._messagesLayer = messagesLayer;
            this._textLabel = textLabel;
            this._dialogueMark = dialogueMark;

        }

        if (this._hasTip) {

            var tipBgWidth = winSize.width - 18;
            var tipLabelWidth = tipBgWidth - 6;
            var tipBgX = Math.round((winSize.width - tipBgWidth) / 2);

            var tipLabel = cc.LabelBMFont.create(tipMessage, res.fnt_MainMicro, tipLabelWidth, cc.TEXT_ALIGNMENT_LEFT);

            var tipLabelHeight = tipLabel.getContentSize().height;
            var tipBgHeight = tipLabelHeight + 2;
            var tipLabelX = tipBgX + 3;
            var tipLabelY = Math.round((winSize.height - tipLabelHeight) / 2);
            var tipBgY = Math.round((winSize.height - tipBgHeight) / 2);

            tipLabel.setAnchorPoint(0, 0);
            tipLabel.setPosition(tipLabelX, tipLabelY + kMicroFontOffset);
            tipLabel.setColor(gbLightestColor3);

            var tipBg = cc.LayerColor.create(gbDarkColor, tipBgWidth, tipBgHeight);
            tipBg.setPosition(tipBgX, tipBgY);

            var tipLayer = cc.Layer.create();
            tipLayer.setVisible(false);

            tipLayer.addChild(tipBg);
            tipLayer.addChild(tipLabel);

            contentLayer.addChild(tipLayer);

            this._tipLayer = tipLayer;

        }

        var skipLabel = cc.LabelBMFont.create("Skip", res.fnt_MainMini, winSize.width / 2, cc.TEXT_ALIGNMENT_RIGHT);
        skipLabel.setColor(gbDarkColor3);

        var skipMenuItem = BAMenuItemLabel.create(skipLabel, this._advance, this);
        skipMenuItem.setAnchorPoint(0.5, 0);
        skipMenuItem.setPosition(winSize.width / 2, -2);

        var skipMenu = BAMenuBase.create([
            skipMenuItem
        ]);
        skipMenu.selectAudio = null;
        skipMenu.moveAudio = null;
        skipMenu.setPosition(0, 0);

        contentLayer.addChild(skipMenu);

        this.addChild(contentLayer);

        this._messages = messages || [];
        this._contentLayer = contentLayer;
        this._skipMenuItem = skipMenuItem;
        this._skipMenu = skipMenu;
        this._dialogueStep = 0;
        this._messageLength = 0;

    },

    onEnter: function() {
        this._super();

        if (!this._hasMessages && !this._hasTip)
            this._executeFinish();
        else
            this.runAction(cc.Sequence.create([
                cc.DelayTime.create(0.5),
                cc.CallFunc.create(this._start, this)
            ]));
    },

    _hideContent: function() {
        this.recursivelyPauseAllChildren(this._contentLayer);
        this._contentLayer.setVisible(false);
    },

    _start: function() {
        this._started = true;

        if (this._hasMessages) {
            this._messagesLayer.setVisible(true);
            this._drawLetter();
        } else if (this._hasTip) {
            this._showTip();
        }
    },

    _drawLetter: function() {

        this._dialogueMark.setVisible(false);
        this._dialogueMark.stopAllActions();

        var currentMessage = this._messages[this._dialogueStep];

        this._messageLength++;

        this._textLabel.setString(currentMessage.substr(0, this._messageLength));

        if (this._messageLength < currentMessage.length) {

            this.runAction(cc.Sequence.create([
                cc.DelayTime.create(0.025),
                cc.CallFunc.create(this._drawLetter, this)
            ]));

        } else {

            this._dialogueStep++;
            this._isWaitingInput = true;

            if (this._dialogueStep >= this._messages.length) {
                this._dialogueMark.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("dot"));
            }

            this._dialogueMark.setVisible(true);
            this._dialogueMark.runAction(cc.RepeatForever.create(cc.Sequence.create([
                cc.DelayTime.create(0.3),
                cc.Hide.create(),
                cc.DelayTime.create(0.3),
                cc.Show.create()
            ])));

        }
    },

    _advanceMessage: function() {

        if (!this._started || this._finished)
            return;

        if (this._isShowingTip) {
            this._executeFinish();
            return;
        }

        if (!this._isWaitingInput) {
            this._messageLength = this._messages[this._dialogueStep].length - 1;
            return;
        }

        if (this._dialogueStep >= this._messages.length) {
            this._advance();
        } else {
            this._isWaitingInput = false;
            this._messageLength = 0;
            this._drawLetter();
        }

    },

    _advance: function() {
        if (!this._started)
            return;

        if (this._hasTip) {

            if (this._isShowingTip)
                this._executeFinish();
            else
                this._showTip();

        } else {
            this._executeFinish();
        }

    },

    _executeFinish: function() {
        if (this._finished)
            return;
        this._finished = true;

        this._hideContent();
        if (this._skipMenu)
            this._skipMenu.setEnabled(false);

        this.finish();
    },

    _showTip: function() {
        this._isShowingTip = true;
        if (this._messagesLayer)
            this._messagesLayer.setVisible(false);
        if (this._skipMenuItem)
            this._skipMenuItem.setString("OK");
        this._tipLayer.setVisible(true);
    },

    finish: function() {

    },

    /**
     * INPUT
     */

    buttonA: function() {
        this._advanceMessage();
    },

    buttonB: function() {
        this._advance();
    },

    buttonStart: function() {
        this._advance();
    },

    onPointerUp: function(event) {
        var location = event.getLocation();

        if (location.y < this._winSize.height * 0.07)
            return;

        this._advanceMessage();
    }

});