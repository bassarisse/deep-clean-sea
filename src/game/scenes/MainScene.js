/**
 * @class
 * @extends cc.Scene
 */
var MainScene = cc.Scene.extend(/** @lends MainScene# */{

    init: function() {
        this._super();
        this.addChild(cc.LayerColor.create(gbDarkestColor));
    },

    onEnter:function () {
        this._super();
        cc.Director.getInstance().replaceScene(new StartScene());
    }
});