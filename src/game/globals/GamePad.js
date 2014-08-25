(function() {

    var gamePad = new Gamepad();

    gamePad.bind(Gamepad.Event.CONNECTED, function (device) {
        console.log('Gamepad - Connected', device);
        updatePlayerIndexes();
    });

    gamePad.bind(Gamepad.Event.DISCONNECTED, function (device) {
        console.log('Gamepad - Disconnected', device);
        updatePlayerIndexes();
    });

    if (gamePad.init()) {
        //console.log("Gamepad - Init");
    }

    function updatePlayerIndexes() {

        var i, aGamepad;
        var validGamePads = [];
        var invalidPlayerIndexes = [];

        for (i = 0; i < gamePad.gamepads.length; i++) {
            aGamepad = gamePad.gamepads[i];

            if (!aGamepad || !aGamepad.state)
                continue;

            validGamePads.push(aGamepad);
        }

        for (i = 0; i < validGamePads.length; i++) {
            aGamepad = validGamePads[i];

            if (aGamepad.index >= 0 && (!aGamepad.connected || isOld(aGamepad, validGamePads)))
                invalidPlayerIndexes.push(aGamepad.index);
        }

        for (i = 0; i < validGamePads.length; i++) {
            aGamepad = validGamePads[i];

            aGamepad.playerIndex = aGamepad.index - invalidPlayerIndexes.filter(function(invalidIndex) {
                return invalidIndex < aGamepad.index;
            }).length;
        }

    }

    function isOld(gamepad, gamepads) {

        if (gamepad.timestamp === 0)
            return false;

        for (var i = 0; i < gamepads.length; i++) {
            var aGamepad = gamepads[i];

            if (aGamepad === gamepad || aGamepad.timestamp === 0)
                continue;

            if (gamepad.timestamp - aGamepad.timestamp >= 270000000000) // workaround for chrome bug?
                return true;
        }

        return false;
    }

    this.gamePad = gamePad;
})();