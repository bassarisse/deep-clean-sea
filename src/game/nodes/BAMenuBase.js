/**
 * Created by Bruno Assarisse on 05/03/14.
 */
/**
 * @class
 * @extends cc.Menu
 */
var BAMenuBase = cc.Menu.extend(/** @lends BAMenuBase# */{

    /** @type MainButton[] */
    _pressedButtons: null,

    /** @type string */
    moveAudio: null,
    /** @type string */
    selectAudio: null,

    ctor: function() {
        this._super();
        this._pressedButtons = [];
        this.moveAudio = "sfx_cursor_move";
        this.selectAudio = "sfx_cursor_select";
    },

    onEnter: function() {
        this._super();

        this.setInputEnabled(true);

    },

    onExit: function() {
        this._super();

        this.setInputEnabled(false);

    },

    setEnabled: function(enabled) {
        this._super(enabled);

        var itemChildren = this._children, locItemChild;
        if (itemChildren && itemChildren.length > 0) {
            for (var i = 0; i < itemChildren.length; i++) {
                locItemChild = itemChildren[i];
                if (locItemChild.setOpacity)
                    locItemChild.setOpacity(enabled ? 255 : 0);
            }
        }

    },

    /**
     *
     * @param {boolean} enabled
     */
    setInputEnabled: function(enabled) {

        this._pressedButtons = [];

        if (kHasTouch) {
            this.setTouchEnabled(enabled);
            this.setMouseEnabled(!enabled);
            //this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
        } else {
            this.setMouseEnabled(enabled);
            this.setTouchEnabled(!enabled);
        }

        this.setKeyboardEnabled(enabled);

    },

    /**
     * Returns whether a button should be triggered
     * @param {number} index The player index
     * @param {MainButton} button
     * @param {boolean} pressed
     * @returns {boolean}
     */
    _shouldTriggerButton: function(index, button, pressed) {

        var pressedButtons = this._pressedButtons[index];
        if (!pressedButtons) {
            pressedButtons = [];
            this._pressedButtons[index] = pressedButtons;
        }

        var buttonIndex = pressedButtons.indexOf(button);

        if (pressed) {

            if (buttonIndex === -1) {
                pressedButtons.push(button);
                return true;
            }

        } else {

            if (buttonIndex !== -1) {
                pressedButtons.splice(buttonIndex, 1);
                return true;
            }

        }

        return false;
    },

    _selectItemFromEvent: function(event, emitSound) {

        var currentItem = this._itemForTouch(event);
        if (currentItem !== this._selectedItem) {
            if (this._selectedItem)
                this._selectedItem.unselected();
            this._selectedItem = currentItem;
            if (this._selectedItem) {
                if (emitSound && this.moveAudio !== null)
                    cc.AudioEngine.getInstance().playEffect(this.moveAudio);
                this._selectedItem.selected();
            }
        }
    },

    /**
     * MOUSE
     */

    onMouseMoved: function(event) {

        this._selectItemFromEvent(event, this._enabled);

    },

    onMouseDragged: function(event) {
        this._selectItemFromEvent(event, this._enabled);
    },

    onMouseUp: function(event) {

        if (!this._shouldTriggerButton(0, MainButton.MouseLeft, false))
            return;

        this._selectItemFromEvent(event, false);
        if (this._selectedItem) {
            if (this.selectAudio !== null)
                cc.AudioEngine.getInstance().playEffect(this.selectAudio);
            //this._selectedItem.unselected();
            this._selectedItem.activate();
            //this._selectedItem = null;
        }
    },

    onMouseDown: function(event) {

        if (!this._enabled)
            return;

        if (!this._shouldTriggerButton(0, MainButton.MouseLeft, true))
            return;

        this._selectItemFromEvent(event, false);

    },

    /**
     * TOUCH
     */

    onTouchBegan:function (touch, e) {

        var oldSelectedItem = this._selectedItem;

        var returnValue = this._super(touch, e);

        if (oldSelectedItem && this._selectedItem !== oldSelectedItem)
            oldSelectedItem.unselected();

        return returnValue;
    },

    onTouchEnded:function (touch, e) {

        var isSelected = this._selectedItem && this._selectedItem.isSelected();

        this._super(touch, e);

        if (isSelected && this._selectedItem && !this._selectedItem.isSelected())
            cc.AudioEngine.getInstance().playEffect(this.selectAudio);

    }

});

/**
 * create a new menu
 * @param {...cc.MenuItem|null} menuItems
 * @return {BAMenuBase}
 * @example
 * // Example
 * //there is no limit on how many menu item you can pass in
 * var myMenu = BAMenuBase.create(menuitem1, menuitem2, menuitem3);
 */
BAMenuBase.create = function (menuItems) {
    if((arguments.length > 0) && (arguments[arguments.length-1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var ret = new BAMenuBase();

    if (arguments.length == 0) {
        ret.initWithItems(null, null);
    } else if (arguments.length == 1) {
        if (arguments[0] instanceof Array) {
            ret.initWithArray(arguments[0]);
            return ret;
        }
    }
    ret.initWithItems(arguments);
    return ret;
};
