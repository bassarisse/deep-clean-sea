/**
 * Created by Bruno Assarisse on 05/03/14.
 */
/**
 *  Any cc.Node that supports the cc.LabelProtocol protocol can be added.<br/>
 * Supported nodes:<br/>
 * - cc.BitmapFontAtlas<br/>
 * - cc.LabelAtlas<br/>
 * - cc.LabelTTF<br/>
 * @class
 * @extends cc.MenuItem
 */
var BAMenuItemLabel = cc.MenuItem.extend(/** @lends BAMenuItemLabel# */{

    /** @type {cc.Color3B} */
    _disabledColor: null,
    /** @type {cc.Color3B} */
    _selectedColor: null,
    /** @type {cc.Color3B} */
    _normalColor: null,
    _label: null,

    ctor: function () {
        cc.MenuItem.prototype.ctor.call(this);
        this._disabledColor = null;
        this._selectedColor = null;
        this._normalColor = null;
        this._label = null;
    },

    /**
     * @return {cc.Color3B}
     */
    getDisabledColor:function () {
        return this._disabledColor;
    },

    /**
     * @param {cc.Color3B} color
     */
    setDisabledColor:function (color) {
        this._disabledColor = color;
    },

    /**
     * @return {cc.Color3B}
     */
    getSelectedColor:function () {
        return this._selectedColor;
    },

    /**
     * @param {cc.Color3B} color
     */
    setSelectColor:function (color) {
        this._selectedColor = color;
    },

    /**
     * @return {cc.Color3B}
     */
    getNormalColor:function () {
        return this._normalColor;
    },

    /**
     * @param {cc.Color3B} color
     */
    setNormalColor:function (color) {
        this._normalColor = color;
    },

    /**
     * return label of MenuItemLabel
     * @return {cc.Node}
     */
    getLabel:function () {
        return this._label;
    },

    /**
     * @param {cc.Node} label
     */
    setLabel:function (label) {
        if (label) {
            this.addChild(label);
            label.setAnchorPoint(0, 0);
            this.setContentSize(label.getContentSize());
        }

        if (this._label) {
            this.removeChild(this._label, true);
        }

        this._label = label;
    },

    /**
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        if (this._isEnabled != enabled) {
            var locLabel = this._label;
            if (!enabled) {
                locLabel.setColor(this._disabledColor);
            } else {
                locLabel.setColor(this._normalColor);
            }
        }
        cc.MenuItem.prototype.setEnabled.call(this, enabled);
    },

    /**
     * @param {Number} opacity from 0-255
     */
    setOpacity:function (opacity) {
        this._label.setOpacity(opacity);
    },

    /**
     * @return {Number}
     */
    getOpacity:function () {
        return this._label.getOpacity();
    },

    /**
     * @param {cc.Color3B} color
     */
    setColor:function (color) {
        this._label.setColor(color);
    },

    /**
     * @return {cc.Color3B}
     */
    getColor:function () {
        return this._label.getColor();
    },

    /**
     * @param {cc.Node} label
     * @param {function|String} selector
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithLabel:function (label, selector, target) {
        this.initWithCallback(selector, target);
        this._disabledColor = gbDarkestColor3;
        this._selectedColor = gbLightestColor3;
        this._normalColor = gbDarkColor3;
        this.setLabel(label);
        this.setColor(this._normalColor);

        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);

        return true;
    },

    /**
     * @param {String} label
     */
    setString:function (label) {
        this._label.setString(label);
        this.setContentSize(this._label.getContentSize());
    },

    /**
     * activate the menu item
     */
    /*activate:function () {
        if (this._isEnabled) {
            this.stopAllActions();
            this.setColor(this._normalColor);
            cc.MenuItem.prototype.activate.call(this);
        }
    },
    */

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        if (this._isEnabled) {
            cc.MenuItem.prototype.selected.call(this);

            var action = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (!action) {
                action = cc.RepeatForever.create(cc.Sequence.create([
                    cc.TintTo.create(0, this._selectedColor.r, this._selectedColor.g, this._selectedColor.b),
                    cc.DelayTime.create(0.1),
                    cc.TintTo.create(0, this._normalColor.r, this._normalColor.g, this._normalColor.b),
                    cc.DelayTime.create(0.1)
                ]));
                action.setTag(cc.ZOOM_ACTION_TAG);
                this.runAction(action);
            }

        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        if (this._isEnabled) {
            cc.MenuItem.prototype.unselected.call(this);
            this.stopAllActions();
            this.setColor(this._normalColor);
        }
    }
});

