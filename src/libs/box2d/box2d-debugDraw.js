
var e_shapeBit = 0x0001;
var e_jointBit = 0x0002;
var e_aabbBit = 0x0004;
var e_pairBit = 0x0008;
var e_centerOfMassBit = 0x0010;

var canvasContext = document.getElementById("gameCanvas").getContext( '2d' );

function drawAxes(ctx) {
    ctx.strokeStyle = 'rgb(192,0,0)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgb(0,192,0)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1);
    ctx.stroke();
}

function setColorFromDebugDrawCallback(color) {            
    var col = Box2D.wrapPointer(color, b2Color);
    var red = (col.get_r() * 255)|0;
    var green = (col.get_g() * 255)|0;
    var blue = (col.get_b() * 255)|0;
    var colStr = red+","+green+","+blue;
    canvasContext.fillStyle = "rgba("+colStr+",0.5)";
    canvasContext.strokeStyle = "rgb("+colStr+")";
}

function drawSegment(vert1, vert2) {
    var vert1V = Box2D.wrapPointer(vert1, b2Vec2);
    var vert2V = Box2D.wrapPointer(vert2, b2Vec2);                    
    canvasContext.beginPath();
    canvasContext.moveTo(vert1V.get_x(),vert1V.get_y());
    canvasContext.lineTo(vert2V.get_x(),vert2V.get_y());
    canvasContext.stroke();
}

function drawPolygon(vertices, vertexCount, fill) {
    canvasContext.beginPath();
    for(tmpI=0;tmpI<vertexCount;tmpI++) {
        var vert = Box2D.wrapPointer(vertices+(tmpI*8), b2Vec2);
        if ( tmpI == 0 )
            canvasContext.moveTo(vert.get_x(),vert.get_y());
        else
            canvasContext.lineTo(vert.get_x(),vert.get_y());
    }
    canvasContext.closePath();
    if (fill)
        canvasContext.fill();
    canvasContext.stroke();
}

function drawCircle(center, radius, axis, fill) {                    
    var centerV = Box2D.wrapPointer(center, b2Vec2);
    var axisV = Box2D.wrapPointer(axis, b2Vec2);
    
    canvasContext.beginPath();
    canvasContext.arc(centerV.get_x(),centerV.get_y(), radius, 0, 2 * Math.PI, false);
    if (fill)
        canvasContext.fill();
    canvasContext.stroke();
    
    if (fill) {
        //render axis marker
        var vert2V = copyVec2(centerV);
        var scaledVec = scaledVec2(axisV, radius);
        vert2V.op_add( scaledVec );
        canvasContext.beginPath();
        canvasContext.moveTo(centerV.get_x(),centerV.get_y());
        canvasContext.lineTo(vert2V.get_x(),vert2V.get_y());
        canvasContext.stroke();
        Box2D.destroy(scaledVec);
        Box2D.destroy(vert2V);
    }
}

function drawTransform(transform) {
    var trans = Box2D.wrapPointer(transform,b2Transform);
    var pos = trans.get_p();
    var rot = trans.get_q();
    
    canvasContext.save();
    canvasContext.translate(pos.get_x(), pos.get_y());
    canvasContext.scale(0.5,0.5);
    canvasContext.rotate(rot.GetAngle());
    canvasContext.lineWidth *= 2;
    drawAxes(canvasContext);
    canvasContext.restore();
}

var b2DebugDraw;

function getCanvasDebugDraw() {
    if (b2DebugDraw)
        return b2DebugDraw;

    b2DebugDraw = new Box2D.b2Draw();
            
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawSegment,
    replacement:
        function(ths, vert1, vert2, color) {                    
            setColorFromDebugDrawCallback(color);                    
            drawSegment(vert1, vert2);
        }
    }]);
    
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawPolygon,
    replacement:
        function(ths, vertices, vertexCount, color) {                    
            setColorFromDebugDrawCallback(color);
            drawPolygon(vertices, vertexCount, false);                    
        }
    }]);
    
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawSolidPolygon,
    replacement:
        function(ths, vertices, vertexCount, color) {                    
            setColorFromDebugDrawCallback(color);
            drawPolygon(vertices, vertexCount, true);                    
        }
    }]);
    
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawCircle,
    replacement:
        function(ths, center, radius, color) {                    
            setColorFromDebugDrawCallback(color);
            var dummyAxis = b2Vec2(0,0);
            drawCircle(center, radius, dummyAxis, false);
        }
    }]);
    
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawSolidCircle,
    replacement:
        function(ths, center, radius, axis, color) {                    
            setColorFromDebugDrawCallback(color);
            drawCircle(center, radius, axis, true);
        }
    }]);
    
    Box2D.customizeVTable(b2DebugDraw, [{
    original: Box2D.b2Draw.prototype.DrawTransform,
    replacement:
        function(ths, transform) {
            drawTransform(transform);
        }
    }]);
    
    return b2DebugDraw;
}