/**
 * Created by bassarisse on 20/08/14.
 */


cc.PixelMoveBy = cc.ActionInterval.extend(/** @lends cc.MoveBy# */{
    _positionDelta:null,
    _lastTime: 0,
    _addX: 0,
    _addY: 0,

    ctor:function () {
        cc.ActionInterval.prototype.ctor.call(this);

        this._positionDelta = cc.p(0, 0);
    },

    /**
     * @param {Number} duration duration in seconds
     * @param {cc.Point} position
     * @return {Boolean}
     */
    initWithDuration:function (duration, position) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._positionDelta.x = position.x;
            this._positionDelta.y = position.y;
            return true;
        }
        return false;
    },

    /**
     * returns a new clone of the action
     * @returns {cc.PixelMoveBy}
     */
    clone:function () {
        var action = new cc.PixelMoveBy();
        action.initWithDuration(this._duration, this._positionDelta)
        return action;
    },

    /**
     * @param {Number} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._lastTime = 0;
        this._addX = 0;
        this._addY = 0;
    },

    /**
     * @param {Number} time time in seconds
     */
    update:function (time) {
        if (this._target) {

            var delta = time - this._lastTime;
            var x = this._positionDelta.x * delta;
            var y = this._positionDelta.y * delta;
            this._lastTime = time;

            this._addX += x;
            this._addY += y;

            var targetX = this._target.getPositionX();
            var targetY = this._target.getPositionY();

            if (this._positionDelta.x > 0) {
                while (this._addX > 1) {
                    targetX += 1;
                    this._addX -= 1;
                }
            } else if (this._positionDelta.x < 0) {
                while (this._addX < -1) {
                    targetX -= 1;
                    this._addX += 1;
                }
            }

            if (this._positionDelta.y > 0) {
                while (this._addY > 1) {
                    targetY += 1;
                    this._addY -= 1;
                }
            } else if (this._positionDelta.y < 0) {
                while (this._addY < -1) {
                    targetY -= 1;
                    this._addY += 1;
                }
            }

            this._target.setPosition(Math.round(targetX), Math.round(targetY));
        }
    },

    reverse:function () {
        return cc.PixelMoveBy.create(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
    }
});

cc.PixelMoveBy.create = function (duration, deltaPosition) {
    var moveBy = new cc.PixelMoveBy();
    moveBy.initWithDuration(duration, deltaPosition);
    return moveBy;
};