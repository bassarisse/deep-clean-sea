
//to replace original C++ operator =
function copyVec2(vec) {
    return new b2Vec2(vec.get_x(), vec.get_y());
}

//to replace original C++ operator * (float)
function scaleVec2(vec, scale) {
    vec.set_x( scale * vec.get_x() );
    vec.set_y( scale * vec.get_y() );
}

//to replace original C++ operator *= (float)
function scaledVec2(vec, scale) {
    return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
}

function createChainShape(vertices, closedLoop) {
    var shape = new b2ChainShape();
    var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
    var offset = 0;
    for (var i=0;i<vertices.length;i++) {
        Box2D.setValue(buffer+(offset), vertices[i].get_x(), 'float'); // x
        Box2D.setValue(buffer+(offset+4), vertices[i].get_y(), 'float'); // y
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    if ( closedLoop )
        shape.CreateLoop(ptr_wrapped, vertices.length);
    else
        shape.CreateChain(ptr_wrapped, vertices.length);
    return shape;
}

function createPolygonShape(vertices) {
    var shape = new b2PolygonShape();
    var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
    var offset = 0;
    for (var i=0;i<vertices.length;i++) {
        Box2D.setValue(buffer+(offset), vertices[i].get_x(), 'float'); // x
        Box2D.setValue(buffer+(offset+4), vertices[i].get_y(), 'float'); // y
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
}

var b2Min = function (a, b) {
    return new b2Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
};

var b2Max = function (a, b) {
    return new b2Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
};

var createVec = function(x, y, callback, target) {
    var vec = new b2Vec2(x, y);
    callback.call(target, vec);
    Box2D.destroy(vec);
};

var destroyBox2DArray = function(arr) {
    var i = arr.length;
    while (i--) {
        Box2D.destroy(arr[i]);
        arr.splice(i, 1);
    }
};