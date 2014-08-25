/**
 * @class
 * @extends BaseLayer
 */
var TitleScreen = BaseLayer.extend(/** @lends TitleScreen# */{

    _mainMenu: null,
    _settingsLayer: null,
    _settingsArrowsMenu: null,
    _settingsMenu: null,

    init: function () {
        this._super();

        var winWidth = this._winSize.width;
        var winHeight = this._winSize.height;
        var midWidth = winWidth / 2;

        cc.SpriteFrameCache.getInstance().addSpriteFrames(res.plist_Logos);
        cc.SpriteFrameCache.getInstance().addSpriteFrames(res.plist_Hud);
        var logoBatchNode = cc.SpriteBatchNode.create(res.img_Logos);

        var gameLogoY = winHeight - 50;

        var gameLogo = cc.Sprite.createWithSpriteFrameName("game_logo");
        gameLogo.setPosition(midWidth, gameLogoY);

        var menuInfos = [
            {
                text: "Start",
                callback: this.startGame
            }
        ];

        menuInfos.push({
            text: "Settings",
            callback: this.enterSettings
        });

        menuInfos.push({
            text: "Credits",
            callback: this.openCredits
        });

        var menuItems = [];

        for (var i = 0; i < menuInfos.length; i++) {
            var menuInfo = menuInfos[i];

            var menuItem = BAMenuItemLabel.create(
                cc.LabelBMFont.create(menuInfo.text, res.fnt_MainMini, winWidth / 2, cc.TEXT_ALIGNMENT_CENTER),
                menuInfo.callback,
                this);

            menuItems.push(menuItem);
        }

        var mainY = 24;
        var mainX = winWidth / 2;

        var mainMenu = BAMenu.create(menuItems);
        mainMenu.alignItemsVerticallyWithPadding(0);
        mainMenu.setPosition(mainX, mainY);

        logoBatchNode.addChild(gameLogo);

        this.addChild(cc.LayerColor.create(gbDarkestColor));
        this.addChild(logoBatchNode);
        this.addChild(mainMenu);

        this._mainMenu = mainMenu;

        this._setupSettings(mainX - 6, mainY);

        this.showMenu();

    },

    _setupSettings: function(mainX, mainY) {

        var userDefault = cc.UserDefault.getInstance();

        var bgmVolume = userDefault.getIntegerForKey(kUserDefaultBgmVolume, 10);
        var sfxVolume = userDefault.getIntegerForKey(kUserDefaultSfxVolume, 10);

        var baseX = mainX + 24;
        var bgmX = mainX + 2;
        var sfxX = mainX + 35;

        var bgmArrowUpSprite = cc.Sprite.createWithSpriteFrameName("arrowup");
        var bgmArrowDownSprite = cc.Sprite.createWithSpriteFrameName("arrowdown");
        var sfxArrowUpSprite = cc.Sprite.createWithSpriteFrameName("arrowup");
        var sfxArrowDownSprite = cc.Sprite.createWithSpriteFrameName("arrowdown");
        var backSprite = cc.Sprite.createWithSpriteFrameName("back");

        var bgmArrowUpSpriteSelected = cc.Sprite.createWithSpriteFrameName("arrowup-selected");
        var bgmArrowDownSpriteSelected = cc.Sprite.createWithSpriteFrameName("arrowdown-selected");
        var sfxArrowUpSpriteSelected = cc.Sprite.createWithSpriteFrameName("arrowup-selected");
        var sfxArrowDownSpriteSelected = cc.Sprite.createWithSpriteFrameName("arrowdown-selected");
        var backSpriteSelected = cc.Sprite.createWithSpriteFrameName("back-selected");

        var baseArrowDistance = 6;

        var bgmArrowUp = BAMenuItemSprite.create(bgmArrowUpSprite, bgmArrowUpSpriteSelected);
        bgmArrowUp.setAnchorPoint(0.5, 0);
        bgmArrowUp.setPosition(bgmX, mainY + 3 + baseArrowDistance);

        var bgmArrowDown = BAMenuItemSprite.create(bgmArrowDownSprite, bgmArrowDownSpriteSelected);
        bgmArrowDown.setAnchorPoint(0.5, 1);
        bgmArrowDown.setPosition(bgmX, mainY - baseArrowDistance);

        var sfxArrowUp = BAMenuItemSprite.create(sfxArrowUpSprite, sfxArrowUpSpriteSelected);
        sfxArrowUp.setAnchorPoint(0.5, 0);
        sfxArrowUp.setPosition(sfxX, mainY + 3 + baseArrowDistance);

        var sfxArrowDown = BAMenuItemSprite.create(sfxArrowDownSprite, sfxArrowDownSpriteSelected);
        sfxArrowDown.setAnchorPoint(0.5, 1);
        sfxArrowDown.setPosition(sfxX, mainY - baseArrowDistance);

        var backMenuItem = BAMenuItemSprite.create(backSprite, backSpriteSelected, this.exitSettings, this);
        backMenuItem.setAnchorPoint(0.5, 0.5);
        backMenuItem.setPosition(baseX - 51, mainY + 2);

        var bgmVolumeSelector = BANumberSelector.create(
            cc.LabelBMFont.create("", res.fnt_MainMini, 78, cc.TEXT_ALIGNMENT_CENTER),
            this.bgmActivate,
            this
        );
        bgmVolumeSelector.setupChangeMenuItems(bgmArrowUp, bgmArrowDown);
        bgmVolumeSelector.setMinValue(0);
        bgmVolumeSelector.setMaxValue(10);
        bgmVolumeSelector.setValue(bgmVolume);
        bgmVolumeSelector.setPosition(bgmX, mainY);
        bgmVolumeSelector.setChangeCallback(this.bgmVolumeChanged, this);

        var sfxVolumeSelector = BANumberSelector.create(
            cc.LabelBMFont.create("", res.fnt_MainMini, 78, cc.TEXT_ALIGNMENT_CENTER),
            this.sfxActivate,
            this
        );
        sfxVolumeSelector.setupChangeMenuItems(sfxArrowUp, sfxArrowDown);
        sfxVolumeSelector.setMinValue(0);
        sfxVolumeSelector.setMaxValue(10);
        sfxVolumeSelector.setValue(sfxVolume);
        sfxVolumeSelector.setPosition(sfxX, mainY);
        sfxVolumeSelector.setChangeCallback(this.sfxVolumeChanged, this);

        var settingsArrowsMenu = BAMenuBase.create([
            bgmArrowUp,
            bgmArrowDown,
            sfxArrowUp,
            sfxArrowDown
        ]);
        settingsArrowsMenu.selectAudio = null;
        settingsArrowsMenu.setPosition(0, 0);
        settingsArrowsMenu.setEnabled(false);

        var settingsMenu = BAMenu.create([
            backMenuItem,
            bgmVolumeSelector,
            sfxVolumeSelector
        ]);
        settingsMenu.selectAudio = null;
        settingsMenu.setVertical(false);
        settingsMenu.setPosition(0, 0);
        settingsMenu.setEnabled(false);

        var bgmIcon = cc.Sprite.createWithSpriteFrameName("bgm-icon");
        bgmIcon.setAnchorPoint(0, 0);
        bgmIcon.setPosition(bgmX - 14, mainY - 2);

        var sfxIcon = cc.Sprite.createWithSpriteFrameName("sfx-icon");
        sfxIcon.setAnchorPoint(0, 0);
        sfxIcon.setPosition(sfxX - 14, mainY - 2);

        var settingsLayer = cc.Layer.create();
        settingsLayer.setVisible(false);
        settingsLayer.addChild(bgmIcon);
        settingsLayer.addChild(sfxIcon);
        settingsLayer.addChild(settingsArrowsMenu);
        settingsLayer.addChild(settingsMenu);

        this.addChild(settingsLayer);

        this._settingsLayer = settingsLayer;
        this._settingsArrowsMenu = settingsArrowsMenu;
        this._settingsMenu = settingsMenu;

    },

    /**
     * ACTIONS
     */

    showMenu: function() {

        /*
        var audioEngine = cc.AudioEngine.getInstance();
        if (!audioEngine.isMusicPlaying())
            audioEngine.playMusic("bgm_title", true);
        */

        this._mainMenu.setEnabled(true);
        this._mainMenu.setVisible(true);

    },

    startGame: function() {
        cc.AudioEngine.getInstance().stopMusic();
        cc.Director.getInstance().replaceScene(new StagePreludeScene(1));
    },

    enterSettings: function() {
        this._mainMenu.setEnabled(false);
        this._mainMenu.setVisible(false);
        this._settingsArrowsMenu.setEnabled(true);
        this._settingsMenu.setEnabled(true);
        this._settingsMenu.setSelectedItem(1);
        this._settingsLayer.setVisible(true);
    },

    exitSettings: function() {
        cc.AudioEngine.getInstance().playEffect("sfx_cursor_back");
        this._settingsMenu.setEnabled(false);
        this._settingsArrowsMenu.setEnabled(false);
        this._settingsLayer.setVisible(false);
        this._mainMenu.setEnabled(true);
        this._mainMenu.setVisible(true);
    },

    openCredits: function() {
        cc.Director.getInstance().replaceScene(new CreditsScene());
    },

    /**
     *
     * @param {number} volume 0 ~ 10
     */
    applyBgmVolume: function(volume) {
        cc.UserDefault.getInstance().setIntegerForKey(kUserDefaultBgmVolume, volume);
        cc.AudioEngine.getInstance().setMusicVolume(volume / 10);
    },

    /**
     *
     * @param {number} volume 0 ~ 10
     */
    applySfxVolume: function(volume) {
        cc.UserDefault.getInstance().setIntegerForKey(kUserDefaultSfxVolume, volume);
        cc.AudioEngine.getInstance().setEffectsVolume(volume / 10);
    },

    /**
     *
     * @param {BANumberSelector} numberSelector
     */
    bgmActivate: function(numberSelector) {

        var volume = numberSelector.getValue() <= 5 ? 10 : 0;
        numberSelector.setValue(volume);
        this.applyBgmVolume(volume);

    },

    /**
     *
     * @param {BANumberSelector} numberSelector
     */
    sfxActivate: function(numberSelector) {

        var volume = numberSelector.getValue() <= 5 ? 10 : 0;
        numberSelector.setValue(volume);
        this.applySfxVolume(volume);

        cc.AudioEngine.getInstance().playEffect("sfx_cursor_select");

    },

    /**
     *
     * @param {BANumberSelector} numberSelector
     */
    bgmVolumeChanged: function(numberSelector) {
        this.applyBgmVolume(numberSelector.getValue());
    },

    /**
     *
     * @param {BANumberSelector} numberSelector
     */
    sfxVolumeChanged: function(numberSelector) {
        this.applySfxVolume(numberSelector.getValue());
    },

    /**
     * INPUT
     */

    buttonB: function() {

        if (this._settingsLayer.isVisible()) {
            this.exitSettings();
        }

    }

});

/**
 * @class
 * @extends cc.Scene
 */
var TitleScreenScene = cc.Scene.extend(/** @lends TitleScreenScene# */{

    onEnter: function () {
        this._super();
        var layer = new TitleScreen();
        layer.init();
        this.addChild(layer);
    }

});