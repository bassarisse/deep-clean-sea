/**
 * @class
 * @extends DialogueBaseLayer
 */
var StagePrelude = DialogueBaseLayer.extend(/** @lends StagePrelude# */{

    _level: 0,

    init: function(level) {

        this._level = level;

        var tipMessage = "";

        var messages = [
            "Your job is to clean the bottom of the sea as much as possible.",
            "You'll find a garbage gatherer attached to your boat.",
            "Using your gatherer, take the trash from the bottom of the sea, and put it aboard your boat.",
            "After that, deliver the trash to one of the recycle companies, on both sides of the screen.",
            "Your boat can also transport crates between the companies. That will provide some resources for them to continue operating.",
            "If a company stops working, you can reactivate by delivering a large amount of trash to it.",
            "You'll work until the fuel of your boat or your gatherer is over.",
            "If you let the trash take over the sea, or if you fail to deliver it to the companies in a timely manner, you're out!",
            "And try not to crash your equipments on the rocks. They cost real money!"
        ];

        this._super(tipMessage, messages);

    },

    finish: function() {

        if (this._level <= kMaxLevel) {
            cc.Director.getInstance().replaceScene(new StageScene(null, this._level));
        } else {
            cc.Director.getInstance().replaceScene(new SplashScreenScene());
        }

    }

});

/**
 * @class
 * @extends cc.Scene
 */
var StagePreludeScene = cc.Scene.extend(/** @lends StagePreludeScene# */{
    _level: 1,

    ctor: function(level) {
        this._super();
        this._level = level;
    },

    onEnter: function () {
        this._super();
        var layer = new StagePrelude();
        layer.init(this._level);
        this.addChild(layer);
    }

});