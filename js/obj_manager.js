/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_stack: []
        });

        return this;
    },

    add: function(str, x, y, dx, dy, live_even_outside, options){
        var Object = require("./object.js");
        var obj = new Object(this.div, str, x, y, dx, dy, options);
        obj.live_even_outside = live_even_outside;

        this.obj_stack.push(obj);

        return obj;
    },

    update: function(frame_num){
        var options = this.options;

        this.obj_stack = $.grep(this.obj_stack, function(o){
            var res = o.update();

            if(!res || ((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.live_even_outside)){
                o.clear();
                return false;
            }

            return true;
        });
    }
};
