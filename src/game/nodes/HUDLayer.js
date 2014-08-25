
/**
 * @class
 * @extends cc.Layer
 */
var HUDLayer = cc.Layer.extend(/** @lends HUDLayer# */{

    /** @type Gatherer */
    _gatherer: null,
    /** @type Boat */
    _boat: null,

    /** @type cc.Size */
    _windowSize: null,
    /** @type cc.SpriteBatchNode */
    _batchNode: null,

    /** @type cc.LabelBMFont */
    _gathererResourceLabel: null,
    /** @type cc.LabelBMFont */
    _boatResourceLabel: null,
    /** @type cc.LabelBMFont */
    _gathererFuelLabel: null,
    /** @type cc.LabelBMFont */
    _boatFuelLabel: null,

    init: function(gatherer, boat) {

        this._gatherer = gatherer;
        this._boat = boat;

        cc.SpriteFrameCache.getInstance().addSpriteFrames(res.plist_Hud);

        var windowSize = cc.Director.getInstance().getWinSize();
        var batchNode = cc.SpriteBatchNode.create(res.img_Hud);

        // BOAT -----------------------------------

        var boatIcon = cc.Sprite.createWithSpriteFrameName("icon-boat");
        boatIcon.setAnchorPoint(0, 1);
        boatIcon.setPosition(0, windowSize.height);

        var boatFuelIcon = cc.Sprite.createWithSpriteFrameName("icon-fuel");
        boatFuelIcon.setAnchorPoint(1, 1);
        boatFuelIcon.setPosition(kTileSize * 2, windowSize.height);

        var boatFuelLabel = cc.LabelBMFont.create("0", res.fnt_MainMicro, windowSize.width / 2, cc.TEXT_ALIGNMENT_RIGHT);
        boatFuelLabel.setColor(gbDarkestColor3);
        boatFuelLabel.setAnchorPoint(0, 1);
        boatFuelLabel.setPosition(kTileSize * 2 - 1, windowSize.height + 5);

        var boatResourceIcon = cc.Sprite.createWithSpriteFrameName("icon-resource");
        boatResourceIcon.setAnchorPoint(1, 1);
        boatResourceIcon.setPosition(kTileSize * 6, windowSize.height);

        var boatResourceLabel = cc.LabelBMFont.create("0", res.fnt_MainMicro, windowSize.width / 2, cc.TEXT_ALIGNMENT_LEFT);
        boatResourceLabel.setColor(gbDarkestColor3);
        boatResourceLabel.setAnchorPoint(0, 1);
        boatResourceLabel.setPosition(kTileSize * 6 - 1, windowSize.height + 5);

        // GATHERER -----------------------------------

        var gathererIcon = cc.Sprite.createWithSpriteFrameName("icon-gatherer");
        gathererIcon.setAnchorPoint(1, 1);
        gathererIcon.setPosition(windowSize.width, windowSize.height);

        var gathererFuelIcon = cc.Sprite.createWithSpriteFrameName("icon-fuel");
        gathererFuelIcon.setAnchorPoint(0, 1);
        gathererFuelIcon.setPosition(windowSize.width - kTileSize * 2 - 1, windowSize.height);

        var gathererFuelLabel = cc.LabelBMFont.create("0", res.fnt_MainMicro, windowSize.width / 2, cc.TEXT_ALIGNMENT_RIGHT);
        gathererFuelLabel.setColor(gbDarkestColor3);
        gathererFuelLabel.setAnchorPoint(1, 1);
        gathererFuelLabel.setPosition(windowSize.width - kTileSize * 2, windowSize.height + 5);

        var gathererResourceIcon = cc.Sprite.createWithSpriteFrameName("icon-resource");
        gathererResourceIcon.setAnchorPoint(0, 1);
        gathererResourceIcon.setPosition(windowSize.width - kTileSize * 6 - 1, windowSize.height);

        var gathererResourceLabel = cc.LabelBMFont.create("0", res.fnt_MainMicro, windowSize.width / 2, cc.TEXT_ALIGNMENT_LEFT);
        gathererResourceLabel.setColor(gbDarkestColor3);
        gathererResourceLabel.setAnchorPoint(1, 1);
        gathererResourceLabel.setPosition(windowSize.width - kTileSize * 6, windowSize.height + 5);

        batchNode.addChild(boatIcon);
        batchNode.addChild(boatFuelIcon);
        batchNode.addChild(boatResourceIcon);
        batchNode.addChild(gathererIcon);
        batchNode.addChild(gathererFuelIcon);
        batchNode.addChild(gathererResourceIcon);

        this.addChild(batchNode);

        this.addChild(boatFuelLabel);
        this.addChild(boatResourceLabel);
        this.addChild(gathererResourceLabel);
        this.addChild(gathererFuelLabel);

        this._windowSize = windowSize;
        this._batchNode = batchNode;
        this._gathererResourceLabel = gathererResourceLabel;
        this._boatResourceLabel = boatResourceLabel;
        this._boatFuelLabel = boatFuelLabel;
        this._gathererFuelLabel = gathererFuelLabel;

    },

    update: function(delta) {

        this._boatResourceLabel.setString(Math.ceil(this._boat.resource).toFixed(0));
        this._boatFuelLabel.setString(Math.ceil(this._boat.fuel).toFixed(0) + "%");
        this._gathererResourceLabel.setString(Math.ceil(this._gatherer.resource).toFixed(0));
        this._gathererFuelLabel.setString(Math.ceil(this._gatherer.fuel).toFixed(0) + "%");

    }

});