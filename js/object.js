/*global require, module, $, jQuery*/

var util = require("./util.js");

function Object(parent, str, x, y, dx, dy, _options){
    this.options = $.extend({
        size: 18,
        bold: false,
        color: "#000",
        radius: 3,
        live_even_outside: false,
        score: 0
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

Object.prototype.wrap_update = function(new_func){
    var old_func = this.update;
    this.update = function(){
        return new_func.call(this, old_func.bind(this));
    };
};

Object.prototype.changeColor = function(color){
    this.selection.css({
        color: color
    });
};

Object.prototype.clear = function(){
    this.options.game_manager.add_score(this.options.score);
    this.wrap_update(util.ret_f);
    this.selection.remove();
};

Object.prototype.box = function(){
    return this.selection[0].getBoundingClientRect();
};

Object.prototype.center = function(){
    var rect = this.box();
    return {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
};

module.exports = Object;