/**
 * @param {cc.Node} label
 * @param {function|String|Null} [selector=]
 * @param {cc.Node|Null} [target=]
 * @return {BAMenuItemLabel}
 */
BAMenuItemLabel.create = function (label, selector, target) {
    var ret = new BAMenuItemLabel();
    ret.initWithLabel(label, selector, target);
    return ret;
};

/**
 * BAMenuItemSprite accepts CCNode<CCRGBAProtocol> objects as items.<br/>
 * The images has 3 different states:<br/>
 *   - unselected image<br/>
 *   - selected image<br/>
 *   - disabled image<br/>
 * @class
 * @extends cc.MenuItemSprite
 */
var BAMenuItemSprite = cc.MenuItemSprite.extend(/** @lends BAMenuItemSprite# */{

    /**
     * menu item is selected (runs callback)
     */
    selected:function () {
        if (this._isEnabled) {
            cc.MenuItem.prototype.selected.call(this);

            var locSelImage = this._selectedImage;

            var action = locSelImage.getActionByTag(cc.ZOOM_ACTION_TAG);
            if (!action) {
                action = cc.RepeatForever.create(cc.Sequence.create([
                    cc.Show.create(),
                    cc.DelayTime.create(0.1),
                    cc.Hide.create(),
                    cc.DelayTime.create(0.1)
                ]));
                action.setTag(cc.ZOOM_ACTION_TAG);
                locSelImage.runAction(action);
            }

        }
    },

    /**
     * menu item goes back to unselected state
     */
    unselected:function () {
        if (this._isEnabled) {
            cc.MenuItem.prototype.unselected.call(this);
            var locSelImage = this._selectedImage;
            locSelImage.stopAllActions();
            locSelImage.setVisible(false);
        }
    },

    _updateImagesVisibility:function () {
        var locNormalImage = this._normalImage, locSelImage = this._selectedImage, locDisImage = this._disabledImage;

        if (locSelImage) {
            locSelImage.stopAllActions();
            locSelImage.setVisible(false);
        }

        if (this._isEnabled) {
            if (locNormalImage)
                locNormalImage.setVisible(true);
            if (locDisImage)
                locDisImage.setVisible(false);
        } else {
            if (locDisImage) {
                locDisImage.setVisible(true);
                if (locNormalImage)
                    locNormalImage.setVisible(false);
            } else {
                if (locNormalImage)
                    locNormalImage.setVisible(true);
            }
        }
    }

});

/**
 * create a menu item from sprite
 * @param {Image} normalSprite normal state image
 * @param {Image|Null} selectedSprite selected state image
 * @param {Image|cc.Node|Null} three disabled state image OR target node
 * @param {String|function|cc.Node|Null} four callback function name in string or actual function, OR target Node
 * @param {String|function|Null} five callback function name in string or actual function
 * @return {BAMenuItemSprite}
 * @example
 * // Example
 * var item = BAMenuItemSprite.create(normalImage)//create a menu item from a sprite with no functionality
 *
 * var item = BAMenuItemSprite.create(normalImage, selectedImage)//create a menu Item, nothing will happen when clicked
 *
 * var item = BAMenuItemSprite.create(normalImage, SelectedImage, disabledImage)//same above, but with disabled state image
 *
 * var item = BAMenuItemSprite.create(normalImage, SelectedImage, 'callback', targetNode)//create a menu item, when clicked runs targetNode.callback()
 *
 * var item = BAMenuItemSprite.create(normalImage, SelectedImage, disabledImage, targetNode.callback, targetNode)
 * //same as above, but with disabled image, and passing in callback function
 */
BAMenuItemSprite.create = function (normalSprite, selectedSprite, three, four, five) {
    var len = arguments.length;
    normalSprite = arguments[0];
    selectedSprite = arguments[1];
    var disabledImage, target, callback;
    var ret = new BAMenuItemSprite();
    //when you send 4 arguments, five is undefined
    if (len == 5) {
        disabledImage = arguments[2];
        callback = arguments[3];
        target = arguments[4];
    } else if (len == 4 && typeof arguments[3] === "function") {
        disabledImage = arguments[2];
        callback = arguments[3];
    } else if (len == 4 && typeof arguments[2] === "function") {
        target = arguments[3];
        callback = arguments[2];
    } else if (len <= 2) {
        disabledImage = arguments[2];
    }
    ret.initWithNormalSprite(normalSprite, selectedSprite, disabledImage,  callback, target);
    return ret;
};