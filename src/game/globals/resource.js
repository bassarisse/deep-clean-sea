
var g_resources = [];

var res = /** @lends res */{

    //image
    img_Characters: "characters.png",
    img_Logos: "logos.png",
    img_Hud: "hud.png",
    img_Tileset: "tileset.png",

    //plist
    plist_Characters: "characters.plist",
    plist_Logos: "logos.plist",
    plist_Hud: "hud.plist",
    plist_SeaParticle: "particle_sea.plist",
    plist_GathererParticle: "particle_gatherer.plist",
    plist_BoatParticle: "particle_boat.plist",

    //fnt
    fnt_Main: "whitefont.fnt",
    fnt_MainImg: "whitefont.png",
    fnt_MainMini: "miniwhitefont.fnt",
    fnt_MainMiniImg: "miniwhitefont.png",
    fnt_MainMicro: "microwhitefont.fnt",
    fnt_MainMicroImg: "microwhitefont.png",

    json_SoundsSprite: "soundsSprite.json"

};

(function() {

    for (var resKey in res) {
        if (!res.hasOwnProperty(resKey))
            continue;

        g_resources.push({src:res[resKey]});

    }

    /**
     * Adding all the tmx for the stages
     */
    for (var st = 1; st <= kMaxLevel; st++) {
        g_resources.push({src:kTmxPrefix + st + ".tmx"});
    }

})();