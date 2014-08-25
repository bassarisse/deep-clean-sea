/**
 * @class
 * @extends BaseLayer
 */
var Credits = BaseLayer.extend(/** @lends Credits# */{

    init: function () {
        this._super();

        var winWidth = this._winSize.width;
        var labelX = winWidth - 5;
        
        cc.SpriteFrameCache.getInstance().addSpriteFrames(res.plist_Logos);

        var gameNameLabel = cc.LabelBMFont.create("DEEP\nCLEAN\nSEA", res.fnt_MainMini, 150, cc.TEXT_ALIGNMENT_LEFT);
        gameNameLabel.setColor(gbLightestColor3);
        gameNameLabel.setAnchorPoint(0, 1);
        gameNameLabel.setPosition(5, this._winSize.height - 4);

        var versionLabel = cc.LabelBMFont.create("v" + kVersion, res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_LEFT);
        versionLabel.setColor(gbDarkColor3);
        versionLabel.setAnchorPoint(0, 1);
        versionLabel.setPosition(5, this._winSize.height - 30);

        var labelY = this._winSize.height + 1;
        var labelLineHeight = 7;
        var labelSpacing = 23;

        var label7 = cc.LabelBMFont.create("MADE FOR", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label7.setColor(gbLightColor3);
        label7.setAnchorPoint(1, 1);
        label7.setPosition(labelX, labelY);

        var label8 = cc.LabelBMFont.create("Game Boy JAM 3", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label8.setColor(gbLightestColor3);
        label8.setAnchorPoint(1, 1);
        label8.setPosition(labelX, labelY - labelLineHeight);

        labelY -= labelSpacing;

        var label4 = cc.LabelBMFont.create("GAME BY", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label4.setColor(gbLightColor3);
        label4.setAnchorPoint(1, 1);
        label4.setPosition(labelX, labelY);

        var label6 = cc.LabelBMFont.create("Bruno Assarisse", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label6.setColor(gbLightestColor3);
        label6.setAnchorPoint(1, 1);
        label6.setPosition(labelX, labelY - labelLineHeight);

        labelY -= labelSpacing;

        var label2 = cc.LabelBMFont.create("DEVELOPED WITH", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label2.setColor(gbLightColor3);
        label2.setAnchorPoint(1, 1);
        label2.setPosition(labelX, labelY);

        var label3 = cc.LabelBMFont.create("cocos2d-html5", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label3.setColor(gbLightestColor3);
        label3.setAnchorPoint(1, 1);
        label3.setPosition(labelX, labelY - labelLineHeight);

        labelY -= labelSpacing;

        var label9 = cc.LabelBMFont.create("SPECIAL THANKS", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label9.setColor(gbLightColor3);
        label9.setAnchorPoint(1, 1);
        label9.setPosition(labelX, labelY);

        var label10 = cc.LabelBMFont.create("Caroline Rodolfo <3", res.fnt_MainMicro, 150, cc.TEXT_ALIGNMENT_RIGHT);
        label10.setColor(gbLightestColor3);
        label10.setAnchorPoint(1, 1);
        label10.setPosition(labelX, labelY - labelLineHeight);

        labelY -= labelSpacing;

        var backSprite = cc.Sprite.createWithSpriteFrameName("back");
        var backSpriteSelected = cc.Sprite.createWithSpriteFrameName("back-selected");

        var backMenuItem = BAMenuItemSprite.create(backSprite, backSpriteSelected, this.exit, this);
        backMenuItem.setAnchorPoint(1, 1);
        backMenuItem.setPosition(labelX, labelY - 8);

        var menu = BAMenuBase.create([
            backMenuItem
        ]);
        menu.selectAudio = null;
        menu.setPosition(0, 0);

        this.addChild(cc.LayerColor.create(gbDarkestColor));
        this.addChild(gameNameLabel);
        this.addChild(versionLabel);
        this.addChild(label2);
        this.addChild(label3);
        this.addChild(label4);
        this.addChild(label6);
        this.addChild(label7);
        this.addChild(label8);
        this.addChild(label9);
        this.addChild(label10);
        this.addChild(menu);

        /*
        var audioEngine = cc.AudioEngine.getInstance();
        if (!audioEngine.isMusicPlaying())
            audioEngine.playMusic("bgm_title", true);
        */

    },

    buttonStart: function() {
        this.exit();
    },

    buttonA: function() {
        this.exit();
    },

    buttonB: function() {
        this.exit();
    },

    exit: function() {
        cc.AudioEngine.getInstance().playEffect("sfx_cursor_back");
        cc.Director.getInstance().replaceScene(new TitleScreenScene());
    }

});

/**
 * @class
 * @extends cc.Scene
 */
var CreditsScene = cc.Scene.extend(/** @lends CreditsScene# */{

    onEnter: function () {
        this._super();
        var layer = new Credits();
        layer.init();
        this.addChild(layer);
    }

});