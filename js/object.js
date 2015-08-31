/*global require, module, $, jQuery*/

function Object(parent, str, x, y, dx, dy, _options){
    this.options = $.extend({
        size: 18,
        bold: false,
        color: "#000"
    }, _options);

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    var new_id = require("./util.js").uuid();
    parent.append("<div id=\"" + new_id + "\">" + str + "</div>");
    this.selection = $("#" + new_id)
        .css({
            "position": "absolute",
            "font-size": this.options.size,
            "font-weight": (this.options.bold ? "bold" : "normal"),
            "color": this.options.color
        });
    
    return this;
}

Object.prototype.update = function(){
    this.x += this.dx;
    this.y += this.dy;

    this.selection.css({
        "left": this.x,
        "top": this.y
    });

    return true;
};

Object.prototype.changeColor = function(color){
    this.selection.css({
        color: color
    });
};

Object.prototype.clear = function(){
    this.selection.remove();
};

Object.prototype.box = function(){
    return this.selection[0].getBoundingClientRect();
};

module.exports = Object;
