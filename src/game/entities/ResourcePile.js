/**
 * Created by bassarisse on 09/08/14.
 */

/**
 * @class
 * @extends GameObject
 */
var ResourcePile = GameObject.extend(/** @lends ResourcePile# */{

    resource: 0,

    _addFixtures: function() {
        var properties = this._initProperties;
        var width = properties["width"];
        var height = properties["height"];
        this._addRectangularFixture(height, height);

        var shape = new b2PolygonShape();
        var scale = this.node ? this.node.getScale() : 1;
        shape.SetAsBox(width / 2 * scale / PTM_RATIO, height / 2 * scale / PTM_RATIO);

        var contactContainer = new ContactContainer;
        contactContainer.type = ContactType.Body;

        this._createSensorFixture(shape, contactContainer);
    },

    init: function(b2world, properties) {

        this.node = cc.Sprite.createWithSpriteFrameName("resource" + (1 + Math.round(Math.random() * 3)));
        this.type = GameObjectType.ResourcePile;

        this._filterCategory = EntityFilterCategory.ResourcePile;
        this._filterMask = 0xffff & ~(EntityFilterCategory.Actor|EntityFilterCategory.ResourcePile|EntityFilterCategory.Enemy);

        this._super(b2world, properties);

        this.resource = kResourceBase + Math.round(Math.random() * kResourceBase * 9);

        this.node.runAction(cc.Sequence.create([
            cc.Blink.create(0.8, 8),
            cc.Show.create()
        ]));

    },

    update: function(delta) {
        this._super(delta);

        if (this.resource <= 0 && !this.isDead())
            this.die();

        if (this.node) {
            var parent = this.node.getParent();
            if (parent)
                parent.reorderChild(this.node, -1);
        }
    },

    die: function() {
        this._shouldDestroyBody = true;
        this._super();
    },

    canGather: function () {
        return !this.isDead() && this.resource > 0;
    }

});