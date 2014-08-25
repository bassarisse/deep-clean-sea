
/**
 * @class
 * @extends Actor
 */
var Enemy = Actor.extend(/** @lends Enemy# */{

    fixedHorizontalMovingState: null,
    fixedVerticalMovingState: null,

    _addFixtures: function() {

        /*
        var width = this.node.getContentSize().width * 0.2;
        var height = this.node.getContentSize().height * 0.35;

         this._addRectangularFixture(width, height);
        */

        var properties = this._initProperties;
        var width = properties["width"];
        var height = properties["height"];
        this._addRectangularFixture(width, height);
    
    },
    
    init: function(b2world, properties) {

        this.node = cc.Sprite.createWithSpriteFrameName("fish1");
        this.type = GameObjectType.Enemy;
        this._isSensor = true;

        this._super(b2world, properties);

        this.b2body.SetGravityScale(0);
        this._walkForce = kEnemyWalkForce;
        this.fixedHorizontalMovingState = MovingState.Right;
        this.fixedVerticalMovingState = MovingState.Stopped;

    },

    _updateAnimation: function() {

        var walkAction = this.node.getActionByTag(kWalkActionTag);
        var speed = this._walkForceModifier * 0.8;

        if (walkAction) {

            walkAction.setSpeed(speed);

        } else {

            var anim = this._loadAnimation(["fish1", "fish2", "fish3","fish2"],
                0,
                0.3);

            walkAction = cc.Speed.create(cc.RepeatForever.create(cc.Animate.create(anim)), speed);
            walkAction.setTag(kWalkActionTag);

            this.stopAllActions();
            this.node.runAction(walkAction);

        }

    },

    _setFilterOptions: function() {

        this._filterCategory = EntityFilterCategory.Enemy;
        this._filterMask = 0xffff & ~(EntityFilterCategory.Enemy|EntityFilterCategory.Static);

    },

    update: function(delta) {

        this._super(delta);

    },

    updateNodePosition: function() {
        var position = this.b2body.GetPosition();
        this.node.setPosition(Math.round(position.get_x() * PTM_RATIO), Math.round(position.get_y() * PTM_RATIO) - 1);
    },

    updateMovingStates: function() {
        if (this.fixedHorizontalMovingState !== null && this.fixedVerticalMovingState !== null) {
            this.horizontalMovingState = this.fixedHorizontalMovingState;
            this.verticalMovingState = this.fixedVerticalMovingState;
        } else {
            this._super();
        }
    },

    handleCollisionWithGameObject: function (gameObject) {

        if (gameObject.type === GameObjectType.Gatherer) {
            gameObject.takeHit(this);
        }

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    startCollision: function(contactType, contactContainer) {

        if (contactContainer.type === ContactType.EnemyLimit && !this.isDead()) {
            createVec(0, 0, function(vec) {
                this.b2body.SetLinearVelocity(vec);
            }, this);
            this.die();
        }

    }

});