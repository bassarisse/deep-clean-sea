
var kDebugBox2D = false;

var kVersion = "1.1.0";

var kMaxLevel = 1;
var kTmxPrefix = "stage";
var kTileSize = 8;
var kBaseScreenWidth = 160;
var kBaseScreenHeight = 144;

var kHasTouch = 'ontouchstart' in window || 'onmsgesturechange' in window;
var kAxisThreshold = 0.5;

var kNumberOfPlayers = 4;

var PTM_RATIO = 32;
var kGravity = -1;
var kFixedStepTime = 1/60;
var kMaxUpdatesPerFrame = 10;

var kMicroFontOffset = 3;

var kUserDefaultTimesPlayed = "TimesPlayed";
var kUserDefaultBestScore = "HighScore";
var kUserDefaultBgmVolume = "BgmVolume";
var kUserDefaultSfxVolume = "SfxVolume";

var kWalkActionTag = 300;
var kGatherActionTag = 400;
var kGearsActionTag = 500;

var kEnemyMargin = 20;

var kDifficultyMin = 1;
var kDifficultyMax = 2.5;
var kDifficultyIncreaseRate = 500;

var kWalkForce = 3.75;
var kGathererWalkForce = 0.35;
var kBoatWalkForce = 1;
var kEnemyWalkForce = 0.25;

var kGathererFuelFactor = 1.1;
var kBoatFuelFactor = 0.51;

var kGathererDamageFactor = 90;
var kBoatDamageFactor = 45;

var kGathererResourceTransferFactor = 15;
var kBoatResourceTransferFactor = 60;
var kDepositResourceTransferFactor = 105;
var kWorldResourceTransferFactor = 10;

var kResourceBase = 25;
var kMaxResourcePiles = 10;
var kNoResourceTime = 90;
var kDepositRevivalQuantity = 1000;

var kGathererMoveRange = 0.12;
var kFloatUpGravity = -0.22;
var kFloatBaseGravity = -0.05;
var kFloatDownGravity = 0.2;

var kMoveForceAddFactor = 0.01;
var kStopVelocityMultiplier = 0.99;
var kStopVelocityMultiplierWhenDamaged = 0.99;

var kDamageVelocityThreshold = 0.4;
var kDamageTime = 0.75;
var kDamageImpulse = 0.075;
var kDamageQuantity = 20;
var kDamageShakeTime = 0.25;

var MainButton = {
    Unknown: -1,
    Up: 1,
    Right: 2,
    Down: 3,
    Left: 4,
    A: 5,
    B: 6,
    X: 21,
    Y: 22,
    Start: 7,
    Select: 8,
    MouseLeft: 9,
    MouseRight: 10,
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 17,
    8: 18,
    9: 19,
    0: 20
};

var InputType = {
    Keyboard1: 1,
    Keyboard2: 2,
    Keyboard3: 4,
    Keyboard4: 8,
    Keyboard5: 16,
    Keyboard6: 32,
    GamePad1: 64,
    GamePad2: 128,
    GamePad3: 256,
    GamePad4: 512,
    GamePad5: 1024,
    GamePad6: 2048
};

var MovingState = {
    Stopped: 0,
    Left: 1,
    Right: 2,
    Up: 3,
    Down: 4
};

var StageState = {
    Starting: 1,
    Running: 2,
    Paused: 4,
    Ended: 8
};

var GameObjectState = {
    Standing: 1,
    Dying: 2,
    Dead: 4,
    TakingDamage: 8,
    Jumping: 16,
    Docked: 32
};

var GameObjectType  = {
    Unknown: 0,
    Gatherer: 1,
    Boat: 2,
    Deposit: 3,
    ResourcePile: 3,
    Enemy: 4
};

var ContactType = {
    Unknown: 1,
    Floor: 2,
    Body: 4,
    Hatch: 8,
    Surface: 16,
    Bottom: 32,
    EnemyLimit: 64
};

var EntityFilterCategory = {
    Actor: 0x0002,
    Enemy: 0x0004,
    ResourcePile: 0x0008,
    Static: 0x0010
};

var EndReason = {
    BoatFuel: 0,
    GathererFuel: 1,
    BoatLife: 2,
    GathererLife: 3,
    ResourcePiles: 4,
    NoWorkingDeposits: 5
};

var
    gbDarkestColor = cc.c4b(19, 49, 96, 255),
    gbDarkestColor3 = cc.c3b(19, 49, 96),
    gbDarkColor = cc.c4b(32, 110, 187, 255),
    gbDarkColor3 = cc.c3b(32, 110, 187),
    gbLightColor = cc.c4b(69, 160, 228, 255),
    gbLightColor3 = cc.c3b(69, 160, 228),
    gbLightestColor = cc.c4b(133, 212, 255, 255),
    gbLightestColor3 = cc.c3b(133, 212, 255)
    ;