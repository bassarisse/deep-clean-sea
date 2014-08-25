
var ActionConfirmation = BaseLayer.extend({

    _menu: null,
    _target: null,
    _callback: null,
    _cancelCallback: null,

    onEnter: function() {
        this._super();
        this._menu.setEnabled(true);
    },

    init: function(message, target, callback, cancelCallback) {

        this._super();

        this._target = target;
        this._callback = callback;
        this._cancelCallback = cancelCallback;

        this.addChild(cc.LayerColor.create(gbDarkestColor));

        var winWidth = this._winSize.width;
        var winHeight = this._winSize.height;
        var midWidth = winWidth / 2;

        var menuInfos = [
            {
                text: "Yes",
                callback: function() {
                    this.close();
                    this._callback.call(this._target);
                }
            },
            {
                text: "No",
                callback: function() {
                    this.close();
                    this._cancelCallback.call(this._target);
                }
            }
        ];

        var mainY = 40;
        var mainX = midWidth;
        var menuItems = [];

        for (var i = menuInfos.length - 1; i >= 0; i--) {
            var menuInfo = menuInfos[i];

            var menuItem = BAMenuItemLabel.create(
                cc.LabelBMFont.create(menuInfo.text, res.fnt_MainMini, midWidth, cc.TEXT_ALIGNMENT_CENTER),
                menuInfo.callback,
                this);
            menuItem.setAnchorPoint(0.5, 0);
            menuItem.setPosition(mainX, mainY);

            menuItems.unshift(menuItem);
            mainY += 12;
        }

        var mainMenu = BAMenu.create(menuItems);
        mainMenu.setAnchorPoint(0, 0);
        mainMenu.setPosition(0, 0);
        mainMenu.setEnabled(false);
        mainMenu.setSelectedItem(1);

        this.addChild(mainMenu);

        var mainMessage = cc.LabelBMFont.create(message,
            res.fnt_MainMicro, winWidth, cc.TEXT_ALIGNMENT_CENTER);

        mainMessage.setPosition(cc.p(midWidth, winHeight - 50));
        mainMessage.setAnchorPoint(0.5, 0.5);
        mainMessage.setColor(gbLightestColor);
        this.addChild(mainMessage);

        this._menu = mainMenu;

    },

    close: function() {
        this._menu.setEnabled(false);
        this.removeFromParent(true);
    },

    buttonB: function() {
        this._cancelCallback.call(this._target);
        this.close();
    }

});