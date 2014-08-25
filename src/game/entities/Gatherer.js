/**
 * Created by bassarisse on 08/08/14.
 */

/**
 * @class
 * @extends Actor
 */
var Gatherer = Actor.extend(/** @lends Gatherer# */{

    /* @type cc.ParticleSystem */
    particle: null,

    /** @type ResourcePile */
    _nearestResourcePile: null,
    /** @type ResourcePile */
    _boat: null,

    _isFloating: false,
    _yOffset: 0,

    _engineAudioId: null,
    _engine: false,
    _audioId: null,
    _isGathering: false,
    _isTransfering: false,

    init: function(b2world, properties) {

        this.node = cc.Sprite.createWithSpriteFrameName("gatherer1");
        this.type = GameObjectType.Gatherer;

        this._super(b2world, properties);

        this._changeGravity = true;
        this._walkForce = kGathererWalkForce;
        this.horizontalMovingStates = [];

        this.life = 100;
        this.fuel = 100;

        this.setContactTypes([ContactType.Body, ContactType.Hatch]);

        this.node.runAction(cc.RepeatForever.create(cc.Sequence.create([
            cc.DelayTime.create(0.72),
            cc.CallFunc.create(function() {
                this._yOffset = 1;
            }, this),
            cc.DelayTime.create(0.72),
            cc.CallFunc.create(function() {
                this._yOffset = 0;
            }, this)
        ])));

    },

    stopAllActions: function() {
        this.node.stopActionByTag(kGatherActionTag);
    },

    update: function(delta) {

        if (this.fuel > 100)
            this.fuel = 100;

        this._super(delta);

        var transfer;

        if (this.state === GameObjectState.Docked && this._nearestResourcePile && this._nearestResourcePile.canGather()) {

            transfer = delta * kGathererResourceTransferFactor;
            if (this._nearestResourcePile.resource < transfer)
                transfer = this._nearestResourcePile.resource;

            this._nearestResourcePile.resource -= transfer;
            this.resource += transfer;

            this._startGather();

        } else if (this.resource > 0 && this._boat) {

            transfer = delta * kBoatResourceTransferFactor;
            if (this.resource < transfer)
                transfer = this.resource;

            this.resource -= transfer;
            this._boat.resource += transfer;

            this._startTransfer();

        } else {

            this.endTransfer();

        }

        if (this.verticalMovingState !== MovingState.Stopped && this.fuel > 0) {
            this.fuel -= delta * kGathererFuelFactor;//Math.abs(this.b2body.GetLinearVelocity().get_y()) / kGathererFuelFactor;
            this._startEngine();

            if (this.fuel < 0)
                this.fuel = 0;
        } else {
            this.endEngine();
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

            audioEngine.playEffect("sfx_engine_gatherer", true, function(audioId) {
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
        this._isGathering = false;

    },

    _startGather: function() {

        var audioEngine = cc.AudioEngine.getInstance();

        if (!this._isGathering) {

            var self = this;

            if (this._audioId) {
                audioEngine.stopEffect(this._audioId);
                this._audioId = null;
            }

            audioEngine.playEffect("sfx_resource_gatherer", true, function(audioId) {
                self._audioId = audioId;
            });

        }

        this._isGathering = true;
        this._isTransfering = false;

    },

    endTransfer: function() {

        this._isGathering = false;
        this._isTransfering = false;

        if (this._audioId) {
            cc.AudioEngine.getInstance().stopEffect(this._audioId);
            this._audioId = null;
        }

    },

    updateNodePosition: function() {
        var position = this.b2body.GetPosition();
        var x = Math.round(position.get_x() * PTM_RATIO);
        var y = Math.round(position.get_y() * PTM_RATIO) - 1 + (this._isFloating ? this._yOffset : 0);

        if (this._shakeTime > 0) {
            x += (-1 + Math.round(Math.random() * 2));
            y += (-1 + Math.round(Math.random() * 2));
        }

        this.node.setPosition(x, y);
        this.particle.setPosition(x, y);
    },

    updateMovingStates: function() {
        this._super();

        var isDocked = this.state === GameObjectState.Docked;

        if (this.fuel <= 0 && !isDocked)
            this.verticalMovingState = MovingState.Stopped;

        if (isDocked) {
            this.horizontalMovingState = MovingState.Stopped;
            createVec(0, this.b2body.GetLinearVelocity().get_y(), function(vec) {
                this.b2body.SetLinearVelocity(vec);
            }, this);
        }

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

        if (this.verticalMovingState === MovingState.Up)
            angle = 270;
        else if (this.verticalMovingState === MovingState.Down)
            angle = 90;
        else
            angle = -1;

        return angle;
    },

    _updateAnimation: function() {

        if (this.state === GameObjectState.Docked) {

            if (this._nearestResourcePile && !this._nearestResourcePile.isDead()) {

                var gatherAction = this.node.getActionByTag(kGatherActionTag);

                if (!gatherAction) {

                    var anim = this._loadAnimation(["gatherer3", "gatherer2", "gatherer4", "gatherer2"],
                        0,
                        0.2);

                    gatherAction = cc.RepeatForever.create(cc.Animate.create(anim));
                    gatherAction.setTag(kGatherActionTag);

                    this.stopAllActions();
                    this.node.runAction(gatherAction);

                }

            } else {

                this.stopAllActions();
                this.node.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("gatherer2"));

            }

        } else {

            this.stopAllActions();
            this.node.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("gatherer1"));

        }

    },

    _addFixtures: function() {

        var width = 4;

        this._addCircularFixture(width);
        this._addRectangularFixture(width * 3, 3, 0, -2.5, 0);

        var scale = this.node ? this.node.getScale() : 1;

        var hatchShape = new b2PolygonShape();
        createVec(0, 4 * scale / PTM_RATIO, function(vec) {
            hatchShape.SetAsBox(width / 2 / PTM_RATIO, 0.3 / PTM_RATIO, vec, 0);
        }, this);

        var hatchContainer = new ContactContainer;
        hatchContainer.type = ContactType.Hatch;

        this._createSensorFixture(hatchShape, hatchContainer);

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    startCollision: function(contactType, contactContainer) {

        var gameObject = contactContainer.gameObject;

        if (contactType === ContactType.Body) {

            if (gameObject && gameObject.type === GameObjectType.ResourcePile) {
                if (!this._nearestResourcePile) {
                    this._nearestResourcePile = gameObject;
                } else {
                    var thisX = this.b2body.GetPosition().get_x();
                    var distanceToCurrent = Math.abs(this._nearestResourcePile.b2body.GetPosition().get_x() - thisX);
                    var distanceToTest = Math.abs(gameObject.b2body.GetPosition().get_x() - thisX);
                    if (distanceToTest < distanceToCurrent)
                        this._nearestResourcePile = gameObject;
                }
                return;
            }

            if (contactContainer.type & (ContactType.Bottom | ContactType.Floor)) {
                this.velocityDamage();
            }

            if (contactContainer.type === ContactType.Bottom) {
                if (this.state !== GameObjectState.Docked)
                    cc.AudioEngine.getInstance().playEffect("sfx_dock");
                this.state = GameObjectState.Docked;
            }

            else if (contactContainer.type === ContactType.Surface) {
                this._isFloating = true;
            }

        } else if (contactType === ContactType.Hatch) {

            if (gameObject && gameObject.type === GameObjectType.Boat) {
                var damage = this.velocityDamage();
                if (damage > 0) {
                    gameObject.life -= damage;
                    gameObject.damage();
                }
                if (gameObject.life < 0)
                    gameObject.life = 0;
                else if (this.life > 0)
                    this._boat = gameObject;
            }

        }

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    endCollision: function(contactType, contactContainer) {

        var gameObject = contactContainer.gameObject;

        if (contactType === ContactType.Body) {

            if (gameObject && gameObject.type === GameObjectType.ResourcePile && gameObject === this._nearestResourcePile) {
                this._nearestResourcePile = null;

                var thisX = this.b2body.GetPosition().get_x();
                var contacts = this._contacts[ContactType.Body];

                for (var c in contacts) {
                    var testContactContainer = contacts[c].contactContainer;
                    var testGameObject = testContactContainer.gameObject;

                    if (testGameObject && testGameObject.type === GameObjectType.ResourcePile && testGameObject !== gameObject) {
                        if (!this._nearestResourcePile) {
                            this._nearestResourcePile = testGameObject;
                        } else {
                            var distanceToCurrent = Math.abs(this._nearestResourcePile.b2body.GetPosition().get_x() - thisX);
                            var distanceToTest = Math.abs(testGameObject.b2body.GetPosition().get_x() - thisX);
                            if (distanceToTest < distanceToCurrent)
                                this._nearestResourcePile = testGameObject;
                        }
                    }
                }

                return;
            }

            if (contactContainer.type === ContactType.Bottom) {
                this.state = GameObjectState.Standing;
            }

            else if (contactContainer.type === ContactType.Surface) {
                this._isFloating = false;
            }

        } else if (contactType === ContactType.Hatch) {

            if (gameObject === this._boat) {
                this._boat = null;
            }

        }

    },

    velocityDamage: function() {

        var damage = 0;
        var velocity = this.b2body.GetLinearVelocity();
        var velX = Math.abs(velocity.get_x()) - kDamageVelocityThreshold;
        var velY = Math.abs(velocity.get_y()) - kDamageVelocityThreshold;

        if (velX > 0 || velY > 0) {
            damage = (velX > velY ? velX : velY) * kGathererDamageFactor;
            this.damage();
            this.life -= damage;
            if (this.life < 0)
                this.life = 0;
        }

        return damage;
    },

    damage: function() {

        cc.AudioEngine.getInstance().playEffect("sfx_hit_gatherer");
        this._shakeTime = kDamageShakeTime;
    }

});