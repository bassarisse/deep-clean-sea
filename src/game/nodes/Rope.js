/**
 * Created by bassarisse on 08/08/14.
 */

/**
 * @class
 * @extends cc.Node
 */
var Rope = cc.Node.extend(/** @lends Rope# */{

    point1: null,
    point2: null,
    _newCanvas: null,
    _newContext: null,

    init: function() {
        this._super();
        this._newCanvas = document.createElement("canvas");
        this._newContext = this._newCanvas.getContext("2d");
    },

    draw: function(context) {
        this._super(context);

        if (!this.point1 && !this.point2)
            return;

        var locEGL = cc.EGLView.getInstance(), locEGL_ScaleX = locEGL.getScaleX(), locEGL_ScaleY = locEGL.getScaleY();

        var realScreenSize = cc.EGLView.getInstance().getFrameSize();
        var width = realScreenSize.width;
        var height = realScreenSize.height;

        var newCanvas = this._newCanvas;
        var newContext = this._newContext;

        newCanvas.width = width;
        newCanvas.height = height;
        newContext.clearRect(0, 0, width, height);

        newContext.translate(0, 0);
        newContext.scale(1, 1);
        newContext.lineWidth = 1;
        newContext.strokeStyle = "rgb(" + gbDarkestColor3.r + "," + gbDarkestColor3.g + "," + gbDarkestColor3.b + ")";
        newContext.fillStyle = "rgb(" + gbDarkestColor3.r + "," + gbDarkestColor3.g + "," + gbDarkestColor3.b + ")";

        drawLineNoAliasing(newContext, this.point1.x, this.point1.y, this.point2.x, this.point2.y);
        newContext.fill();

        var data = newContext.getImageData(0, 0, kBaseScreenWidth, kBaseScreenHeight).data;
        var newImageData = newContext.createImageData(width, height);

        for (var x = 0; x < kBaseScreenWidth; x++) {

            for (var y = 0; y < kBaseScreenHeight; y++) {

                var i = x * 4 + y * kBaseScreenWidth * 4;

                var red = data[i];
                var green = data[i + 1];
                var blue = data[i + 2];
                var alpha = data[i + 3];

                var minX = x * locEGL_ScaleX;
                var maxX = Math.round(minX + locEGL_ScaleX);
                minX = Math.round(minX);
                var minY = y * locEGL_ScaleY;
                var maxY = Math.round(minY + locEGL_ScaleY);
                minY = Math.round(minY);

                for (var a = minX; a < maxX; a++) {
                    for (var b = minY; b < maxY; b++) {
                        var u = a * 4 + b * width * 4;
                        newImageData.data[u] = red;
                        newImageData.data[u + 1] = green;
                        newImageData.data[u + 2] = blue;
                        newImageData.data[u + 3] = alpha;
                    }
                }

            }

        }

        newContext.putImageData(newImageData, 0, 0);

        context.translate(0, 0);
        context.scale(1, -1);
        context.save();
        context.drawImage(newCanvas, 0, 0, width, height);
        context.restore();

    }
});