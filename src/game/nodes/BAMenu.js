/**
 * Created by Bruno Assarisse on 05/03/14.
 */
/**
 * @class
 * @extends BAMenuBase
 */
var BAMenu = BAMenuBase.extend(/** @lends BAMenu# */{

    /** @type boolean */
    useStartButton: true,
    /** @type number */
    _lastItemIndex: 0,
    /** @type {boolean} */
    _vertical: true,

    /** @type boolean */
    _allowKeyUp: true,
    /** @type boolean */
    _allowKeyDown: false,
    /** @type boolean */
    _allowButtonRepeat: false,
    /** @type number */
    _axisThreshold: kAxisThreshold,
    /** @type boolean */
    _axisUp: false,
    /** @type boolean */
    _axisDown: false,
    /** @type boolean */
    _axisLeft: false,
    /** @type boolean */
    _axisRight: false,
    /** @type function */
    _gamePadButtonDownFunction: null,
    /** @type function */
    _gamePadButtonUpFunction: null,
    /** @type function */
    _gamePadAxisChangedFunction: null,

    /**
     * initializes a BAMenu with a Array of cc.MenuItem objects
     */
    initWithArray:function (arrayOfItems) {
        if (this._super(arrayOfItems)) {

            this.setSelectedItem(0);
            this._vertical = true;

            return true;
        }
        return false;
    },

    /**
     *
     * @param {boolean} vertical
     */
    setVertical: function (vertical) {
        this._vertical = vertical;
    },

    alignItemsVerticallyWithPadding: function(padding) {
        this._super(padding);
        this._vertical = true;
    },

    alignItemsHorizontallyWithPadding: function(padding) {
        this._super(padding);
        this._vertical = false;
    },

    _itemForTouch:function (touch) {
        var touchLocation = touch.getLocation();
        var itemChildren = this._children, locItemChild;
        if (itemChildren && itemChildren.length > 0) {
            for (var i = 0; i < itemChildren.length; i++) {
                locItemChild = itemChildren[i];
                if (locItemChild.isVisible() && locItemChild.isEnabled()) {
                    var local = locItemChild.convertToNodeSpace(touchLocation);
                    var r = locItemChild.rect();
                    r.x = 0;
                    r.y = 0;
                    if (cc.rectContainsPoint(r, local)) {
                        this._lastItemIndex = i;
                        return locItemChild;
                    }
                }
            }
        }
        return null;
    },

    setSelectedItem: function(index, emitSound) {
        var itemChildren = this._children;
        if (itemChildren && index < itemChildren.length) {
            var locItemChild = itemChildren[index];
            if (locItemChild.isVisible() && locItemChild.isEnabled()) {
                this._lastItemIndex = index;
                if (this._selectedItem !== locItemChild) {
                    if (this._selectedItem) {
                        this._selectedItem.unselected();
                    }
                    this._selectedItem = locItemChild;
                }
                if (emitSound && this.moveAudio !== null)
                    cc.AudioEngine.getInstance().playEffect(this.moveAudio);
                locItemChild.selected();
            }
        }
    },

    changeSelectedItem: function(indexChange, emitSound) {

        var noItemSelected = !this._selectedItem;

        if (!noItemSelected && indexChange === 0)
            return;

        var itemChildren = this._children, itemChildrenLength = itemChildren.length, locItemChild, newItemChild;
        if (itemChildren && itemChildrenLength > 0) {
            for (var i = 0; i < itemChildrenLength; i++) {
                locItemChild = itemChildren[i];

                if (noItemSelected && i === indexChange) {
                    if (emitSound && this.moveAudio !== null)
                        cc.AudioEngine.getInstance().playEffect(this.moveAudio);
                    this._lastItemIndex = i;
                    this._selectedItem = locItemChild;
                    locItemChild.selected();
                    break;
                }

                if (!noItemSelected && locItemChild === this._selectedItem) {
                    var newIndex = i + indexChange;
                    while (newIndex >= itemChildrenLength) {
                        newIndex -= itemChildrenLength;
                    }
                    while (newIndex < 0) {
                        newIndex += itemChildrenLength;
                    }
                    newItemChild = itemChildren[newIndex];
                    if (newItemChild.isVisible() && newItemChild.isEnabled() && (!newItemChild.isSelected() || this._selectedItem !== newItemChild)) {
                        if (emitSound && this.moveAudio !== null)
                            cc.AudioEngine.getInstance().playEffect(this.moveAudio);
                        this._lastItemIndex = newIndex;
                        this._selectedItem.unselected();
                        this._selectedItem = newItemChild;
                        newItemChild.selected();
                    }
                    break;
                }

            }
        }

    },

    /**
     *
     * @param {boolean} enabled
     */
    setInputEnabled: function(enabled) {

        this._super(enabled);

        if (enabled)
            this.enableGamePad();
        else
            this.disableGamePad();

    },

    /**
     *
     * @param {number} index The player index
     * @param {MainButton} button
     * @param {boolean} pressed
     * @private
     */
    _triggerButton: function(index, button, pressed) {

        var shouldTrigger = this._shouldTriggerButton(index, button, pressed);

        if ((pressed && !this._allowKeyDown) || (!pressed && !this._allowKeyUp))
            return;

        if (shouldTrigger || this._allowButtonRepeat) {
            var isRepeat = !shouldTrigger;
            switch (button) {
                case MainButton.Up:
                    this.buttonUp(index, pressed, isRepeat); break;
                case MainButton.Down:
                    this.buttonDown(index, pressed, isRepeat); break;
                case MainButton.Left:
                    this.buttonLeft(index, pressed, isRepeat); break;
                case MainButton.Right:
                    this.buttonRight(index, pressed, isRepeat); break;
                case MainButton.A:
                    this.buttonA(index, pressed, isRepeat); break;
                case MainButton.B:
                    this.buttonB(index, pressed, isRepeat); break;
                case MainButton.X:
                    this.buttonX(index, pressed, isRepeat); break;
                case MainButton.Y:
                    this.buttonY(index, pressed, isRepeat); break;
                case MainButton.Start:
                    this.buttonStart(index, pressed, isRepeat); break;
                case MainButton.Select:
                    this.buttonSelect(index, pressed, isRepeat); break;
            }
        }

    },

    /**
     * GAMEPAD
     */

    enableGamePad: function() {

        var self = this;

        this._gamePadButtonDownFunction = function(e) { self.onGamePadKeyDown(e); };
        this._gamePadButtonUpFunction = function(e) { self.onGamePadKeyUp(e); };
        this._gamePadAxisChangedFunction = function(e) { self.handleGamePadAxis(e); };

        gamePad.bind(Gamepad.Event.BUTTON_DOWN, this._gamePadButtonDownFunction);
        gamePad.bind(Gamepad.Event.BUTTON_UP, this._gamePadButtonUpFunction);
        gamePad.bind(Gamepad.Event.AXIS_CHANGED, this._gamePadAxisChangedFunction);

        for (var i = 0; i < gamePad.gamepads.length; i++) {
            var device = gamePad.gamepads[i];

            if (!device || !device.state)
                continue;

            for (var control in device.state) {
                var value = device.state[control];

                if (/stick/i.test(control))
                    this.handleGamePadAxis({
                        gamepad: device,
                        axis: control,
                        value: value
                    });

                else if (value == 1)
                    this.handleGamePadKey({
                        gamepad: device,
                        control: control,
                        value: value
                    }, true);

            }

        }

    },

    disableGamePad: function() {

        gamePad.unbind(Gamepad.Event.BUTTON_DOWN, this._gamePadButtonDownFunction);
        gamePad.unbind(Gamepad.Event.BUTTON_UP, this._gamePadButtonUpFunction);
        gamePad.unbind(Gamepad.Event.AXIS_CHANGED, this._gamePadAxisChangedFunction);

        this._gamePadButtonDownFunction = null;
        this._gamePadButtonUpFunction = null;
        this._gamePadAxisChangedFunction = null;

    },

    handleGamePadAxis: function(e) {

        var axisThreshold = this._axisThreshold;

        if (e.axis == "LEFT_STICK_X") {

            if (e.value >= axisThreshold && !this._axisRight) {
                this._axisRight = true;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Right, true);
            } else if (e.value < axisThreshold && this._axisRight) {
                this._axisRight = false;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Right, false);
            }

            if (e.value <= -axisThreshold && !this._axisLeft) {
                this._axisLeft = true;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Left, true);
            } else if (e.value > -axisThreshold && this._axisLeft) {
                this._axisLeft = false;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Left, false);
            }

        } else if (e.axis == "LEFT_STICK_Y") {

            if (e.value >= axisThreshold && !this._axisDown) {
                this._axisDown = true;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Down, true);
            } else if (e.value < axisThreshold && this._axisDown) {
                this._axisDown = false;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Down, false);
            }

            if (e.value <= -axisThreshold && !this._axisUp) {
                this._axisUp = true;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Up, true);
            } else if (e.value > -axisThreshold && this._axisUp) {
                this._axisUp = false;
                this._triggerButton(e.gamepad.playerIndex, MainButton.Up, false);
            }

        }
    },

    handleGamePadKey: function(e, pressed) {

        switch (e.control) {
            case "DPAD_UP":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Up, pressed); break;
            case "DPAD_DOWN":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Down, pressed); break;
            case "DPAD_LEFT":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Left, pressed); break;
            case "DPAD_RIGHT":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Right, pressed); break;
            case "FACE_1":
                this._triggerButton(e.gamepad.playerIndex, MainButton.A, pressed); break;
            case "FACE_2":
                this._triggerButton(e.gamepad.playerIndex, MainButton.B, pressed); break;
            case "FACE_3":
                this._triggerButton(e.gamepad.playerIndex, MainButton.X, pressed); break;
            case "FACE_4":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Y, pressed); break;
            case "START_FORWARD":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Start, pressed); break;
            case "SELECT_BACK":
                this._triggerButton(e.gamepad.playerIndex, MainButton.Select, pressed); break;
        }

    },

    onGamePadKeyDown: function (e) {
        this.handleGamePadKey(e, true);
    },

    onGamePadKeyUp: function (e) {
        this.handleGamePadKey(e, false);
    },

    /**
     * KEYBOARD
     */

    onKeyDown: function(key) {
        this._handleKey(key, true);
    },

    onKeyUp: function(key) {
        this._handleKey(key, false);
    },

    _handleKey: function(key, pressed) {

        switch (key) {

        /**
         * Player 1 controllers
         */
            case cc.KEY.w:
                this._triggerButton(0, MainButton.Up, pressed); break;
            case cc.KEY.a:
                this._triggerButton(0, MainButton.Left, pressed); break;
            case cc.KEY.s:
                this._triggerButton(0, MainButton.Down, pressed); break;
            case cc.KEY.d:
                this._triggerButton(0, MainButton.Right, pressed); break;
            case cc.KEY.x:
            case cc.KEY.space:
                this._triggerButton(0, MainButton.A, pressed); break;
            case cc.KEY.z:
            case cc.KEY.escape:
                this._triggerButton(0, MainButton.B, pressed); break;
        /**
         * End Player 1
         */

        /**
         * Player 2 controllers
         */
            case cc.KEY.up:
                this._triggerButton(1, MainButton.Up, pressed); break;
            case cc.KEY.left:
                this._triggerButton(1, MainButton.Left, pressed); break;
            case cc.KEY.down:
                this._triggerButton(1, MainButton.Down, pressed); break;
            case cc.KEY.right:
                this._triggerButton(1, MainButton.Right, pressed); break;
            case cc.KEY.l:
            case cc.KEY.num2:
                this._triggerButton(1, MainButton.A, pressed); break;
            case cc.KEY.k:
            case cc.KEY.num1:
                this._triggerButton(1, MainButton.B, pressed); break;
        /**
         * End Player 2 controllers
         */

        /**
         * Generic Start Select controls
         */
            case cc.KEY.enter:
                this._triggerButton(0, MainButton.Start, pressed); break;
            case cc.KEY.backspace:
                this._triggerButton(0, MainButton.Select, pressed); break;
        /**
         * End Generic
         */

            case cc.KEY["1"]:
                this._triggerButton(0, MainButton["1"], pressed); break;

            case cc.KEY["2"]:
                this._triggerButton(0, MainButton["2"], pressed); break;

            case cc.KEY["3"]:
                this._triggerButton(0, MainButton["3"], pressed); break;

            case cc.KEY["4"]:
                this._triggerButton(0, MainButton["4"], pressed); break;

            case cc.KEY["5"]:
                this._triggerButton(0, MainButton["5"], pressed); break;

            case cc.KEY["6"]:
                this._triggerButton(0, MainButton["6"], pressed); break;

            case cc.KEY["7"]:
                this._triggerButton(0, MainButton["7"], pressed); break;

            case cc.KEY["8"]:
                this._triggerButton(0, MainButton["8"], pressed); break;

            case cc.KEY["9"]:
                this._triggerButton(0, MainButton["9"], pressed); break;

            case cc.KEY["0"]:
                this._triggerButton(0, MainButton["0"], pressed); break;

            default: break;
        }

    },

    /**
     * BOOTSTRAP COMMANDS
     */

    buttonUp: function() {

        if (!this._enabled || !this._vertical)
            return;

        this.changeSelectedItem(-1, true);
    },

    buttonDown: function() {

        if (!this._enabled || !this._vertical)
            return;

        this.changeSelectedItem(1, true);
    },

    buttonLeft: function() {

        if (!this._enabled || this._vertical)
            return;

        this.changeSelectedItem(-1, true);
    },

    buttonRight: function() {

        if (!this._enabled || this._vertical)
            return;

        this.changeSelectedItem(1, true);
    },

    buttonA: function() {

        if (!this._enabled)
            return;

        if (this._selectedItem) {
            if (this.selectAudio !== null)
                cc.AudioEngine.getInstance().playEffect(this.selectAudio);
            //this._selectedItem.unselected();
            this._selectedItem.activate();
        }
    },

    buttonB: function() {
    },

    buttonX: function() {
    },

    buttonY: function() {
    },

    buttonStart: function() {
        if (this.useStartButton)
            this.buttonA();
    },

    buttonSelect: function() {
    }

});

/**
 * create a new menu
 * @param {...cc.MenuItem|null} menuItems
 * @return {BAMenu}
 * @example
 * // Example
 * //there is no limit on how many menu item you can pass in
 * var myMenu = BAMenu.create(menuitem1, menuitem2, menuitem3);
 */
BAMenu.create = function (menuItems) {
    if((arguments.length > 0) && (arguments[arguments.length-1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var ret = new BAMenu();

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
