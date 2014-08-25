/**
 * Created by Bruno Assarisse on 18/03/14.
 */
/**
 *
 * @class
 * @extends cc.MenuItem
 */
var BANumberSelector = cc.MenuItem.extend(/** @lends BANumberSelector# */{

    /** @type {boolean} */
    _vertical: true,
    /** @type {cc.Color3B} */
    _disabledColor: null,
    /** @type {cc.Color3B} */
    _selectedColor: null,
    /** @type {cc.Color3B} */
    _normalColor: null,
    /** @type {cc.Node} */
    _label: null,
    /** @type number */
    _value: 0,
    /** @type number */
    _minValue: 0,
    /** @type number */
    _maxValue: 0,
    /** @type {*} */
    _changeTarget: null,
    /** @type {function|string} */
    _changeCallback: null,
    /** @type cc.MenuItem */
    _decreaseMenuItem: null,
    /** @type cc.MenuItem */
    _increaseMenuItem: null,
    /** @type string */
    selectAudio: null,

    ctor: function () {
        cc.MenuItem.prototype.ctor.call(this);
        this._vertical = true;
        this._disabledColor = null;
        this._selectedColor = null;
        this._normalColor = null;
        this._label = null;
        this._value = 0;
        this._minValue = 0;
        this._maxValue = 0;
        this._changeTarget = null;
        this._changeCallback = null;
        this._decreaseMenuItem = null;
        this._increaseMenuItem = null;
        this.selectAudio = "sfx_cursor_select";
    },

    /**
     *
     * @param {boolean} vertical
     */
    setVertical: function (vertical) {
        this._vertical = vertical;
    },

    /**
     *
     * @param {number} value
     */
    setMinValue: function (value) {
        this._minValue = value;
        if (this._value < value)
            this.setValue(value);
    },

    /**
     *
     * @param {number} value
     */
    setMaxValue: function (value) {
        this._maxValue = value;
        if (this._value > value)
            this.setValue(value);
    },

    /**
     *
     * @param {number} value
     */
    setValue: function (value) {
        value = util.crampNumber(value, this._minValue, this._maxValue);
        this._value = value;

        if (this._label) {
            this._label.setString(value.toFixed(0));
            this.setContentSize(this._label.getContentSize());
        }

        if (this._decreaseMenuItem) {
            var showDecrease = value > this._minValue;
            this._decreaseMenuItem.setVisible(showDecrease);
            this._decreaseMenuItem.setEnabled(showDecrease);
        }

        if (this._increaseMenuItem) {
            var showIncrease = value < this._maxValue;
            this._increaseMenuItem.setVisible(showIncrease);
            this._increaseMenuItem.setEnabled(showIncrease);
        }

    },

    /**
     *
     * @returns {number}
     */
    getValue: function() {
        return this._value;
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
     * @param {cc.Node} label
     */
    setLabel:function (label) {
        if (label) {
            this.addChild(label);
            this.setContentSize(label.getContentSize());
            label.setAnchorPoint(0, 0);
            label.setPosition(0, 0);
        }

        if (this._label) {
            this.removeChild(this._label, true);
        }

        this._label = label;

        this.setValue(this._value);
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
     * @param {function|String} callback
     * @param {cc.Node} target
     * @return {Boolean}
     */
    initWithLabel:function (label, callback, target) {
        this.initWithCallback(callback, target);
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
     * @param {function|String} callback
     * @param {cc.Node} target
     */
    setChangeCallback: function(callback, target) {
        this._changeTarget = target;
        this._changeCallback = callback;
    },

    /**
     *
     * @param {cc.MenuItem} decreaseMenuItem
     * @param {cc.MenuItem} increaseMenuItem
     */
    setupChangeMenuItems: function(decreaseMenuItem, increaseMenuItem) {

        this._decreaseMenuItem = decreaseMenuItem;
        this._increaseMenuItem = increaseMenuItem;

        decreaseMenuItem.setCallback(this.decreaseValue, this);
        increaseMenuItem.setCallback(this.increaseValue, this);

        this.setValue(this._value);

    },

    /**
     *
     * @param {number} valueChange
     */
    changeValue: function(valueChange) {

        var value = this._value;

        this.setValue(value + valueChange);

        if (value !== this._value) {

            if (this.selectAudio)
                cc.AudioEngine.getInstance().playEffect(this.selectAudio);

            var locTarget = this._changeTarget, locCallback = this._changeCallback;
            if (!locCallback)
                return;
            if (locTarget && (typeof(locCallback) === "string")) {
                locTarget[locCallback](this);
            } else if (locTarget && (typeof(locCallback) === "function")) {
                locCallback.call(locTarget, this);
            } else
                locCallback(this);

        }

    },

    decreaseValue: function() {
        this.changeValue(-1);
    },

    increaseValue: function() {
        this.changeValue(1);
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
    },

    /**
     * INPUT
     */

    /** @type MainButton[] */
    _pressedButtons: null,
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

    onEnter:function () {
        this._super();

        this._pressedButtons = [];

        var director = cc.Director.getInstance();

        if (cc.KeyboardDispatcher)
            director.getKeyboardDispatcher().addDelegate(this);

        this.enableGamePad();

    },

    onExit:function () {
        this._super();

        var director = cc.Director.getInstance();

        if (cc.KeyboardDispatcher)
            director.getKeyboardDispatcher().removeDelegate(this);

        this.disableGamePad();

    },

    /**
     *
     * @param {MainButton} button
     * @param {boolean} pressed
     * @private
     */
    _triggerButton: function(button, pressed) {

        var shouldTrigger = this._shouldTriggerButton(button, pressed);

        if ((pressed && !this._allowKeyDown) || (!pressed && !this._allowKeyUp))
            return;

        if (shouldTrigger || this._allowButtonRepeat) {
            var isRepeat = !shouldTrigger;
            switch (button) {
                case MainButton.Up:
                    this.buttonUp(pressed, isRepeat); break;
                case MainButton.Down:
                    this.buttonDown(pressed, isRepeat); break;
                case MainButton.Left:
                    this.buttonLeft(pressed, isRepeat); break;
                case MainButton.Right:
                    this.buttonRight(pressed, isRepeat); break;
                case MainButton.A:
                    this.buttonA(pressed, isRepeat); break;
                case MainButton.B:
                    this.buttonB(pressed, isRepeat); break;
                case MainButton.Start:
                    this.buttonStart(pressed, isRepeat); break;
                case MainButton.Select:
                    this.buttonSelect(pressed, isRepeat); break;
            }
        }

    },

    /**
     * Returns whether a button should be triggered
     * @param {MainButton} button
     * @param {boolean} pressed
     * @returns {boolean}
     */
    _shouldTriggerButton: function(button, pressed) {

        var pressedButtons = this._pressedButtons;

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
            case cc.KEY.up:
            case cc.KEY.w:
                this._triggerButton(MainButton.Up, pressed); break;
            case cc.KEY.down:
            case cc.KEY.s:
                this._triggerButton(MainButton.Down, pressed); break;
            case cc.KEY.left:
            case cc.KEY.a:
                this._triggerButton(MainButton.Left, pressed); break;
            case cc.KEY.right:
            case cc.KEY.d:
                this._triggerButton(MainButton.Right, pressed); break;
            case cc.KEY.z:
            case cc.KEY.k:
            case cc.KEY.escape:
                this._triggerButton(MainButton.B, pressed); break;
            case cc.KEY.x:
            case cc.KEY.l:
            case cc.KEY.space:
                this._triggerButton(MainButton.A, pressed); break;
            case cc.KEY.enter:
                this._triggerButton(MainButton.Start, pressed); break;
            case cc.KEY.backspace:
                this._triggerButton(MainButton.Select, pressed); break;

            default: break;
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

            for (var control in device.state) {
                var value = device.state[control];

                if (/stick/i.test(control))
                    this.handleGamePadAxis({
                        axis: control,
                        value: value
                    });

                else if (value == 1)
                    this.handleGamePadKey({
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
                this._triggerButton(MainButton.Right, true);
            } else if (e.value < axisThreshold && this._axisRight) {
                this._axisRight = false;
                this._triggerButton(MainButton.Right, false);
            }

            if (e.value <= -axisThreshold && !this._axisLeft) {
                this._axisLeft = true;
                this._triggerButton(MainButton.Left, true);
            } else if (e.value > -axisThreshold && this._axisLeft) {
                this._axisLeft = false;
                this._triggerButton(MainButton.Left, false);
            }

        } else if (e.axis == "LEFT_STICK_Y") {

            if (e.value >= axisThreshold && !this._axisDown) {
                this._axisDown = true;
                this._triggerButton(MainButton.Down, true);
            } else if (e.value < axisThreshold && this._axisDown) {
                this._axisDown = false;
                this._triggerButton(MainButton.Down, false);
            }

            if (e.value <= -axisThreshold && !this._axisUp) {
                this._axisUp = true;
                this._triggerButton(MainButton.Up, true);
            } else if (e.value > -axisThreshold && this._axisUp) {
                this._axisUp = false;
                this._triggerButton(MainButton.Up, false);
            }

        }
    },

    handleGamePadKey: function(e, pressed) {

        switch (e.control) {
            case "DPAD_UP":
                this._triggerButton(MainButton.Up, pressed); break;
            case "DPAD_DOWN":
                this._triggerButton(MainButton.Down, pressed); break;
            case "DPAD_LEFT":
                this._triggerButton(MainButton.Left, pressed); break;
            case "DPAD_RIGHT":
                this._triggerButton(MainButton.Right, pressed); break;
            case "FACE_1":
            case "FACE_3":
                this._triggerButton(MainButton.A, pressed); break;
            case "FACE_2":
            case "FACE_4":
                this._triggerButton(MainButton.B, pressed); break;
            case "START_FORWARD":
                this._triggerButton(MainButton.Start, pressed); break;
            case "SELECT_BACK":
                this._triggerButton(MainButton.Select, pressed); break;
        }

    },

    onGamePadKeyDown: function (e) {
        this.handleGamePadKey(e, true);
    },

    onGamePadKeyUp: function (e) {
        this.handleGamePadKey(e, false);
    },

    /**
     * BOOTSTRAP COMMANDS
     */

    buttonUp: function(pressed, isRepeat) {
        if (!this._isSelected || !this._isEnabled || this.getOpacity() === 0 || !this._vertical)
            return;

        this.decreaseValue();
    },

    buttonDown: function(pressed, isRepeat) {
        if (!this._isSelected || !this._isEnabled || this.getOpacity() === 0 || !this._vertical)
            return;

        this.increaseValue();
    },

    buttonLeft: function(pressed, isRepeat) {
        if (!this._isSelected || !this._isEnabled || this.getOpacity() === 0 || this._vertical)
            return;

        this.decreaseValue();
    },

    buttonRight: function(pressed, isRepeat) {
        if (!this._isSelected || !this._isEnabled || this.getOpacity() === 0 || this._vertical)
            return;

        this.increaseValue();
    },

    buttonA: function(pressed, isRepeat) {
    },

    buttonB: function(pressed, isRepeat) {
    },

    buttonStart: function(pressed, isRepeat) {
    },

    buttonSelect: function(pressed, isRepeat) {
    }


});

/**
 * @param {cc.Node} label
 * @param {function|String|Null} [selector=]
 * @param {cc.Node|Null} [target=]
 * @return {BANumberSelector}
 */
BANumberSelector.create = function (label, selector, target) {
    var ret = new BANumberSelector();
    ret.initWithLabel(label, selector, target);
    return ret;
};