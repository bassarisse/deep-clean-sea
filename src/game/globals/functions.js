
// the function
function drawLineNoAliasing(ctx, sx, sy, tx, ty) {

    var dist = Math.ceil(dbp(sx, sy, tx, ty)); // length of line

    var lastX = -1;
    var lastY = -1;
    var nextX = -1;
    var nextY = -1;

    for(var i = 0; i < dist; i++) {
        // for each point along the line

        var x = nextX !== -1 ? nextX : Math.round(sx + (tx-sx) / dist * i);
        var y = nextY !== -1 ? nextY : Math.round(sy + (ty-sy) / dist * i);

        nextX = Math.round(sx + (tx-sx) / dist * (i + 1));
        nextY = Math.round(sy + (ty-sy) / dist * (i + 1));

        if ((nextX === x && lastX !== x && nextY !== y && lastY === y) ||
            (nextY === y && lastY !== y && nextX !== x && lastX === x))
            continue;

        lastX = x;
        lastY = y;

        ctx.fillRect(x, y, 1, 1); // fill in one pixel, 1x1

    }

// finds the distance between points
    function dbp(x1,y1,x2,y2) {
        return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    }

}