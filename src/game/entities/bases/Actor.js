
/**
 * @class
 * @extends GameObject
 */
var Actor = GameObject.extend(/** @lends Actor# */{

    // public properties

    life: 0,
    fuel: 0,
    resource: 0,

    horizontalMovingState: MovingState.Stopped,
    horizontalMovingStates: null,
    verticalMovingState: MovingState.Stopped,
    verticalMovingStates: null,
    _changeGravity: false,

    // "private" properties

    _walkForce: 0,
    _walkForceModifier: 0,

    _shakeTime: 0,
    _damageTime: 0,
    _invulnerableTime: 0,

    // "private" methods

    stopAllActions: function() {
    },

    _updateAnimation: function() {

    },

    // public methods

    init: function(b2world, properties) {

        this._setFilterOptions();

        this.horizontalMovingStates = [MovingState.Stopped];
        this.verticalMovingStates = [MovingState.Stopped];
        this._walkForce = kWalkForce;
        this._walkForceModifier = 1;

        this._super(b2world, properties);

    },

    _setFilterOptions: function() {

        this._filterCategory = EntityFilterCategory.Actor;
        this._filterMask = 0xffff & ~EntityFilterCategory.Actor;

    },

    setWalkForceModifier: function(walkForceModifier) {
        this._walkForceModifier = walkForceModifier;
    },

    update: function(delta) {

        this._super(delta);

        this._shakeTime -= delta;
        this._invulnerableTime -= delta;

        if (this._damageTime > 0) {
            this._damageTime -= delta;
            if (this._damageTime < 0)
                this.state = GameObjectState.Standing;
        }

        this.updateMovingStates();

        var stopVelocityMultiplier = kStopVelocityMultiplier;
        if (this._damageTime > 0)
            stopVelocityMultiplier = kStopVelocityMultiplierWhenDamaged;

        var maxForce = this._walkForce * this._walkForceModifier;
        var addFactor = kMoveForceAddFactor;
        var velocity = this.b2body.GetLinearVelocity();
        var desiredXVel = 0;

        switch (this.horizontalMovingState)
        {
            case MovingState.Left:
                desiredXVel = Math.max(velocity.get_x() - (maxForce * addFactor), -maxForce);
                break;
            case MovingState.Stopped:
                desiredXVel = velocity.get_x() * stopVelocityMultiplier;
                break;
            case MovingState.Right:
                desiredXVel = Math.min(velocity.get_x() + (maxForce * addFactor), maxForce);
                break;
        }

        if (this._changeGravity) {
            switch (this.verticalMovingState) {
                case MovingState.Up:
                    this.b2body.SetGravityScale(kFloatUpGravity);
                    break;
                case MovingState.Stopped:
                    this.b2body.SetGravityScale(this.state === GameObjectState.Docked ? 0 : kFloatBaseGravity);
                    break;
                case MovingState.Down:
                    this.b2body.SetGravityScale(kFloatDownGravity);
                    break;
            }
        }

        var xVelChange = desiredXVel - velocity.get_x();
        var xImpulse = this.b2body.GetMass() * xVelChange;

        createVec(xImpulse, 0, function(vec) {
            this.b2body.ApplyLinearImpulse( vec, this.b2body.GetWorldCenter() );
        }, this);

        this._updateAnimation();

    },

    updateMovingStates: function() {

        if (this.horizontalMovingStates.length > 0)
            this.horizontalMovingState = this.horizontalMovingStates[this.horizontalMovingStates.length - 1];
        if (this.verticalMovingStates.length > 0)
            this.verticalMovingState = this.verticalMovingStates[this.verticalMovingStates.length - 1];

        if (this.state & (GameObjectState.Dying|GameObjectState.Dead|GameObjectState.TakingDamage)) {
            this.horizontalMovingState = MovingState.Stopped;
            this.verticalMovingState = MovingState.Stopped;
        }

    },

    /**
     *
     * @param {Actor} attacker
     * @param {number} [factor]
     */
    takeHit: function(attacker, factor) {

        if (this._invulnerableTime > 0 || this._damageTime > 0 || this.isDead())
            return;

        if (!factor)
            factor = 1;

        cc.AudioEngine.getInstance().playEffect("sfx_hit_gatherer");

        this.state = GameObjectState.TakingDamage;
        this._damageTime = kDamageTime;
        this._shakeTime = kDamageShakeTime;

        this.life -= kDamageQuantity;

        if (this.life <= 0) {
            this.life = 0;
            this.die();
        }

        this.bounceNode(attacker, factor);

    },

    /**
     *
     * @param {Actor} attacker
     * @param {number} factor
     */
    bounceNode: function(attacker, factor) {

        var bodyP1 = attacker.b2body.GetPosition();
        var bodyP2 = this.b2body.GetPosition();

        var attackerPos = cc.p(bodyP1.get_x(), bodyP1.get_y());
        var thisPos = cc.p(bodyP2.get_x(), bodyP2.get_y());

        var angle = 180;
        angle += Math.atan2(attackerPos.y - thisPos.y, attackerPos.x - thisPos.x) * 180 / Math.PI;
        angle *= Math.PI / 180;

        var x = kDamageImpulse * Math.cos(angle);
        var y = kDamageImpulse * Math.sin(angle);

        createVec(0, 0, function(vec) {
            this.b2body.SetLinearVelocity(vec);
        }, this);

        createVec(x, y, function(vec) {
            this.b2body.ApplyLinearImpulse(vec, this.b2body.GetWorldCenter());
        }, this);

    },

    reset: function() {
        this._invulnerableTime = 0;
        this._damageTime = 0;
        this.state = GameObjectState.Standing;
    }

});