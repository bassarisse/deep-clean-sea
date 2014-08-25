/**
 * Created by bassarisse on 21/03/14.
 */

/**
 * Used to display the loading screen
 * @class
 * @extends cc.Scene
 */
var BALoaderScene = cc.Scene.extend(/** @lends BALoaderScene# */{

    _resources: null,
    _selector: null,
    _target: null,

    _progressLayer: null,

    init:function(){
        cc.Scene.prototype.init.call(this);

        var self = this;
        var winSize = cc.Director.getInstance().getWinSize();
        var logoPosition = cc.p(winSize.width / 2, winSize.height / 2 - 1);

        var progressLayer = cc.LayerColor.create(gbLightColor, 1, 1);
        progressLayer.setPosition(logoPosition.x - 50, logoPosition.y - 3);
        progressLayer.setVisible(false);

        var progressBg = cc.LayerColor.create(gbDarkColor, 102, 3);
        progressBg.setPosition(cc.pAdd(progressLayer.getPosition(), cc.p(-1, -1)));

        self._progressLayer = progressLayer;

        self.addChild(cc.LayerColor.create(gbDarkestColor));
        self.addChild(progressBg);
        self.addChild(progressLayer);

        var logoTexture = new Image();
        logoTexture.addEventListener("load", function () {
            self._setupLogo(logoPosition, logoTexture);
            this.removeEventListener('load', arguments.callee, false);
        });
        logoTexture.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAFCAYAAADVELX8AAAEJGlDQ1BJQ0MgUHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbAtElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVuG7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9FwpwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohbyS1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNOFi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL42K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQadBtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8OokmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq94uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAIFJREFUKBWdkVEKgDAMQzfw/lfWZfAghK1s9ie2SZOq/R3VR7UozWPUpDud41np0ShHuso/b5n9yhwzX0AHwtGDOa963+EZZK/CpyJ33E3AzkNzvrT/AfSeseKl+3W8m3kIwTfIC+QOGZX/PD4FJ4sZpt59Vh7wcHioh0sfNOLRgR+PVI/OTAAHGQAAAABJRU5ErkJggg==";

    },

    _setupLogo: function (centerPos, logoTexture) {

        var texture2d = new cc.Texture2D();
        texture2d.initWithElement(logoTexture);
        texture2d.handleLoadedTexture();

        var logo = cc.Sprite.createWithTexture(texture2d);
        logo.setPosition(centerPos);
        logo.setAnchorPoint(0.5, 0);
        logo.setColor(gbLightColor3);

        logo.runAction(cc.RepeatForever.create(cc.Blink.create(1, 3)));

        this.addChild(logo);
    },

    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this.schedule(this._startLoading, 0.1);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} selector
     * @param {Object} target
     */
    initWithResources: function (resources, selector, target) {
        this._resources = resources;
        this._selector = selector;
        this._target = target;
    },

    _startLoading: function () {
        this.unschedule(this._startLoading);
        cc.Loader.preload(this._resources, this._complete, this);
        this.schedule(this._updatePercent);
    },

    _complete: function() {

        this.runAction(cc.Sequence.create([
            cc.DelayTime.create(0.05),
            cc.CallFunc.create(function() {

                var target = this._target, selector = this._selector;

                if (target && (typeof selector === "string")) {
                    target[selector](this);
                } else if (target && (typeof selector === "function")) {
                    selector.call(target, this);
                } else {
                    selector(this);
                }

            }, this)
        ]));

    },

    _updatePercent: function () {
        var percent = Math.round(cc.Loader.getInstance().getPercentage());

        this._progressLayer.setVisible(percent > 0);
        this._progressLayer.setContentSize(percent, 1);

        if (percent >= 100)
            this.unschedule(this._updatePercent);
    }
});

/**
 * Preload multi scene resources.
 * @param {Array} resources
 * @param {Function|String} selector
 * @param {Object} target
 * @return {BALoaderScene}
 * @example
 */
BALoaderScene.preload = function (resources, selector, target) {
    if (!this._instance) {
        this._instance = new BALoaderScene();
        this._instance.init();
    }

    this._instance.initWithResources(resources, selector, target);

    var director = cc.Director.getInstance();
    if (director.getRunningScene()) {
        director.replaceScene(this._instance);
    } else {
        director.runWithScene(this._instance);
    }

    return this._instance;
};
