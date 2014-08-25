
/**
 * Offer a VERY simple interface to play music & sound effect, using Howler lib.
 * @class
 * @extends   cc.Class
 */
cc.HowlerAudioEngine = cc.AudioEngine.extend(/** @lends cc.AudioEngine# */{

    /** @type Howl */
    _howlAudio: null,
    /** @type SoundState */
    _musicState: null,
    /** @type number */
    _musicAudioId: null,
    /** @type string */
    _musicKey: null,
    /** @type boolean */
    _musicLooping: null,
    /** @type *[] */
    _effectInfos: null,
    /** @type number */
    _musicVolume: 0,
    /** @type number */
    _effectsVolume: 0,

    /**
     * Constructor
     */
    ctor:function () {
        this._super();
    },

    /**
     * Initialize sound type
     * @return {Boolean}
     */
    init:function () {
        this._soundSupported = true;
        this._howlAudio = null;
        this._musicState = SoundState.Stopped;
        this._musicAudioId = null;
        this._musicKey = null;
        this._musicLooping = false;
        this._effectInfos = [];
        this._musicVolume = 1;
        this._effectsVolume = 1;
        return true;
    },

    /**
     * Preload sound resource.<br />
     * This method is called when cc.Loader preload  resources.
     * @param {*|String} str An object with a property 'audioSprite' for Howler audio parameters (create with new String)
     */
    preloadSound:function (str) {
        if (this._soundSupported) {
            var config = str.audioSprite || str;

            if (typeof config.urls === "string") {
                config.urls = this._resPath + config.urls;
            } else {
                for(var i = 0; i < config.urls.length; i++) {
                    config.urls[i] = this._resPath + config.urls[i];
                }
            }

            config.onload = function() {
                cc.Loader.getInstance().onResLoaded();
            };
            config.onloaderror = config.onload;
            config.onend = this._audioEnd;

            this._howlAudio = new Howl(config);

        } else {
            cc.Loader.getInstance().onResLoaded();
        }
    },

    _audioEnd: function(audioId) {
        var self = cc.AudioEngine.getInstance();

        if (audioId === self._musicAudioId) {
            if (!self._musicLooping) {
                self._musicState = SoundState.Stopped;
                self._musicAudioId = null;
                self._musicKey = null;
                self._musicLooping = false;
            }
            return;
        }

        var effectInfos = self._effectInfos;

        var i = effectInfos.length;
        while (i--) {
            var effectInfo = effectInfos[i];
            if (audioId === effectInfo.id) {

                if (!effectInfo.loop)
                    effectInfos.splice(i, 1);

                break;
            }
        }

    },

    /**
     *
     * @param {String} key The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     */
    _playMusic: function(key, loop) {

        if (!key)
            return;

        if (typeof loop === "undefined")
            loop = false;

        var self = this;

        self._musicState = SoundState.Playing;

        this._howlAudio.play(key, function(audioId) {

            if (self._musicAudioId !== null) {
                self._howlAudio.stop(self._musicAudioId);
            }

            self._musicKey = key;
            self._musicLooping = loop;

            if (audioId) {

                self._howlAudio.volume(self._musicVolume, audioId);
                self._musicAudioId = audioId;

                if (self._musicState === SoundState.Paused) {
                    self._howlAudio.pause(audioId);
                } else if (self._musicState === SoundState.Stopped) {
                    self.stopMusic();
                }

            }

        }, loop);

    },

    /**
     * Play music.
     * @param {String} key The path of the music file without filename extension.
     * @param {Boolean} loop Whether the music loop or not.
     * @example
     * //example
     * cc.AudioEngine.getInstance().playMusic(path, false);
     */
    playMusic:function (key, loop) {

        this.stopMusic();
        this._playMusic(key, loop);

    },

    /**
     * Stop playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopMusic();
     */
    stopMusic:function () {
        this._musicState = SoundState.Stopped;
        if (this._musicAudioId !== null) {
            this._howlAudio.stop(this._musicAudioId);
        }
        this._musicAudioId = null;
        this._musicKey = null;
        this._musicLooping = false;
    },

    /**
     * Pause playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseMusic();
     */
    pauseMusic:function () {
        if (this._musicState !== SoundState.Playing)
            return;
        this._musicState = SoundState.Paused;
        if (this._musicAudioId !== null)
            this._howlAudio.pause(this._musicAudioId);
    },

    /**
     * Resume playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeMusic();
     */
    resumeMusic:function () {
        if (this._musicState !== SoundState.Paused)
            return;
        this._musicState = SoundState.Playing;
        this._musicAudioId = null;
        if (this._musicKey !== null)
            this._playMusic(this._musicKey, this._musicLooping);
    },

    /**
     * Rewind playing music.
     * @example
     * //example
     * cc.AudioEngine.getInstance().rewindMusic();
     */
    rewindMusic:function () {
        this._musicState = SoundState.Stopped;
        if (this._musicAudioId !== null) {
            this._howlAudio.stop(this._musicAudioId);
            this._musicAudioId = null;
        }
        if (this._musicKey !== null)
            this._playMusic(this._musicKey, this._musicLooping);
    },

    /**
     * The volume of the music max value is 1.0,the min value is 0.0 .
     * @return {Number}
     * @example
     * //example
     * var volume = cc.AudioEngine.getInstance().getMusicVolume();
     */
    getMusicVolume:function () {
        return this._musicVolume;
    },

    /**
     * Set the volume of music.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setMusicVolume(0.5);
     */
    setMusicVolume:function (volume) {

        volume = Math.max(volume, 0);
        volume = Math.min(volume, 1);
        this._musicVolume = volume;

        if (this._musicAudioId !== null)
            this._howlAudio.volume(volume, this._musicAudioId);
    },

    /**
     * Whether the music is playing.
     * @return {Boolean} If is playing return true,or return false.
     * @example
     * //example
     *  if (cc.AudioEngine.getInstance().isMusicPlaying()) {
     *      cc.log("music is playing");
     *  }
     *  else {
     *      cc.log("music is not playing");
     *  }
     */
    isMusicPlaying: function () {
        return this._musicState === SoundState.Playing;
    },

    /**
     * Play sound effect.
     * @param {String} key The path of the sound effect with filename extension.
     * @param {Boolean} loop Whether to loop the effect playing, default value is false
     * @param {function} callback Callback to receive the audio id
     */
    playEffect:function (key, loop, callback) {

        if (!key)
            return;

        if (typeof loop === "undefined")
            loop = false;

        var self = this;

        this._howlAudio.play(key, function(audioId) {

            if (audioId) {

                self._howlAudio.volume(self._effectsVolume, audioId);
                self._effectInfos.push({
                    id: audioId,
                    loop: loop,
                    key: key,
                    state: SoundState.Playing,
                    callback: callback
                });

            }

            if (callback)
                callback(audioId);

        }, loop);
    },

    /**
     * Set the volume of sound effecs.
     * @param {Number} volume Volume must be in 0.0~1.0 .
     * @example
     * //example
     * cc.AudioEngine.getInstance().setEffectsVolume(0.5);
     */
    setEffectsVolume:function (volume) {

        volume = Math.max(volume, 0);
        volume = Math.min(volume, 1);
        this._effectsVolume = volume;

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            this._howlAudio.volume(volume, effectInfos[i].id);
        }
    },

    /**
     * Pause playing sound effect.
     * @param {String} audioId The returned value of playEffect callback.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseEffect(audioId);
     */
    pauseEffect:function (audioId) {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            if (audioId === effectInfo.id) {
                if (effectInfo.state === SoundState.Playing) {
                    effectInfo.state = SoundState.Paused;
                    this._howlAudio.pause(effectInfo.id);
                }
                break;
            }
        }

    },

    /**
     * Pause all playing sound effect.
     * @example
     * //example
     * cc.AudioEngine.getInstance().pauseAllEffects();
     */
    pauseAllEffects:function () {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            if (effectInfo.state === SoundState.Playing) {
                effectInfo.state = SoundState.Paused;
                this._howlAudio.pause(effectInfo.id);
            }
        }

    },

    /**
     * Resume playing sound effect.
     * @param {String} audioId The returned value of playEffect callback.
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeEffect(audioId);
     */
    resumeEffect:function (audioId) {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            if (audioId === effectInfo.id) {

                if (effectInfo.state === SoundState.Paused) {
                    effectInfos.splice(i, 1);
                    this.playEffect(effectInfo.key, effectInfo.loop, effectInfo.callback);
                }

                break;
            }
        }

    },

    /**
     * Resume all playing sound effect
     * @example
     * //example
     * cc.AudioEngine.getInstance().resumeAllEffects();
     */
    resumeAllEffects:function () {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            if (effectInfo.state === SoundState.Paused) {
                effectInfos.splice(i, 1);
                this.playEffect(effectInfo.key, effectInfo.loop, effectInfo.callback);
            }
        }

    },

    /**
     * Stop playing sound effect.
     * @param {String} audioId The returned value of playEffect callback.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopEffect(audioId);
     */
    stopEffect:function (audioId) {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            if (audioId === effectInfo.id) {

                effectInfos.splice(i, 1);
                this._howlAudio.stop(effectInfo.id);

                break;
            }
        }

    },

    /**
     * Stop all playing sound effects.
     * @example
     * //example
     * cc.AudioEngine.getInstance().stopAllEffects();
     */
    stopAllEffects:function () {

        var effectInfos = this._effectInfos;
        var i = effectInfos.length;

        while (i--) {
            var effectInfo = effectInfos[i];
            this._howlAudio.stop(effectInfo.id);
        }

        this._effectInfos = [];

    }

});

var SoundState = {
    Stopped: 0,
    Playing: 1,
    Paused: 2
};

/**
 * Get the shared Engine object, it will new one when first time be called.
 * @return {cc.AudioEngine}
 */
cc.AudioEngine.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.HowlerAudioEngine();
        this._instance.init();
    }
    return this._instance;
};