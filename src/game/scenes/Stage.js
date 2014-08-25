
/**
 * @class
 * @extends cc.Node
 */
var b2DebugDrawLayer = cc.Node.extend(/** @lends b2DebugDrawLayer# */{
    world: null,
    draw: function(context) {
        this._super(context);

        var locEGL = cc.EGLView.getInstance(), locEGL_ScaleX = locEGL.getScaleX(), locEGL_ScaleY = locEGL.getScaleY();

        var ptm = PTM_RATIO * locEGL_ScaleX;

        context.translate(0, 0);
        context.scale(1,-1);
        context.scale(PTM_RATIO * locEGL_ScaleX, PTM_RATIO * locEGL_ScaleY);
        context.lineWidth /= ptm;

        this.world.DrawDebugData();
    }
});

/**
 * @class
 * @extends BaseLayer
 */
var Stage = BaseLayer.extend(/** @lends Stage# */{

    // input management

    buttonUpPressed: false,
    buttonDownPressed: false,
    buttonLeftPressed: false,
    buttonRightPressed: false,
    buttonAPressed: false,
    buttonBPressed: false,

    // "private" properties

    _level: 1,
    _halfWinSize: null,
    _tileMapSize: null,
    _contactListener: null,
    _mainLayer: null,
    _mainBatchNode: null,
    _tiledMap: null,
    _hudLayer: null,
    /** @type GameObject[] */
    _gameObjects: null,

    /** @type Gatherer */
    _gatherer: null,
    /** @type Boat */
    _boat: null,
   /** @type Rope */
    _rope: null,

    _b2world: null,
    _frameAccumulator: 0,
    _stageTime: 0,
    _state: StageState.Starting,

    /** @type Deposit[] */
    _deposits: null,
    _workingDeposits: 0,
    /** @type ResourcePile[] */
    _resourcePiles: null,
    _nextResourceTime: 0,
    _nextEnemyTime: 0,
    _difficultyRate: 0,

    /** @type cc.Sprite[] */
    _hintArrows: null,
    _hintStep: 0,

    // public properties

    resource: 0,

    // public methods

    /**
     *
     * @param {InputType} inputTypes
     * @param {number} level
     */
    init: function (inputTypes, level) {
        this._super(inputTypes);

        var userDefault = cc.UserDefault.getInstance();
        var timesPlayed = userDefault.getIntegerForKey(kUserDefaultTimesPlayed, 0);
        timesPlayed++;
        userDefault.setIntegerForKey(kUserDefaultTimesPlayed, timesPlayed);

        var audioEngine = cc.AudioEngine.getInstance();
        audioEngine.stopMusic();
        audioEngine.playMusic("bgm_level", true);

        var spriteCache = cc.SpriteFrameCache.getInstance();
        spriteCache.addSpriteFrames(res.plist_Characters);
        spriteCache.addSpriteFrames(res.plist_Hud);

        this._allowKeyDown = true;

        level = level || 1;
        this._level = level;
        this._gameObjects = [];
        this._deposits = [];
        this._resourcePiles = [];
        this._difficultyRate = kDifficultyMin;

        this._contactListener = createContactListener();
        this._mainLayer = cc.Layer.create();
        this._mainBatchNode = cc.SpriteBatchNode.create(res.img_Characters);
        this._tiledMap = cc.TMXTiledMap.create(kTmxPrefix + level + ".tmx");

        this._halfWinSize = cc.size(this._winSize.width / 2, this._winSize.height / 2);
        this._tileMapSize = cc.size(
            this._tiledMap.getMapSize().width * this._tiledMap.getTileSize().width,
            this._tiledMap.getMapSize().height * this._tiledMap.getTileSize().height
        );

        var overlayBatchNode = cc.SpriteBatchNode.create(res.img_Characters);

        var leftSide = cc.Sprite.createWithSpriteFrameName("side");
        leftSide.setAnchorPoint(0, 0);
        leftSide.setPosition(0, kTileSize);
        var rightSide = cc.Sprite.createWithSpriteFrameName("side");
        rightSide.setAnchorPoint(1, 0);
        rightSide.setPosition(this._winSize.width - kTileSize, kTileSize);
        rightSide.setScaleX(-1);

        overlayBatchNode.addChild(leftSide);
        overlayBatchNode.addChild(rightSide);

        var seaParticle = cc.ParticleSystem.create(res.plist_SeaParticle);
        seaParticle.setDrawMode(cc.PARTICLE_TEXTURE_MODE);

        var gathererParticle = cc.ParticleSystem.create(res.plist_GathererParticle);
        gathererParticle.setDrawMode(cc.PARTICLE_TEXTURE_MODE);
        gathererParticle.stopSystem();

        var boatParticle = cc.ParticleSystem.create(res.plist_BoatParticle);
        boatParticle.setDrawMode(cc.PARTICLE_TEXTURE_MODE);
        boatParticle.stopSystem();

        this._rope = new Rope();
        this._rope.init();

        var waterBatchNode = cc.SpriteBatchNode.create(res.img_Characters);

        var totalWaterFrames = 16;
        for (var w = 0; w < 8; w++) {
            var waterSprite = cc.Sprite.createWithSpriteFrameName("water1");
            waterSprite.setAnchorPoint(0, 0);
            waterSprite.setPosition(16 + w * kTileSize * 2, 108);

            var anim = cc.Animation.create();
            anim.setDelayPerUnit(0.12);
            anim.setRestoreOriginalFrame(false);

            var minWi = w % 2 ? 8 : 1;
            for (var wi = minWi; wi <= minWi + totalWaterFrames - 1; wi++)
                anim.addSpriteFrame(spriteCache.getSpriteFrame("water" + (wi % totalWaterFrames + 1)));

            waterSprite.runAction(cc.RepeatForever.create(cc.Animate.create(anim)));
            waterBatchNode.addChild(waterSprite);
        }

        this._mainLayer.addChild(this._tiledMap);
        this._mainLayer.addChild(seaParticle);
        this._mainLayer.addChild(gathererParticle);
        this._mainLayer.addChild(waterBatchNode);
        this._mainLayer.addChild(boatParticle);
        this._mainLayer.addChild(this._rope);
        this._mainLayer.addChild(this._mainBatchNode);
        this._mainLayer.addChild(overlayBatchNode);

        this.addChild(this._mainLayer);

        createVec(0, kGravity, function(vec) {
            this._b2world = new b2World(vec, true);
        }, this);

        this._b2world.SetContinuousPhysics(true);
        this._b2world.SetContactListener(this._contactListener);

        if (kDebugBox2D) {
            var myDebugDraw = getCanvasDebugDraw();
            myDebugDraw.SetFlags(e_shapeBit | e_jointBit | e_aabbBit | e_pairBit | e_centerOfMassBit);
            this._b2world.SetDebugDraw(myDebugDraw);

            var debugDrawLayer = new b2DebugDrawLayer();
            debugDrawLayer.init();
            debugDrawLayer.world = this._b2world;
            this._mainLayer.addChild(debugDrawLayer);
        }

        var gameObjectsGroup = this._tiledMap.getObjectGroup("objects");
        var collisionGroup = this._tiledMap.getObjectGroup("collision");

        var gameObjects = gameObjectsGroup.getObjects();
        var collisions = collisionGroup.getObjects();

        for (var o in gameObjects) {
            var gameObjectProperties = gameObjects[o];

            var type = gameObjectProperties["type"];

            if (!type)
                continue;

            switch (type) {

                case "Gatherer":
                    this._gatherer = this._createGameObject(Gatherer, gameObjectProperties);
                    this._gatherer.particle = gathererParticle;
                    break;

                case "Boat":
                    this._boat = this._createGameObject(Boat, gameObjectProperties);
                    this._boat.particle = boatParticle;
                    break;

                case "Enemy":
                    this._createGameObject(Enemy, gameObjectProperties);
                    break;

                case "Deposit":
                    this._deposits.push(this._createGameObject(Deposit, gameObjectProperties));
                    break;

                default:

                    var contactType = ContactType[type];

                    if (typeof contactType !== "undefined") {
                        var contactContainer = new ContactContainer;
                        contactContainer.type = contactType;

                        var theFixture = this._createStaticBody(gameObjectProperties);
                        theFixture.SetSensor(true);
                        theFixture.customData = contactContainer;
                    }
                    break;
            }

        }

        this._workingDeposits = this._deposits.length;

        for (var c in collisions) {
            var collisionProperties = collisions[c];

            var floorContact = new ContactContainer;
            floorContact.type = ContactType[collisionProperties["type"]] || ContactType.Floor;

            var floorFixture = this._createStaticBody(collisionProperties);
            floorFixture.customData = floorContact;
        }

        this._createEnemyLimits();

        this._hudLayer = new HUDLayer();
        this._hudLayer.init(this._gatherer, this._boat);
        this.addChild(this._hudLayer);

        this._hintArrows = [];
        this._hintStep = timesPlayed <= 3 ? -1 : 10;

        this._advanceHint(0);

        this._createResourcePile(false);
        if (Math.random() >= 0.5)
            this._createResourcePile(false);
        var rand = Math.random();
        if (rand >= 0.85 || rand <= 0.15)
            this._createResourcePile(false);

        this._nextEnemyTime = 0 + Math.random() * 30;

        this.scheduleUpdate();

    },

    // returns the main fixture created for the body
    _createStaticBody: function(properties, filterCategory) {

        if (typeof filterCategory === "undefined")
            filterCategory = EntityFilterCategory.Static;

        var x = properties["x"] / PTM_RATIO;
        var y = properties["y"] / PTM_RATIO;

        var width = properties["width"];
        var points = properties["polylinePoints"];
        var isLoop = false;
        if (!points) {
            points = properties["points"];
            isLoop = true;
        }

        if (width) {

            var height = properties["height"];
            var halfWidth = (width / 2) / PTM_RATIO;
            var halfHeight = (height / 2) / PTM_RATIO;

            x += halfWidth;
            y += halfHeight;

            var shape = new b2PolygonShape();
            shape.SetAsBox(halfWidth, halfHeight);

            var fixtureDef = new b2FixtureDef();
            fixtureDef.set_shape(shape);
            if (filterCategory !== null)
                fixtureDef.get_filter().set_categoryBits(filterCategory);

            var bodyDef = new b2BodyDef();
            bodyDef.set_type(b2_staticBody);
            createVec(x, y, function(vec) {
                bodyDef.set_position(vec);
            }, this);

            var body = this._b2world.CreateBody(bodyDef);
            return body.CreateFixture(fixtureDef);

        } else if (points) {

            var verts = [];

            for (var p in points) {
                var point = points[p];

                var vertX = point["x"] / PTM_RATIO;
                var vertY = point["y"] / PTM_RATIO;

                verts.push(new b2Vec2(vertX, -vertY));
            }

            var pShape = createChainShape(verts, isLoop);
            destroyBox2DArray(verts);

            var pFixtureDef = new b2FixtureDef();
            pFixtureDef.set_shape(pShape);
            if (filterCategory !== null)
                pFixtureDef.get_filter().set_categoryBits(filterCategory);

            var pBodyDef = new b2BodyDef();
            pBodyDef.set_type(b2_staticBody);
            createVec(x, y, function(vec) {
                pBodyDef.set_position(vec);
            }, this);

            var pBody = this._b2world.CreateBody(pBodyDef);
            return pBody.CreateFixture(pFixtureDef);
        }

        return null;
    },

    /**
     *
     * @param type
     * @param {*} properties
     * @returns {GameObject}
     */
    _createGameObject: function(type, properties) {

        var gameObject = new type();
        gameObject.init(this._b2world, properties);
        gameObject.stage = this;
        gameObject.setBatchNode(this._mainBatchNode);

        this._gameObjects.push(gameObject);
        if (gameObject.node)
            this._mainBatchNode.addChild(gameObject.node);

        return gameObject;
    },

    _createEnemyLimits: function() {

        for (var i = 0; i < 2; i++) {

            var contactContainer = new ContactContainer;
            contactContainer.type = ContactType.EnemyLimit;

            var width = 4;
            var margin = kEnemyMargin * 2;

            var theFixture = this._createStaticBody({
                x: -width / 2 - margin + i * (kBaseScreenWidth + margin * 2),
                y: 0,
                width: width,
                height: kBaseScreenHeight
            }, null);
            theFixture.SetSensor(true);
            theFixture.customData = contactContainer;

        }

    },

    onEnterTransitionDidFinish: function() {
        this._super();
        this._state = StageState.Running;
    },

    onExit: function() {
        this._super();
        for (var g = 0; g < this._gameObjects.length; g++) {
            this._gameObjects[g].destroyBody();
        }
    },

    update: function(delta) {

        if (this._state === StageState.Running)
            this._stageTime += delta;
        this._frameAccumulator += delta;

        var stepCount = 0;
        while (this._frameAccumulator > kFixedStepTime) {
            this._frameAccumulator -= kFixedStepTime;

            stepCount++;
            if (stepCount > kMaxUpdatesPerFrame)
                continue;

            if (!this._loop(kFixedStepTime))
                break;

        }

    },

    _loop: function(delta) {

        this._b2world.Step(delta, 5, 1);

        this._hudLayer.update(delta);

        if (this._resourcePiles.length === 0 && this._nextResourceTime > 15)
            this._nextResourceTime = 2 + Math.random() * 8;

        if (this._difficultyRate < kDifficultyMax) {
            this._difficultyRate += delta / kDifficultyIncreaseRate;
            if (this._difficultyRate > kDifficultyMax)
                this._difficultyRate = kDifficultyMax;
        }

        this._nextResourceTime -= delta;
        if (this._nextResourceTime < 0)
            this._createResourcePile(true);

        this._nextEnemyTime -= delta;
        if (this._nextEnemyTime < 0)
            this._createEnemy();

        for (var g = 0; g < this._gameObjects.length; g++) {
            this._gameObjects[g].update(delta);
        }

        for (var i = this._gameObjects.length - 1; i >= 0; i--) {
            if (this._gameObjects[i].state === GameObjectState.Dead)
                this._gameObjects.splice(i, 1);
        }

        for (var r = this._resourcePiles.length - 1; r >= 0; r--) {
            if (this._resourcePiles[r].isDead()) {
                this._resourcePiles.splice(r, 1);
                this._advanceHint(1);
            }
        }

        if (this._gatherer.resource <= 0 && this._boat.resource > 0)
            this._advanceHint(2);

        if (this._boat.resource <= 0)
            this._advanceHint(3);

        var diff = this._gatherer.b2body.GetPosition().get_x() - this._boat.b2body.GetPosition().get_x();
        var absDiff = Math.abs(diff);

        var walkForceModifier = 1;
        if (absDiff > 0.5)
            walkForceModifier += (absDiff - 0.5) * 0.75;
        this._gatherer.setWalkForceModifier(walkForceModifier);

        if (diff < 0 && absDiff > kGathererMoveRange) {
            this._gatherer.horizontalMovingState = MovingState.Right;
        } else if (diff > 0 && absDiff > kGathererMoveRange)  {
            this._gatherer.horizontalMovingState = MovingState.Left;
        } else  {
            this._gatherer.horizontalMovingState = MovingState.Stopped;
        }

        var p1 = this._boat.node.getPosition();
        var p2 = this._gatherer.node.getPosition();

        this._rope.point1 = cc.p(p1.x, p1.y);
        this._rope.point2 = cc.p(p2.x, p2.y);

        this._rope.point1.y -= 8;
        this._rope.point2.y += 3;

        this._workingDeposits = 0;

        for (var d = 0; d < this._deposits.length; d++) {
            if (this._deposits[d].working)
                this._workingDeposits++;
        }
        var hasWorkingDeposits = this._workingDeposits > 0;

        if (this._boat.fuel <= 0) {
            this.end(EndReason.BoatFuel, hasWorkingDeposits);
            return false;
        }

        if (this._boat.life <= 0) {
            this.end(EndReason.BoatLife, hasWorkingDeposits);
            return false;
        }

        if (this._gatherer.fuel <= 0 && this._gatherer.resource === 0 && this._boat.resource === 0) {
            this.end(EndReason.GathererFuel, hasWorkingDeposits);
            return false;
        }

        if (this._gatherer.life <= 0) {
            this.end(EndReason.GathererLife, hasWorkingDeposits);
            return false;
        }

        if (this._resourcePiles.length >= kMaxResourcePiles) {
            this.end(EndReason.ResourcePiles, hasWorkingDeposits);
            return false;
        }

        if (!hasWorkingDeposits) {
            this.end(EndReason.NoWorkingDeposits, hasWorkingDeposits);
            return false;
        }

        this._updateHints(delta);

        return true;
    },

    _updateHints: function(delta) {

        if (this._hintStep === 1) {
            var arrow = this._hintArrows[0];
            if (arrow)
                arrow.setPosition(this._boat.node.getPosition().x, arrow.getPosition().y);
        }

    },

    /**
     *
     * @param {number} step
     */
    _advanceHint: function(step) {

        if (this._hintStep === step - 1)
            this._hintStep++;
        else
            return;

        var arrow, i, p;

        for (i = 0; i < this._hintArrows.length; i++) {
            arrow = this._hintArrows[i];
            arrow.stopAllActions();
            arrow.removeFromParent(true);
        }

        switch (this._hintStep) {
            case 0:
                for (i = 0; i < this._resourcePiles.length; i++)
                    this._createHintArrowForResourcePile(i);
                break;
            case 1:
                arrow = this._getHintArrow(0, MovingState.Up);
                p = this._boat.node.getPosition();
                arrow.setPosition(p.x, p.y - 20);
                this._mainLayer.addChild(arrow);
                break;
            case 2:
                for (i = 0; i < this._deposits.length; i++) {
                    p = this._deposits[i].getInitialPosition();
                    var isToLeft = p.x < kBaseScreenWidth / 2;
                    arrow = this._getHintArrow(i, isToLeft ? MovingState.Left : MovingState.Right);
                    arrow.setPosition(p.x + 34 * (isToLeft ? 1 : -1), p.y + 4);
                    this._mainLayer.addChild(arrow);
                }
                break;
        }

    },

    /**
     *
     * @param {number} index
     */
    _createHintArrowForResourcePile: function(index) {
        var arrow = this._getHintArrow(index, MovingState.Down);
        var p = this._resourcePiles[index].node.getPosition();
        arrow.setPosition(p.x, p.y + 6);
        this._mainLayer.addChild(arrow);
    },

    /**
     *
     * @param {number} index
     * @param {MovingState} direction
     * @returns cc.Sprite
     */
    _getHintArrow: function(index, direction) {

        var arrow = this._hintArrows[index];

        if (!arrow) {
            arrow = cc.Sprite.createWithSpriteFrameName("hint-arrow");
            this._hintArrows[index] = arrow;
        }

        arrow.stopAllActions();

        var moveX = 0;
        var moveY = 0;
        var rotation = 0;

        if (direction === MovingState.Left) {

            rotation = 180;
            moveX = -kTileSize;

        } else if (direction === MovingState.Right) {

            moveX = kTileSize;

        } else if (direction === MovingState.Up) {

            rotation = -90;
            moveY = kTileSize;

        } else if (direction === MovingState.Down) {

            rotation = 90;
            moveY = -kTileSize;

        }

        arrow.setRotation(rotation);
        arrow.runAction(cc.RepeatForever.create(cc.Sequence.create([
            cc.EaseIn.create(cc.PixelMoveBy.create(1, cc.p(moveX, moveY)), 2),
            cc.EaseOut.create(cc.PixelMoveBy.create(1, cc.p(moveX * -1, moveY * -1)), 2)
        ])));

        return arrow;
    },

    end: function(endReason, hasWorkingDeposits) {

        this._state = StageState.Ended;
        this.unscheduleUpdate();

        var resource = Math.ceil(this.resource);

        if (typeof GJAPI !== "undefined") {
            if (GJAPI.bActive) {
                GJAPI.ScoreAdd(0, resource, resource + "");
            } else {
                //GJAPI.ScoreAddGuest(0, resource, resource + "", "Guest");
            }
        }

        this._boat.endTransfer();
        this._boat.endEngine();
        this._gatherer.endTransfer();
        this._gatherer.endEngine();
        cc.AudioEngine.getInstance().stopMusic();
        cc.Director.getInstance().replaceScene(new EndScene(
            endReason,
            this._level,
            this._gatherer,
            this._boat,
            resource,
            this._resourcePiles.length,
            hasWorkingDeposits
        ));

    },

    _createResourcePile: function(playSound) {

        this._nextResourceTime = ((5 + Math.random() * 20) / this._difficultyRate * this._workingDeposits);

        var resourcePile = this._createGameObject(ResourcePile, {
            x: 20 + Math.round(Math.random() * 120),
            y: 20,
            width: 12,
            height: 0.02
        });

        if (playSound)
            cc.AudioEngine.getInstance().playEffect("sfx_resource_spawn");

        this._resourcePiles.push(resourcePile);

        if (this._hintStep === 0)
            this._createHintArrowForResourcePile(this._resourcePiles.length - 1);
    },

    _createEnemy: function() {

        this._nextEnemyTime = (2 + Math.random() * 18) / this._difficultyRate;

        var x = -kEnemyMargin + Math.round(Math.random()) * (kBaseScreenWidth + kEnemyMargin * 2);

        var enemy = this._createGameObject(Enemy, {
            x: x,
            y: 25 + Math.round(Math.random() * 55),
            width: 14,
            height: 4
        });

        enemy.setWalkForceModifier((0.4 + Math.random() * 2.1) * this._difficultyRate);

        if (x < 0) {
            enemy.fixedHorizontalMovingState = MovingState.Right;
        } else {
            enemy.fixedHorizontalMovingState = MovingState.Left;
            enemy.node.setScaleX(-1);
        }

    },

    addResource: function(resource) {

        this.resource += resource;

    },

    // ------------------------------------------------------------------------------------------
    // INPUT
    // ------------------------------------------------------------------------------------------

    buttonUp: function(index, pressed) {

        if (pressed) {
            if (this.buttonUpPressed)
                return;
            this.buttonUpPressed = true;

            this._gatherer.verticalMovingStates.push(MovingState.Up);

        } else {

            this.buttonUpPressed = false;

            var movingStateIndex = this._gatherer.verticalMovingStates.indexOf(MovingState.Up);
            if (movingStateIndex !== -1)
                this._gatherer.verticalMovingStates.splice(movingStateIndex, 1);

        }

    },

    buttonDown: function(index, pressed) {

        if (pressed) {
            if (this.buttonDownPressed)
                return;
            this.buttonDownPressed = true;

            this._gatherer.verticalMovingStates.push(MovingState.Down);

        } else {

            this.buttonDownPressed = false;

            var movingStateIndex = this._gatherer.verticalMovingStates.indexOf(MovingState.Down);
            if (movingStateIndex !== -1)
                this._gatherer.verticalMovingStates.splice(movingStateIndex, 1);

        }

    },

    buttonLeft: function(index, pressed) {

        if (pressed) {
            if (this.buttonLeftPressed)
                return;
            this.buttonLeftPressed = true;

            this._boat.horizontalMovingStates.push(MovingState.Left);

        } else {

            this.buttonLeftPressed = false;

            movingStateIndex = this._boat.horizontalMovingStates.indexOf(MovingState.Left);
            if (movingStateIndex !== -1)
                this._boat.horizontalMovingStates.splice(movingStateIndex, 1);

        }

    },

    buttonRight: function(index, pressed) {

        if (pressed) {

            if (this.buttonRightPressed)
                return;
            this.buttonRightPressed = true;

            this._boat.horizontalMovingStates.push(MovingState.Right);

        } else {

            this.buttonRightPressed = false;

            movingStateIndex = this._boat.horizontalMovingStates.indexOf(MovingState.Right);
            if (movingStateIndex !== -1)
                this._boat.horizontalMovingStates.splice(movingStateIndex, 1);

        }

    },

    buttonA: function(index, pressed) {

        if (!pressed) {
            this.buttonAPressed = false;
            return;
        }

        if (this.buttonAPressed)
            return;
        this.buttonAPressed = true;

    },

    buttonB: function(index, pressed) {

        if (!pressed) {
            this.buttonBPressed = false;
            return;
        }

        if (this.buttonBPressed)
            return;
        this.buttonBPressed = true;

    },

    buttonStart: function(index, pressed) {
        if(pressed)
            return;

        this._gatherer.endTransfer();
        this._boat.endTransfer();

        this.unscheduleUpdate();
        this.recursivelyPauseAllChildren(this._mainLayer);
        this.setInputEnabled(false);
        this._state = StageState.Paused;

        var confirmation = new ActionConfirmation();
        confirmation.init("Restart?", this, function() {

            this._boat.endTransfer();
            this._boat.endEngine();
            this._gatherer.endTransfer();
            this._gatherer.endEngine();
            cc.AudioEngine.getInstance().stopMusic();
            cc.Director.getInstance().replaceScene(new StageScene(this._inputTypes, this._level));

        }, function() {

            this.scheduleUpdate();
            this.recursivelyResumeAllChildren(this._mainLayer);
            this.setInputEnabled(true);
            this._state = StageState.Running;

        });

        this.addChild(confirmation);

    },

    buttonSelect: function(index, pressed) {
        if(pressed)
            return;

        this._gatherer.endTransfer();
        this._boat.endTransfer();

        this.unscheduleUpdate();
        this.recursivelyPauseAllChildren(this._mainLayer);
        this.setInputEnabled(false);
        this._state = StageState.Paused;

        var confirmation = new ActionConfirmation();
        confirmation.init("Exit to main menu?", this, function() {

            this._boat.endTransfer();
            this._boat.endEngine();
            this._gatherer.endTransfer();
            this._gatherer.endEngine();
            cc.AudioEngine.getInstance().stopMusic();
            cc.Director.getInstance().replaceScene(new TitleScreenScene());

        }, function() {

            this.scheduleUpdate();
            this.recursivelyResumeAllChildren(this._mainLayer);
            this.setInputEnabled(true);
            this._state = StageState.Running;

        });

        this.addChild(confirmation);

    }

});

/**
 * @class
 * @extends cc.Scene
 */
var StageScene = cc.Scene.extend(/** @lends StageScene# */{

    _inputTypes: null,
    _level: 1,

    ctor: function(inputTypes, level) {
        this._super();
        this._inputTypes = inputTypes;
        this._level = level;
    },

    onEnter: function () {
        this._super();
        var layer = new Stage();
        layer.init(this._inputTypes, this._level);
        this.addChild(layer);
    }

});