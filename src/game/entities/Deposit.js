
/**
 * @class
 * @extends GameObject
 */
var Deposit = GameObject.extend(/** @lends Deposit# */{

    _resourcePowerNode: null,
    _signNode: null,
    _crateNode: null,
    _gearsNode: null,

    working: false,
    resource: 0,
    _noResourceTimer: 0,
    crates: 0,
    _nextCrateTime: 0,

    crateFrameName: null,

    _addFixtures: function() {
        var properties = this._initProperties;
        this._addRectangularFixture(properties["width"] / 2, properties["height"] / 2);
    },

    init: function(b2world, properties) {

        this.type = GameObjectType.Deposit;
        this._isSensor = true;

        this._super(b2world, properties);

        this.b2body.SetGravityScale(0);

        this._noResourceTimer = kNoResourceTime;
        this.working = true;

        this._setCrateTime();

    },

    /**
     *
     * @param {cc.SpriteBatchNode} batchNode
     */
    setBatchNode: function(batchNode) {
        this._super(batchNode);

        var width = kBaseScreenWidth;
        var y = 119;

        var resourcePowerOverlay = cc.Sprite.createWithSpriteFrameName("power-overlay");
        var resourcePowerBg = cc.LayerColor.create(gbDarkColor, kTileSize * 2, 1);
        this._resourcePowerNode = cc.LayerColor.create(gbLightestColor, kTileSize * 2 - 1, 1);
        this._signNode = cc.Sprite.createWithSpriteFrameName("sign-warning");
        this._gearsNode = cc.Sprite.createWithSpriteFrameName("gears1");

        if (this._initialPosition.x < width / 2) {

            this._resourcePowerNode.setAnchorPoint(0, 0);
            this._resourcePowerNode.setPosition(0, y - 7);

            resourcePowerOverlay.setAnchorPoint(0.5, 0);
            resourcePowerOverlay.setPosition(kTileSize, y - 7);

            resourcePowerBg.setAnchorPoint(0.5, 0);
            resourcePowerBg.setPosition(0, y - 7);

            this._signNode.setAnchorPoint(0, 0);
            this._signNode.setPosition(20, y);

            this._gearsNode.setAnchorPoint(0, 0);
            this._gearsNode.setPosition(1, y + 6);

            this.crateFrameName = "crate-right";
            this._crateNode = cc.Sprite.createWithSpriteFrameName(this.crateFrameName);
            this._crateNode.setAnchorPoint(0, 0);
            this._crateNode.setPosition(29, y);


        } else {

            this._resourcePowerNode.setAnchorPoint(0, 0);
            this._resourcePowerNode.setPosition(width - kTileSize * 2 + 1, y - 7);

            resourcePowerOverlay.setScaleX(-1);
            resourcePowerOverlay.setAnchorPoint(0.5, 0);
            resourcePowerOverlay.setPosition(width - kTileSize, y - 7);

            resourcePowerBg.setAnchorPoint(0, 0);
            resourcePowerBg.setPosition(width - kTileSize * 2, y - 7);

            this._signNode.setAnchorPoint(1, 0);
            this._signNode.setPosition(width - 20, y);

            this._gearsNode.setAnchorPoint(1, 0);
            this._gearsNode.setPosition(width - 4, y + 6);

            this.crateFrameName = "crate-left";
            this._crateNode = cc.Sprite.createWithSpriteFrameName(this.crateFrameName);
            this._crateNode.setAnchorPoint(1, 0);
            this._crateNode.setPosition(width - 29, y);

        }

        this._signNode.setVisible(false);
        this._crateNode.setVisible(false);

        batchNode.addChild(this._signNode);
        batchNode.addChild(this._crateNode);
        batchNode.addChild(this._gearsNode);

        var parent = batchNode.getParent();

        parent.addChild(resourcePowerBg);
        parent.addChild(this._resourcePowerNode);
        parent.addChild(resourcePowerOverlay);

        batchNode.reorderChild(this._signNode, -1);
        batchNode.reorderChild(this._crateNode, -1);
        batchNode.reorderChild(this._gearsNode, -1);
    },

    _setCrateTime: function() {
        this._nextCrateTime = 10 + Math.random() * 80;
    },

    update: function(delta) {
        this._super(delta);

        this._updateNodes();

        if (!this.working)
            return;

        this._nextCrateTime -= delta;
        if (this._nextCrateTime < 0) {
            if (this.crates === 0) {
                cc.AudioEngine.getInstance().playEffect("sfx_crate");
                this.crates++;
            }
            this._setCrateTime();
        }

        if (this.resource > 0) {

            this.resource -= delta * kWorldResourceTransferFactor;
            if (this.resource <= 0) {
                this.resource = 0;
                cc.AudioEngine.getInstance().playEffect("sfx_deposit_warning");
            }

            this._noResourceTimer += delta;
            if (this._noResourceTimer > kNoResourceTime)
                this._noResourceTimer = kNoResourceTime;

        } else {

            this._noResourceTimer -= delta;
            if (this._noResourceTimer < 0) {
                this.working = false;
                cc.AudioEngine.getInstance().playEffect("sfx_deposit_close");
            }

        }

    },

    _updateNodes: function() {

        this._signNode.setVisible(false);
        this._crateNode.setVisible(false);

        if (!this.working) {

            this._signNode.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("sign-closed"));
            this._signNode.setVisible(true);

        } else if (this.resource <= 0) {

            this._signNode.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("sign-warning"));
            this._signNode.setVisible(true);

        }

        if (this.crates > 0)
            this._crateNode.setVisible(true);

        var maxPowerWidth = kTileSize * 2 - 1;
        var powerWidth = Math.round(maxPowerWidth * this._noResourceTimer / kNoResourceTime);
        if (powerWidth < 0)
            powerWidth = 0;
        if (powerWidth > maxPowerWidth)
            powerWidth = maxPowerWidth;

        if (powerWidth !== this._resourcePowerNode.getContentSize().width){
            this._resourcePowerNode.setVisible(false);
            this._resourcePowerNode.stopAllActions();
            this._resourcePowerNode.runAction(cc.Sequence.create([
                cc.Hide.create(),
                cc.DelayTime.create(0.1),
                cc.Show.create()
            ]));
        }

        this._resourcePowerNode.setContentSize(powerWidth, 1);

        var powerPosition = this._resourcePowerNode.getPosition();
        if (powerPosition.x >= kBaseScreenWidth / 2)
            this._resourcePowerNode.setPosition(kBaseScreenWidth - powerWidth, powerPosition.y);

        if (this.resource > 0) {

            var gearsAction = this._gearsNode.getActionByTag(kGearsActionTag);

            if (!gearsAction) {

                var anim = this._loadAnimation(["gears1", "gears2", "gears3", "gears4", "gears3", "gears2"],
                    0,
                    0.2);

                gearsAction = cc.RepeatForever.create(cc.Animate.create(anim));
                gearsAction.setTag(kGearsActionTag);

                this._gearsNode.runAction(gearsAction);

            }

            this._gearsNode.resumeSchedulerAndActions();

        } else {

            this._gearsNode.pauseSchedulerAndActions();

        }

    }

});