/**
 * @class
 * @extends BaseLayer
 */
var Start = BaseLayer.extend(/** @lends Start# */{

    init: function() {
        this._super();

        var userDefault = cc.UserDefault.getInstance();
        var audioEngine = cc.AudioEngine.getInstance();

        audioEngine.setEffectsVolume(userDefault.getIntegerForKey(kUserDefaultSfxVolume, 10) / 10);
        audioEngine.setMusicVolume(userDefault.getIntegerForKey(kUserDefaultBgmVolume, 10) / 10);

        var midWidth = this._winSize.width / 2;

        var menuItem = BAMenuItemLabel.create(
            cc.LabelBMFont.create("PLAY", res.fnt_MainMini, midWidth, cc.TEXT_ALIGNMENT_CENTER),
            this.play,
            this);

        var mainMenu = BAMenu.create([menuItem]);
        mainMenu.alignItemsVerticallyWithPadding(0);
        mainMenu.setPosition(midWidth, this._winSize.height / 2);
        mainMenu.setEnabled(true);

        var bg = cc.LayerColor.create(gbDarkestColor);

        this.addChild(bg);
        this.addChild(mainMenu);

    },

    play: function() {
        cc.Director.getInstance().replaceScene(new SplashScreenScene);
    }

});

/**
 * @class
 * @extends cc.Scene
 */
var StartScene = cc.Scene.extend(/** @lends StartScene# */{

    onEnter: function () {
        this._super();
        var layer = new Start();
        layer.init();
        this.addChild(layer);
    }

});