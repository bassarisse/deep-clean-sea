/**
 * Created by bassarisse on 09/08/14.
 */

var util = /** @lends util */{

    /**
     * Make the first letter uppercase
     * @param {string} str
     * @returns {string}
     */
    capitalize: function (str) {
        if (typeof str !== "string")
            return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     *
     * @param {*} val
     * @param {number} [defaultVal]
     * @returns {number}
     */
    getNumber: function(val, defaultVal) {

        if (typeof val !== "undefined")
            return val;

        return typeof defaultVal === "undefined" ? 0 : defaultVal;
    },

    /**
     *
     * @param {*} val
     * @param {string} [defaultVal]
     * @returns {string}
     */
    getString: function(val, defaultVal) {

        if (typeof val === "string")
            return val;

        return typeof defaultVal === "undefined" ? "" : defaultVal;
    },

    /**
     *
     * @param {*} val
     * @param {boolean} [defaultVal]
     * @returns {boolean}
     */
    getBoolean: function(val, defaultVal) {

        if (typeof val === "boolean")
            return val;

        if (val === "true")
            return true;

        if (val === "false")
            return false;

        return typeof defaultVal === "undefined" ? false : defaultVal;
    },

    /**
     *
     * @param {string[]|*} frames
     * @param {string} [frameName]
     * @param {number} [frameQty]
     * @returns {string[]}
     */
    getFrames: function(frames, frameName, frameQty) {

        if (frames || typeof frameName === "undefined" || typeof frameQty === "undefined")
            return frames;

        var newFrames = [];

        for (var i = 1; i <= frameQty; i++) {
            newFrames.push(frameName + i);
        }

        return newFrames;
    },

    /**
     * Given a percentage, returns the gambling result
     * @param {number} chance Should be 0 ~ 100 (although more would not cause problems)
     * @returns {boolean}
     */
    getLucky: function(chance) {

        if (chance > 0) {
            var someRandom = Math.random();
            if (someRandom < chance / 100)
                return true;
        }

        return false;
    },

    /**
     * Given a minimum and a maximum number, returns a random number between them
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    getRandom: function(min, max) {

        var diff = max - min + 1;

        return min + Math.round(Math.random() * diff * 10) % diff;
    },

    /**
     *
     * @param {number} number
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    crampNumber: function(number, min, max) {

        if (number < min)
            number = min;

        if (number > max)
            number = max;

        return number;
    }

};