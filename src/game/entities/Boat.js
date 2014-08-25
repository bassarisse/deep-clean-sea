/**
 * Created by bassarisse on 08/08/14.
 */

/**
 * @class
 * @extends Actor
 */
var Boat = Actor.extend(/** @lends Boat# */{

    /* @type cc.ParticleSystem */
    particle: null,

    _resourceNode: null,
    _crateNode: null,

    /** @type Deposit */
    _dockedDeposit: null,
    /** @type Deposit */
    _crateDeposit: null,
    /** @type string */
    _currentResourceFrameName: "",
    /** @type number */
    _resourceLevel: 0,

    _yOffset: 0,

    _engineAudioId: null,
    _engine: false,
    _audioId: null,
    _isTransfering: false,

    init: function(b2world, properties) {

        this.node = cc.Sprite.createWithSpriteFrameName("boat");
        this._crateNode = cc.Sprite.createWithSpriteFrameName("crate-left");
        this._crateNode.setAnchorPoint(0.5, 0);
        this._crateNode.setVisible(false);
        this._resourceNode = cc.Sprite.createWithSpriteFrameName("boat-resource1");
        this._resourceNode.setVisible(false);
        this.type = GameObjectType.Boat;

        this._super(b2world, properties);

        this.life = 100;
        this.fuel = 100;

        this._walkForce = kBoatWalkForce;

        this.node.runAction(cc.RepeatForever.create(cc.Sequence.create([
            cc.DelayTime.create(0.9),
            cc.CallFunc.create(function() {
                this._yOffset = 1;
            }, this),
            cc.DelayTime.create(0.9),
            cc.CallFunc.create(function() {
                this._yOffset = 0;
            }, this)
        ])));

    },

    /**
     *
     * @param {cc.SpriteBatchNode} batchNode
     */
    setBatchNode: function(batchNode) {
        this._super(batchNode);

        batchNode.addChild(this._crateNode);
        batchNode.addChild(this._resourceNode);

    },

    update: function(delta) {

        if (this.fuel > 100)
            this.fuel = 100;

        this._super(delta);

        if (this.horizontalMovingState !== MovingState.Stopped && this.fuel > 0) {
            this.fuel -= delta * kBoatFuelFactor;//Math.abs(this.b2body.GetLinearVelocity().get_x()) / kBoatFuelFactor;
            this._startEngine();

            if (this.fuel < 0)
                this.fuel = 0;
        } else {
            this.endEngine();
        }

        if (this._dockedDeposit) {

            if (this._dockedDeposit.working) {

                if (this.resource > 0) {

                    var transfer = delta * kDepositResourceTransferFactor;
                    if (this.resource < transfer)
                        transfer = this.resource;
                    this.resource -= transfer;
                    this.stage.addResource(transfer);
                    this._dockedDeposit.resource += transfer;

                    this._startTransfer();

                } else {

                    this.endTransfer();

                }

            } else if (this.resource >= kDepositRevivalQuantity) {

                this.resource -= kDepositRevivalQuantity;
                this._dockedDeposit.working = true;
                this._dockedDeposit.resource = kDepositRevivalQuantity;
                this.stage.addResource(kDepositRevivalQuantity);
                cc.AudioEngine.getInstance().playEffect("sfx_deposit_open");

            }

            if (this._crateDeposit && this._dockedDeposit.working && this._crateDeposit !== this._dockedDeposit) {
                var crateResource = kResourceBase * 6;
                this._dockedDeposit.resource += crateResource;
                this.stage.addResource(crateResource);
                this._crateDeposit = null;
                this._crateNode.setVisible(false);
                cc.AudioEngine.getInstance().playEffect("sfx_crate");
            }

            if (!this._crateDeposit && this._dockedDeposit.crates > 0) {
                this._dockedDeposit.crates--;
                this._crateDeposit = this._dockedDeposit;
                this._crateNode.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame(this._crateDeposit.crateFrameName));
                this._crateNode.setVisible(true);
                cc.AudioEngine.getInstance().playEffect("sfx_crate");
            }

        } else {

            this.endTransfer();

        }

    },

    _startEngine: function() {

        var audioEngine = cc.AudioEngine.getInstance();

        if (!this._engine) {

            var self = this;

            if (this._engineAudioId) {
                audioEngine.stopEffect(this._engineAudioId);
                this._engineAudioId = null;
            }

            audioEngine.playEffect("sfx_engine_boat", true, function(audioId) {
                self._engineAudioId = audioId;
            });

        }

        this._engine = true;

    },

    endEngine: function() {

        this._engine = false;

        if (this._engineAudioId) {
            cc.AudioEngine.getInstance().stopEffect(this._engineAudioId);
            this._engineAudioId = null;
        }

    },

    _startTransfer: function() {

        var audioEngine = cc.AudioEngine.getInstance();

        if (!this._isTransfering) {

            var self = this;

            if (this._audioId) {
                audioEngine.stopEffect(this._audioId);
                this._audioId = null;
            }

            audioEngine.playEffect("sfx_resource_deposit", true, function(audioId) {
                self._audioId = audioId;
            });

        }

        this._isTransfering = true;

    },

    endTransfer: function() {

        this._isTransfering = false;

        if (this._audioId) {
            cc.AudioEngine.getInstance().stopEffect(this._audioId);
            this._audioId = null;
        }

    },

    updateNodePosition: function() {
        var position = this.b2body.GetPosition();
        var x = Math.round(position.get_x() * PTM_RATIO);
        var y = Math.round(position.get_y() * PTM_RATIO) + 6 + this._yOffset;

        if (this._shakeTime > 0) {
            x += (-1 + Math.round(Math.random() * 2));
            y += (-1 + Math.round(Math.random() * 2));
        }

        this.node.setPosition(x, y);
        this.particle.setPosition(x, y - 7 + this._yOffset * -1);
        this._crateNode.setPosition(x + 6, y - 3);
        this._resourceNode.setPosition(x, y);
    },

    updateMovingStates: function() {
        this._super();

        if (this.fuel <= 0)
            this.horizontalMovingState = MovingState.Stopped;

        var angle = this._getAngle();
        var stopped = angle === -1;
        var particleIsActive = this.particle.isActive();
        var oldAngle = this.particle.getAngle();
        this.particle.setAngle(angle);

        if (angle !== oldAngle)
            this.particle.updateParticlesAngles();

        if (stopped && particleIsActive) {
            this.particle.stopSystem();
        } else if (!stopped && !particleIsActive) {
            //this.particle.resetSystem();
            this.particle._isActive = true;
            this.particle._elapsed = 0;
        }

    },

    _getAngle: function() {
        var angle = 0;

        if (this.horizontalMovingState === MovingState.Left)
            angle = 345;
        else if (this.horizontalMovingState === MovingState.Right)
            angle = 195;
        else
            angle = -1;

        return angle;
    },

    _updateAnimation: function() {

        var resourceFrameName = this._currentResourceFrameName;
        var resourceVisible = true;

        if (this.resource > 600) {
            resourceFrameName = "boat-resource3";
        } else if (this.resource > 200) {
            resourceFrameName = "boat-resource2";
        } else if (this.resource > 0) {
            resourceFrameName = "boat-resource1";
        } else {
            resourceVisible = false;
        }

        if (this._resourceNode.isVisible() !== resourceVisible) {
            this._resourceNode.setVisible(resourceVisible);
        }

        if (this._currentResourceFrameName !== resourceFrameName) {
            this._currentResourceFrameName = resourceFrameName;
            this._resourceNode.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame(resourceFrameName));
        }

    },

    _addFixtures: function() {
        this._addRectangularFixture(20, 4);
    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    startCollision: function(contactType, contactContainer) {

        if (contactContainer.gameObject && contactContainer.gameObject.type === GameObjectType.Deposit) {
            this._dockedDeposit = contactContainer.gameObject;
            return;
        }

        if (contactContainer.type === ContactType.Floor) {

            var velocity = this.b2body.GetLinearVelocity();
            var velX = Math.abs(velocity.get_x()) - kDamageVelocityThreshold;
            var velY = Math.abs(velocity.get_y()) - kDamageVelocityThreshold;

            if (velX > 0 || velY > 0) {
                this.life -= (velX > velY ? velX : velY) * kBoatDamageFactor;
                this.damage();
                if (this.life < 0)
                    this.life = 0;
            }

        }

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    endCollision: function(contactType, contactContainer) {

        if (contactContainer.gameObject === this._dockedDeposit) {
            this._dockedDeposit = null;
        }

    },

    damage: function() {

        cc.AudioEngine.getInstance().playEffect("sfx_hit_boat");
        this._shakeTime = kDamageShakeTime;

    }

});