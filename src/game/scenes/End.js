
/**
 * @class
 * @extends BaseLayer
 */
var End = BaseLayer.extend(/** @lends End# */{

    _menu: null,
    _level: 0,

    onEnterTransitionDidFinish: function() {
        this._super();
        this._menu.setEnabled(true);
    },

    /**
     *
     * @param {EndReason} endReason
     * @param {number} level
     * @param {Gatherer} gatherer
     * @param {Boat} boat
     * @param {number} resource
     * @param {number} resourcePileQuantity
     * @param {boolean} hasWorkingDeposits
     */
    init: function(endReason, level, gatherer, boat, resource, resourcePileQuantity, hasWorkingDeposits) {

        this._super();

        this._level = level;

        var userDefault = cc.UserDefault.getInstance();

        var bestScore = userDefault.getIntegerForKey(kUserDefaultBestScore, 0);
        var record = resource > bestScore;

        if (record) {
            bestScore = resource;
            userDefault.setIntegerForKey(kUserDefaultBestScore, resource);
        }

        this.addChild(cc.LayerColor.create(gbDarkestColor));

        var winWidth = this._winSize.width;
        var winHeight = this._winSize.height;
        var midWidth = winWidth / 2;

        var menuInfos = [
            {
                text: "Restart",
                callback: this.restart
            },
            {
                text: "Main Menu",
                callback: this.mainMenu
            }
        ];

        var mainY = 3;
        var mainX = winWidth - 5;
        var menuItems = [];

        for (var i = menuInfos.length - 1; i >= 0; i--) {
            var menuInfo = menuInfos[i];

            var menuItem = BAMenuItemLabel.create(
                cc.LabelBMFont.create(menuInfo.text, res.fnt_MainMini, midWidth, cc.TEXT_ALIGNMENT_CENTER),
                menuInfo.callback,
                this);
            menuItem.setAnchorPoint(1, 0);
            menuItem.setPosition(mainX, mainY);

            menuItems.unshift(menuItem);
            mainY += 12;
        }

        var mainMenu = BAMenu.create(menuItems);
        mainMenu.setAnchorPoint(0, 0);
        mainMenu.setPosition(0, 0);
        mainMenu.setEnabled(false);
        this.addChild(mainMenu);

        var mainMessage = cc.LabelBMFont.create("GAME OVER", res.fnt_MainMicro, winWidth, cc.TEXT_ALIGNMENT_CENTER);
        mainMessage.setPosition(cc.p(midWidth, winHeight - 16));
        mainMessage.setAnchorPoint(0.5, 0.5);
        mainMessage.setColor(gbLightestColor);
        this.addChild(mainMessage);

        var gameOverReason = "";

        switch(endReason) {
            case EndReason.BoatFuel:
                gameOverReason = "Your boat has run out of fuel.\nShift over, next!"; break;
            case EndReason.BoatLife:
                gameOverReason = "You destroyed the boat.\nNow we have do recycle it, too.\nAnd yes, you're fired."; break;
            case EndReason.GathererFuel:
                gameOverReason = "Your gatherer has run out of fuel.\nShift over, next!"; break;
            case EndReason.GathererLife:
                gameOverReason = "The gatherer is totally wrecked.\nNext time, handle it with care.\nAh, your next time won't be here, OK?"; break;
            case EndReason.ResourcePiles:
                gameOverReason = "You're supposed to remove the trash,\nnot to organize it.\nFired!"; break;
            case EndReason.NoWorkingDeposits:
                gameOverReason = "All the deposits are out of market.\nTime to find a new job?"; break;
        }

        var gameOverReasonLabel = cc.LabelBMFont.create(gameOverReason, res.fnt_MainMicro, winWidth - 10, cc.TEXT_ALIGNMENT_CENTER);
        gameOverReasonLabel.setPosition(cc.p(midWidth, winHeight - 28));
        gameOverReasonLabel.setAnchorPoint(0.5, 1);
        gameOverReasonLabel.setColor(gbLightColor);

        this.addChild(gameOverReasonLabel);

        if (record) {

            var recordLabel = cc.LabelBMFont.create("NEW RECORD!", res.fnt_MainMicro, winWidth , cc.TEXT_ALIGNMENT_LEFT);
            recordLabel.setPosition(cc.p(5, 47));
            recordLabel.setAnchorPoint(0, 0);
            recordLabel.setColor(gbLightestColor);
            this.addChild(recordLabel);

            recordLabel.runAction(cc.RepeatForever.create(cc.Sequence.create([
                cc.DelayTime.create(0.3),
                cc.Hide.create(),
                cc.DelayTime.create(0.15),
                cc.Show.create()
            ])));
        }

        var scoreNames = cc.LabelBMFont.create("Total recycled\n \nBest", res.fnt_MainMicro, winWidth , cc.TEXT_ALIGNMENT_LEFT);
        scoreNames.setPosition(cc.p(5, 15));
        scoreNames.setAnchorPoint(0, 0);
        scoreNames.setColor(gbLightestColor);
        this.addChild(scoreNames);

        var scores = cc.LabelBMFont.create(resource.toFixed(0) + "\n \n" + bestScore.toFixed(0), res.fnt_MainMicro, winWidth , cc.TEXT_ALIGNMENT_LEFT);
        scores.setPosition(cc.p(5, 6));
        scores.setAnchorPoint(0, 0);
        scores.setColor(gbLightColor);
        this.addChild(scores);

        this._menu = mainMenu;

        cc.AudioEngine.getInstance().playMusic("bgm_end", false);

    },

    restart: function() {
        this._menu.setEnabled(false);
        cc.AudioEngine.getInstance().stopMusic();
        cc.Director.getInstance().replaceScene(new StageScene(null, this._level));
    },

    mainMenu: function() {
        this._menu.setEnabled(false);
        cc.AudioEngine.getInstance().stopMusic();
        cc.Director.getInstance().replaceScene(new TitleScreenScene());
    }
});

/**
 * @class
 * @extends cc.Scene
 */
var EndScene = cc.Scene.extend(/** @lends EndScene# */{

    _endReason: null,
    _level: 0,
    _gatherer: null,
    _boat: 0,
    _resource: null,
    _resourcePileQuantity: 0,
    _hasWorkingDeposits: null,

    ctor: function(endReason, level, gatherer, boat, resource, resourcePileQuantity, hasWorkingDeposits) {
        this._endReason = endReason;
        this._level = level;
        this._gatherer = gatherer;
        this._boat = boat;
        this._resource = resource;
        this._resourcePileQuantity = resourcePileQuantity;
        this._hasWorkingDeposits = hasWorkingDeposits;
        this._super();
    },

    onEnter: function () {
        this._super();
        var layer = new End();
        layer.init(this._endReason, this._level, this._gatherer, this._boat, this._resource, this._resourcePileQuantity, this._hasWorkingDeposits);
        this.addChild(layer);
    }


});