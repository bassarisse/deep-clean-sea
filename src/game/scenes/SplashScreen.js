/**
 * @class
 * @extends BaseLayer
 */
var SplashScreen = BaseLayer.extend(/** @lends SplashScreen# */{

    init: function() {
        this._super();

        cc.AudioEngine.getInstance().stopMusic();

        cc.SpriteFrameCache.getInstance().addSpriteFrames(res.plist_Logos);

        var gbJamLogo = cc.Sprite.createWithSpriteFrameName("gbjam_logo");
        gbJamLogo.setPosition(80, 216);

        var baLogo = cc.Sprite.createWithSpriteFrameName("ba_logo");
        baLogo.setPosition(80, 216);

        var bg = cc.LayerColor.create(gbDarkestColor);

        this.addChild(bg);
        this.addChild(gbJamLogo);
        this.addChild(baLogo);

        var gbJamLogoAction = cc.Sequence.create([
            cc.DelayTime.create(0.2),
            cc.MoveBy.create(0.25, cc.p(0, -kBaseScreenHeight)),
            cc.DelayTime.create(2),
            cc.MoveBy.create(0.25, cc.p(0, -kBaseScreenHeight))
        ]);

        var baLogoAction = cc.Sequence.create([
            cc.DelayTime.create(2.7),
            cc.MoveBy.create(0.25, cc.p(0, -kBaseScreenHeight)),
            cc.DelayTime.create(2),
            cc.MoveBy.create(0.25, cc.p(0, -kBaseScreenHeight)),
            cc.DelayTime.create(0.2),
            cc.CallFunc.create(function() {
                cc.Director.getInstance().replaceScene(new TitleScreenScene());
            })
        ]);

        gbJamLogo.runAction(gbJamLogoAction);
        baLogo.runAction(baLogoAction);

    }

});

/**
 * @class
 * @extends cc.Scene
 */
var SplashScreenScene = cc.Scene.extend(/** @lends SplashScreenScene# */{

    onEnter: function () {
        this._super();
        var layer = new SplashScreen();
        layer.init();
        this.addChild(layer);
    }

});