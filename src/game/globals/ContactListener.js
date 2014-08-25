
var b2listener;

var createContactListener = function () {

    if (!b2listener) {
        b2listener = new b2ContactListener();

        Box2D.customizeVTable(b2listener, [
            {
                original: Box2D.b2ContactListener.prototype.BeginContact,
                replacement: function (ths, contact) {
                    contact = Box2D.wrapPointer(contact, Box2D.b2Contact);

                    var theFixtureA = contact.GetFixtureA();
                    var theFixtureB = contact.GetFixtureB();

                    b2listener.currentContacts.push({
                        fixtureA: theFixtureA,
                        fixtureB: theFixtureB
                    });

                    var contactContainerA = theFixtureA.customData;
                    var contactContainerB = theFixtureB.customData;

                    if (!(contactContainerA instanceof ContactContainer) || !(contactContainerB instanceof ContactContainer))
                        return;

                    if (contactContainerA.gameObject instanceof GameObject) {
                        contactContainerA.gameObject.addContact(contactContainerA.type, contactContainerB);
                    }
                    if (contactContainerB.gameObject instanceof GameObject) {
                        contactContainerB.gameObject.addContact(contactContainerB.type, contactContainerA);
                    }

                    /*

                     var isAGameObject = gameObjectA instanceof GameObject;
                     var isBGameObject = gameObjectB instanceof GameObject;

                     var isPlayerContact =
                     (isAGameObject && gameObjectA.type === GameObjectType.Player) ||
                     (isBGameObject && gameObjectB.type === GameObjectType.Player);

                     if (isAGameObject && gameObjectB && (!isPlayerContact || gameObjectA.type === GameObjectType.Player))
                     gameObjectA.addContact(gameObjectB);
                     else if (gameObjectA instanceof SensorTypeContainer) {
                     if (gameObjectA.gameObject && !gameObjectB)
                     gameObjectA.gameObject.addContact(gameObjectA);
                     else if (isBGameObject)
                     gameObjectB.addContact(gameObjectA);
                     }

                     if (isBGameObject && gameObjectA && (!isPlayerContact || gameObjectB.type === GameObjectType.Player))
                     gameObjectB.addContact(gameObjectA);
                     else if (gameObjectB instanceof SensorTypeContainer) {
                     if (gameObjectB.gameObject && !gameObjectA)
                     gameObjectB.gameObject.addContact(gameObjectB);
                     else if (isAGameObject)
                     gameObjectA.addContact(gameObjectB);
                     }
                     */

                }
            },
            {
                original: Box2D.b2ContactListener.prototype.EndContact,
                replacement: function (ths, contact) {
                    contact = Box2D.wrapPointer(contact, Box2D.b2Contact);

                    for (var c = 0; c < b2listener.currentContacts.length; c++) {
                        var aContact = b2listener.currentContacts[c];

                        var theFixtureA = contact.GetFixtureA();
                        var theFixtureB = contact.GetFixtureB();

                        if (aContact.fixtureA === theFixtureA && aContact.fixtureB === theFixtureB) {

                            var contactContainerA = theFixtureA.customData;
                            var contactContainerB = theFixtureB.customData;

                            if (contactContainerA.gameObject instanceof GameObject) {
                                contactContainerA.gameObject.removeContact(contactContainerA.type, contactContainerB);
                            }
                            if (contactContainerB.gameObject instanceof GameObject) {
                                contactContainerB.gameObject.removeContact(contactContainerB.type, contactContainerA);
                            }

                            /*
                             var gameObjectA = theFixtureA.customData;
                             var gameObjectB = theFixtureB.customData;

                             if (gameObjectA instanceof GameObject)
                             gameObjectA.removeContact(gameObjectB);
                             else if (gameObjectA instanceof SensorTypeContainer && gameObjectA.gameObject)
                             gameObjectA.gameObject.removeContact(gameObjectA);

                             if (gameObjectB instanceof GameObject)
                             gameObjectB.removeContact(gameObjectA);
                             else if (gameObjectB instanceof SensorTypeContainer && gameObjectB.gameObject)
                             gameObjectB.gameObject.removeContact(gameObjectB);
                             */

                            b2listener.currentContacts.splice(c, 1);
                            break;
                        }
                    }

                }
            }
        ]);

        /*
         b2listener.PostSolve = function(contact, impulse) {
         if (contact.GetFixtureA().GetBody().GetUserData() === 'ball' || contact.GetFixtureB().GetBody().GetUserData() === 'ball') {
         var impulse = impulse.normalImpulses[0];
         if (impulse < 0.2) return; //threshold ignore small impacts
         world.ball.impulse = impulse > 0.6 ? 0.5 : impulse;
         console.log(world.ball.impulse);
         }
         };

         b2listener.PreSolve = function(contact, oldManifold) {
         };
         */
    }

    b2listener.currentContacts = [];

    return b2listener;
};