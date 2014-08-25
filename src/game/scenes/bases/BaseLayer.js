/**
 * @class
 * @extends cc.Layer
 */
var BaseLayer = cc.Layer.extend(/** @lends BaseLayer# */{

    /** @type cc.Size */
    _winSize: null,
    /** @type boolean */
    _inputEnabled: false,

    /** @type number */
    _firstTouchId: null,
    /** @type MainButton[] */
    _pressedButtons: null,
    /** @type InputType[] */
    _inputTypes: null,
    /** @type boolean */
    _allowKeyUp: true,
    /** @type boolean */
    _allowKeyDown: false,
    /** @type boolean */
    _allowButtonRepeat: false,
    /** @type number */
    _axisThreshold: kAxisThreshold,
    /** @type boolean[] */
    _axisUp: null,
    /** @type boolean[] */
    _axisDown: null,
    /** @type boolean[] */
    _axisLeft: null,
    /** @type boolean[] */
    _axisRight: null,
    /** @type function */
    _gamePadButtonDownFunction: null,
    /** @type function */
    _gamePadButtonUpFunction: null,
    /** @type function */
    _gamePadAxisChangedFunction: null,

    /**
     *
     * @param {InputType} inputTypes
     */
    init: function (inputTypes) {
        this._super();

        this._inputTypes = inputTypes || [
            InputType.Keyboard1,
            InputType.GamePad1
        ];

        this._axisUp = [];
        this._axisDown = [];
        this._axisLeft = [];
        this._axisRight = [];

        for (var i = 0; i < kNumberOfPlayers; i++) {
            this._axisUp.push(false);
            this._axisDown.push(false);
            this._axisLeft.push(false);
            this._axisRight.push(false);
        }

        this._winSize = cc.Director.getInstance().getWinSize();
        this._pressedButtons = [];

    },

    onEnter: function() {
        this._super();

        //this.setInputEnabled(true);

    },

    onExit: function() {
        this._super();

        this.setInputEnabled(false);

    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this.setInputEnabled(true);
    },

    recursivelyPauseAllChildren: function(node) {
        node.pauseSchedulerAndActions();

        var nodeChildren = node.getChildren();
        for (var c in nodeChildren) {
            this.recursivelyPauseAllChildren(nodeChildren[c]);
        }
    },

    recursivelyResumeAllChildren: function(node) {
        node.resumeSchedulerAndActions();

        var nodeChildren = node.getChildren();
        for (var c in nodeChildren) {
            this.recursivelyResumeAllChildren(nodeChildren[c]);
        }
    },

    /**
     *
     * @param {boolean} enabled
     */
    setInputEnabled: function(enabled) {

        if (enabled === this._inputEnabled)
            return;
        this._inputEnabled = enabled;

        this._pressedButtons = [];

        if (kHasTouch) {
            this.setTouchEnabled(enabled);
            //this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
        } else {
            this.setMouseEnabled(enabled);
        }

        this.setKeyboardEnabled(enabled);

        if (enabled)
            this.enableGamePad();
        else
            this.disableGamePad();

    },

    /**
     *
     * @param {InputType} inputType
     * @param {MainButton} button
     * @param {boolean} pressed
     * @private
     */
    _triggerButton: function(inputType, button, pressed) {

        var shouldTrigger = this._shouldTriggerButton(inputType, button, pressed);

        if ((pressed && !this._allowKeyDown) || (!pressed && !this._allowKeyUp))
            return;

        var index = this._inputTypes.indexOf(inputType);

        if (shouldTrigger || this._allowButtonRepeat) {
            var isRepeat = !shouldTrigger;
            this.buttonAny(index, button, pressed, isRepeat);
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
                case MainButton["1"]:
                    this.buttonNumber(index, 1, pressed, isRepeat); break;
                case MainButton["2"]:
                    this.buttonNumber(index, 2, pressed, isRepeat); break;
                case MainButton["3"]:
                    this.buttonNumber(index, 3, pressed, isRepeat); break;
                case MainButton["4"]:
                    this.buttonNumber(index, 4, pressed, isRepeat); break;
                case MainButton["5"]:
                    this.buttonNumber(index, 5, pressed, isRepeat); break;
                case MainButton["6"]:
                    this.buttonNumber(index, 6, pressed, isRepeat); break;
                case MainButton["7"]:
                    this.buttonNumber(index, 7, pressed, isRepeat); break;
                case MainButton["8"]:
                    this.buttonNumber(index, 8, pressed, isRepeat); break;
                case MainButton["9"]:
                    this.buttonNumber(index, 9, pressed, isRepeat); break;
                case MainButton["0"]:
                    this.buttonNumber(index, 0, pressed, isRepeat); break;
            }
        }

    },

    /**
     * Returns whether a button should be triggered
     * @param {InputType} inputType
     * @param {MainButton} button
     * @param {boolean} pressed
     * @returns {boolean}
     */
    _shouldTriggerButton: function(inputType, button, pressed) {

        var pressedButtons = this._pressedButtons[inputType];
        if (!pressedButtons) {
            pressedButtons = [];
            this._pressedButtons[inputType] = pressedButtons;
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

    /**
     * Returns whether an action of a button should be executed based on current event and the expected event
     * @param {number} index The player index
     * @param {MainButton} button
     * @param {boolean} pressed
     * @param {boolean|function} [expected=true] Specify true for KeyDown and false for KeyUp (can be a function, as if the nonExpectedCallback was the third argument)
     * @param {function|*} [nonExpectedCallback]
     * @param {*} [nonExpectedCallbackTarget]
     * @returns {boolean}
     */
    shouldExecuteAction: function(index, button, pressed, expected, nonExpectedCallback, nonExpectedCallbackTarget) {

        if (typeof expected === "function" && nonExpectedCallback) {
            nonExpectedCallbackTarget = nonExpectedCallback;
            nonExpectedCallback = expected;
            expected = undefined;
        }

        if (typeof expected === "undefined")
            expected = true;

        var inputType = this._inputTypes[index];
        var pressedButtons = this._pressedButtons[inputType];
        if (!pressedButtons) {
            pressedButtons = [];
            this._pressedButtons[inputType] = pressedButtons;
        }

        var buttonIndex = pressedButtons.indexOf(button);

        if (pressed) {

            if (buttonIndex === -1) {
                pressedButtons.push(button);
                if (expected)
                    return true;
                else if (nonExpectedCallback)
                    nonExpectedCallback.call(nonExpectedCallbackTarget);
            }

        } else {

            if (buttonIndex !== -1) {
                pressedButtons.splice(buttonIndex, 1);
                if (!expected)
                    return true;
                else if (nonExpectedCallback)
                    nonExpectedCallback.call(nonExpectedCallbackTarget);
            }

        }

        return false;
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
        var playerIndex = e.gamepad.playerIndex;
        var inputType = InputType["GamePad" + (playerIndex + 1)];
        if (typeof inputType === "undefined")
            return;

        if (e.axis == "LEFT_STICK_X") {

            var axisRight = this._axisRight[playerIndex];
            var axisLeft = this._axisLeft[playerIndex];

            if (e.value >= axisThreshold && !axisRight) {
                this._axisRight[playerIndex] = true;
                this._triggerButton(inputType, MainButton.Right, true);
            } else if (e.value < axisThreshold && axisRight) {
                this._axisRight[playerIndex] = false;
                this._triggerButton(inputType, MainButton.Right, false);
            }

            if (e.value <= -axisThreshold && !axisLeft) {
                this._axisLeft[playerIndex] = true;
                this._triggerButton(inputType, MainButton.Left, true);
            } else if (e.value > -axisThreshold && axisLeft) {
                this._axisLeft[playerIndex] = false;
                this._triggerButton(inputType, MainButton.Left, false);
            }

        } else if (e.axis == "LEFT_STICK_Y") {

            var axisUp = this._axisUp[playerIndex];
            var axisDown = this._axisDown[playerIndex];

            if (e.value >= axisThreshold && !axisDown) {
                this._axisDown[playerIndex] = true;
                this._triggerButton(inputType, MainButton.Down, true);
            } else if (e.value < axisThreshold && axisDown) {
                this._axisDown[playerIndex] = false;
                this._triggerButton(inputType, MainButton.Down, false);
            }

            if (e.value <= -axisThreshold && !axisUp) {
                this._axisUp[playerIndex] = true;
                this._triggerButton(inputType, MainButton.Up, true);
            } else if (e.value > -axisThreshold && axisUp) {
                this._axisUp[playerIndex] = false;
                this._triggerButton(inputType, MainButton.Up, false);
            }

        }
    },

    handleGamePadKey: function(e, pressed) {

        var inputType = InputType["GamePad" + (e.gamepad.playerIndex + 1)];
        if (typeof inputType === "undefined")
            return;

        switch (e.control) {
            case "DPAD_UP":
                this._triggerButton(inputType, MainButton.Up, pressed); break;
            case "DPAD_DOWN":
                this._triggerButton(inputType, MainButton.Down, pressed); break;
            case "DPAD_LEFT":
                this._triggerButton(inputType, MainButton.Left, pressed); break;
            case "DPAD_RIGHT":
                this._triggerButton(inputType, MainButton.Right, pressed); break;
            case "FACE_1":
                this._triggerButton(inputType, MainButton.A, pressed); break;
            case "FACE_2":
                this._triggerButton(inputType, MainButton.B, pressed); break;
            case "FACE_3":
                this._triggerButton(inputType, MainButton.X, pressed); break;
            case "FACE_4":
                this._triggerButton(inputType, MainButton.Y, pressed); break;
            case "START_FORWARD":
                this._triggerButton(inputType, MainButton.Start, pressed); break;
            case "SELECT_BACK":
                this._triggerButton(inputType, MainButton.Select, pressed); break;
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
                this._triggerButton(InputType.Keyboard1, MainButton.Up, pressed); break;
            case cc.KEY.a:
                this._triggerButton(InputType.Keyboard1, MainButton.Left, pressed); break;
            case cc.KEY.s:
                this._triggerButton(InputType.Keyboard1, MainButton.Down, pressed); break;
            case cc.KEY.d:
                this._triggerButton(InputType.Keyboard1, MainButton.Right, pressed); break;
            case cc.KEY.x:
            case cc.KEY.space:
                this._triggerButton(InputType.Keyboard1, MainButton.A, pressed); break;
            case cc.KEY.z:
            case cc.KEY.escape:
                this._triggerButton(InputType.Keyboard1, MainButton.B, pressed); break;
        /**
         * End Player 1
         */

        /**
         * Player 2 controllers
         */
            case cc.KEY.up:
                this._triggerButton(InputType.Keyboard2, MainButton.Up, pressed); break;
            case cc.KEY.left:
                this._triggerButton(InputType.Keyboard2, MainButton.Left, pressed); break;
            case cc.KEY.down:
                this._triggerButton(InputType.Keyboard2, MainButton.Down, pressed); break;
            case cc.KEY.right:
                this._triggerButton(InputType.Keyboard2, MainButton.Right, pressed); break;
            case cc.KEY.l:
            case cc.KEY.num2:
                this._triggerButton(InputType.Keyboard2, MainButton.A, pressed); break;
            case cc.KEY.k:
            case cc.KEY.num1:
                this._triggerButton(InputType.Keyboard2, MainButton.B, pressed); break;
        /**
         * End Player 2 controllers
         */

        /**
         * Generic Start Select controls
         */
            case cc.KEY.enter:
                this._triggerButton(InputType.Keyboard1, MainButton.Start, pressed); break;
            case cc.KEY.backspace:
                this._triggerButton(InputType.Keyboard1, MainButton.Select, pressed); break;
        /**
         * End Generic
         */

            case cc.KEY["1"]:
                this._triggerButton(InputType.Keyboard1, MainButton["1"], pressed); break;

            case cc.KEY["2"]:
                this._triggerButton(InputType.Keyboard1, MainButton["2"], pressed); break;

            case cc.KEY["3"]:
                this._triggerButton(InputType.Keyboard1, MainButton["3"], pressed); break;

            case cc.KEY["4"]:
                this._triggerButton(InputType.Keyboard1, MainButton["4"], pressed); break;

            case cc.KEY["5"]:
                this._triggerButton(InputType.Keyboard1, MainButton["5"], pressed); break;

            case cc.KEY["6"]:
                this._triggerButton(InputType.Keyboard1, MainButton["6"], pressed); break;

            case cc.KEY["7"]:
                this._triggerButton(InputType.Keyboard1, MainButton["7"], pressed); break;

            case cc.KEY["8"]:
                this._triggerButton(InputType.Keyboard1, MainButton["8"], pressed); break;

            case cc.KEY["9"]:
                this._triggerButton(InputType.Keyboard1, MainButton["9"], pressed); break;

            case cc.KEY["0"]:
                this._triggerButton(InputType.Keyboard1, MainButton["0"], pressed); break;

            default: break;
        }

    },

    /**
     * MOUSE
     */

    onMouseMoved: function(event) {
        this.onPointerMove(event, false);
    },

    onMouseDragged: function(event) {
        this.onPointerMove(event, false);
    },

    onMouseUp: function(event) {
        if (this._shouldTriggerButton(InputType.Keyboard1, MainButton.MouseLeft, false))
            this.onPointerUp(event, false);
    },

    onMouseDown: function(event) {
        if (this._shouldTriggerButton(InputType.Keyboard1, MainButton.MouseLeft, true))
            this.onPointerDown(event, false);
    },

    onRightMouseUp: function(event) {
        if (this._shouldTriggerButton(InputType.Keyboard1, MainButton.MouseRight, false))
            this.onPointerAltUp(event, false);
    },

    onRightMouseDown: function(event) {
        if (this._shouldTriggerButton(InputType.Keyboard1, MainButton.MouseRight, true))
            this.onPointerAltDown(event, false);
    },

    onRightMouseDragged: function(event) {
        this.onPointerAltMove(event, false);
    },

    /**
     * TOUCH
     */

    onTouchesBegan: function (touches, event) {

        if (touches.length == 3) {
            this.buttonStart(true);
            return;
        }

        var touch = touches[0];

        if (!this._firstTouchId) {
            this._firstTouchId = touch.getId();
            this.onPointerDown(touch, true);
        }

    },

    onTouchesMoved: function(touches, event){

        for (var t in touches) {
            var touch = touches[t];

            if (this._firstTouchId !== touch.getId())
                continue;

            this.onPointerMove(touch, true);

            break;
        }

    },

    onTouchesEnded: function (touches, event){

        for (var t in touches) {
            var touch = touches[t];

            if (this._firstTouchId !== touch.getId())
                continue;

            this.onPointerUp(touch, true);
            this._firstTouchId = null;

            break;
        }

    },

    onTouchesCancelled: function (touches, event) {

        for (var t in touches) {
            var touch = touches[t];

            if (this._firstTouchId !== touch.getId())
                continue;

            //this.onPointerUp(touch, true);
            this._firstTouchId = null;

            break;
        }

    },

    /**
     * BOOTSTRAP COMMANDS
     */

    /**
     *
     * @param {number} index
     * @param {MainButton} button
     * @param {boolean} pressed
     * @param {boolean} isRepeat
     */
    buttonAny: function(index, button, pressed, isRepeat) {
    },

    buttonUp: function(index, pressed, isRepeat) {
    },

    buttonDown: function(index, pressed, isRepeat) {
    },

    buttonLeft: function(index, pressed, isRepeat) {
    },

    buttonRight: function(index, pressed, isRepeat) {
    },

    buttonA: function(index, pressed, isRepeat) {
    },

    buttonB: function(index, pressed, isRepeat) {
    },

    buttonX: function(index, pressed, isRepeat) {
    },

    buttonY: function(index, pressed, isRepeat) {
    },

    buttonStart: function(index, pressed, isRepeat) {
    },

    buttonSelect: function(index, pressed, isRepeat) {
    },

    buttonNumber: function(index, number, pressed, isRepeat) {
    },

    onPointerMove: function(event, isTouch) {
    },

    onPointerDown: function(event, isTouch) {
    },

    onPointerUp: function(event, isTouch) {
    },

    onPointerAltMove: function(event, isTouch) {
    },

    onPointerAltDown: function(event, isTouch) {
    },

    onPointerAltUp: function(event, isTouch) {
    }

});