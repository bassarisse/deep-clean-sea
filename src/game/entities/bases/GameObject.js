
/**
 * @class
 * @extends cc.Class
 */
var ContactContainer = cc.Class.extend(/** @lends ContactContainer# */{
    /** @type ContactType */
    type: ContactType.Unknown,
    /** @type GameObject */
    gameObject: null
});

/**
 * @class
 * @extends cc.Class
 */
var ContactCounter = cc.Class.extend(/** @lends ContactCounter# */{
    /** @type ContactContainer */
    contactContainer: null,
    /** @type number */
    count: 0
});

/**
 * @class
 * @extends cc.Class
 */
var GameObject = cc.Class.extend(/** @lends GameObject# */{

    // public properties

    /** @type Stage */
    stage: null,
    /** @type GameObjectState */
    state: GameObjectState.Standing,
    /** @type GameObjectType */
    type: GameObjectType.Unknown,
    /** @type cc.Node */
    node: null,
    /** @type cc.SpriteBatchNode */
    _batchNode: null,
    b2body: null,

    // "private" properties

    _shouldDie: false,
    _shouldDestroyBody: false,
    _forceNodePositionUpdate: false,

    _initProperties: null,
    _isSensor: false,
    _spriteCache: null,

    _spriteFrameName: "",
    _idleFrameName: "",

    _idleFrameCount: 0,

    _contacts: null,
    _isb2bodyDestroyed: false,
    /** @type cc.Point */
    _initialPosition: null,
    _filterCategory: null,
    _filterMask: null,

    // private methods

    /**
     *
     * @param {cc.SpriteBatchNode} batchNode
     */
    setBatchNode: function(batchNode) {
        this._batchNode = batchNode;
    },

    _setProperties: function(properties) {

        if (!properties)
            return;

        this._initProperties = properties;

        var x = properties["x"] + properties["width"] / 2;
        var y = properties["y"] + properties["height"] / 2;

        this._initialPosition = cc.p(x, y);

        if (this.node)
            this.node.setPosition(this._initialPosition);

    },

    _addCircularFixture: function(radius) {

        var scale = this.node ? this.node.getScale() : 1;

        var shape = new b2CircleShape();
        shape.set_m_radius(radius * scale / PTM_RATIO);
        this._createFixture(shape);

    },

    _addRectangularFixture: function(width, height, x, y, density) {

        var shape = new b2PolygonShape();
        var scale = this.node ? this.node.getScale() : 1;

        if (typeof x !== 'undefined' && typeof y !== 'undefined' && x !== null && y !== null) {

            createVec(x * scale / PTM_RATIO, y * scale / PTM_RATIO, function(vec) {
                shape.SetAsBox(width / 2 * scale / PTM_RATIO, height / 2 * scale / PTM_RATIO, vec, 0);
            }, this);

        } else {

            shape.SetAsBox(width / 2 * scale / PTM_RATIO, height / 2 * scale / PTM_RATIO);

        }

        this._createFixture(shape, density);

    },

    _createFixture: function(b2shape, density) {

        var contactContainer = new ContactContainer();
        contactContainer.type = ContactType.Body;
        contactContainer.gameObject = this;

        //fixture definition
        var fixtureDef = new b2FixtureDef();
        fixtureDef.set_shape(b2shape);
        fixtureDef.set_density(density || 1);
        fixtureDef.set_friction(0);
        fixtureDef.set_restitution(0);
        fixtureDef.set_isSensor(this._isSensor);

        if (this._filterCategory !== null)
            fixtureDef.get_filter().set_categoryBits(this._filterCategory);

        if (this._filterMask !== null)
            fixtureDef.get_filter().set_maskBits(this._filterMask);

        var aFixture = this.b2body.CreateFixture(fixtureDef);
        aFixture.customData = contactContainer;

    },

    _createSensorFixture: function(b2shape, contactContainer) {

        contactContainer.gameObject = this;

        //fixture definition
        var fixtureDef = new b2FixtureDef();
        fixtureDef.set_shape(b2shape);
        fixtureDef.set_density(0);
        fixtureDef.set_isSensor(true);

        //add sensor fixture
        var aFixture = this.b2body.CreateFixture(fixtureDef);
        //aFixture.SetUserData(sensorTypeContainer);
        aFixture.customData = contactContainer;

    },

    _addFixtures: function() {

    },

    _loadAnimation: function(spriteName, frames, delay, restoreOriginalFrame) {

        if (typeof restoreOriginalFrame === "undefined")
            restoreOriginalFrame = false;

        var i, frame;
        var spriteCache = this._spriteCache;
        var anim = cc.Animation.create();

        anim.setDelayPerUnit(delay);
        anim.setRestoreOriginalFrame(restoreOriginalFrame);

        if (typeof spriteName === "string") {

            if (typeof frames === "number") {
                for (i = 1; i <= frames; i++) {
                    frame = spriteCache.getSpriteFrame(spriteName + "_" + i);
                    anim.addSpriteFrame(frame);
                }
            } else if (frames.length) {
                for (i = 0; i < frames.length; i++) {
                    frame = spriteCache.getSpriteFrame(spriteName + "_" + frames[i]);
                    anim.addSpriteFrame(frame);
                }
            }

        } else {

            for (i = 0; i < spriteName.length; i++) {
                frame = spriteCache.getSpriteFrame(spriteName[i]);
                anim.addSpriteFrame(frame);
            }

        }

        return anim;

    },

    // public methods

    init: function(b2world, properties) {

        this._initialPosition = cc.p(0, 0);
        this._spriteCache = cc.SpriteFrameCache.getInstance();
        this.setContactTypes([ContactType.Body]);
        this._setProperties(properties);
        this.addBodyToWorld(b2world);
        this._addFixtures();

    },

    /**
     *
     * @returns {cc.Point}
     */
    getInitialPosition: function() {
        return this._initialPosition;
    },

    /**
     *
     * @param {ContactType[]} contactTypes
     */
    setContactTypes: function(contactTypes) {

        this._contacts = {};

        for (var c in contactTypes) {
            this._contacts[contactTypes[c]] = [];
        }

    },

    update: function(delta) {

        if (this._shouldDie) {
            this._shouldDie = false;
            this._finishDying();
        }

        if (this._shouldDestroyBody) {
            this._shouldDestroyBody = false;
            this.destroyBody();
        }

        if (this.node && (!this._isb2bodyDestroyed || this._forceNodePositionUpdate)) {
            this.updateNodePosition();
        }

        this.handleCollisions();

    },

    updateNodePosition: function() {
        var position = this.b2body.GetPosition();
        this.node.setPosition(Math.round(position.get_x() * PTM_RATIO), Math.round(position.get_y() * PTM_RATIO));
    },

    isDead: function() {
        return this.state === GameObjectState.Dead || this.state === GameObjectState.Dying;
    },

    die: function() {

        this.state = GameObjectState.Dying;

        if (this.node) {
            this.node.stopAllActions();
            this.node.runAction(cc.Sequence.create([
                cc.Blink.create(0.5, 5),
                cc.Show.create(),
                cc.CallFunc.create(this._finishDying, this)
            ]));
        } else {
            this._shouldDie = true;
        }

    },

    _finishDying: function() {

        this.destroyBody();
        this.state = GameObjectState.Dead;
        if (this.node)
            this.node.removeFromParent(true);

    },

    destroyBody: function() {
        if (this._isb2bodyDestroyed)
            return;

        this._isb2bodyDestroyed = true;
        this.b2body.GetWorld().DestroyBody(this.b2body);
    },

    addBodyToWorld: function(b2world) {

        var bodyDef = new b2BodyDef();

        bodyDef.set_type(b2_dynamicBody);
        createVec(this._initialPosition.x / PTM_RATIO, this._initialPosition.y / PTM_RATIO, function(vec) {
            bodyDef.set_position(vec);
        }, this);
        //bodyDef.set_userData(this);
        bodyDef.customData = this;
        bodyDef.set_fixedRotation(true);

        this.b2body = b2world.CreateBody(bodyDef);

    },

    addContact: function(contactType, contactContainer) {

        var contacts = this._contacts[contactType];
        if (!contacts)
            return;

        var contactCounter;

        for (var c = 0; c < contacts.length; c++) {
            contactCounter = contacts[c];
            if (contactContainer === contactCounter.contactContainer) {

                contactCounter.count++;

                return;
            }
        }

        this.startCollision(contactType, contactContainer);

        contactCounter = new ContactCounter();
        contactCounter.contactContainer = contactContainer;
        contactCounter.count = 1;

        contacts.push(contactCounter);

    },

    removeContact: function(contactType, contactContainer) {

        var contacts = this._contacts[contactType];
        if (!contacts)
            return;

        var contactCounter;

        for (var c = 0; c < contacts.length; c++) {
            contactCounter = contacts[c];
            if (contactContainer === contactCounter.contactContainer) {

                contactCounter.count--;
                if (contactCounter.count === 0) {
                    contacts.splice(c, 1);
                    this.endCollision(contactType, contactContainer);
                }

                return;
            }
        }

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    startCollision: function(contactType, contactContainer) {

    },

    /**
     *
     * @param {ContactType} contactType
     * @param {ContactContainer} contactContainer
     */
    endCollision: function(contactType, contactContainer) {

    },

    handleCollisions: function() {

        var contacts = this._contacts[ContactType.Body];

        for(var c in contacts)
        {
            /** @type ContactContainer */
            var contactContainer = contacts[c].contactContainer;
            if(!contactContainer)
                continue;

            if(contactContainer.gameObject instanceof GameObject) {
                if(!contactContainer.gameObject.isDead())
                    this.handleCollisionWithGameObject(contactContainer.gameObject, contactContainer);
                continue;
            }

            this.handleCollision(contactContainer);
        }

    },

    /**
     *
     * @param {GameObject} gameObject
     * @param {ContactContainer} contactContainer
     */
    handleCollisionWithGameObject: function (gameObject, contactContainer) {

    },

    /**
     *
     * @param {ContactContainer} contactContainer
     */
    handleCollision: function (contactContainer) {

    }

});