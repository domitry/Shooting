/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_stack: {
                "self": [],
                "en": [],
                "self_ball": [],
                "en_ball": [],
                "others": []
            },
            rules: {}
        });

        return this;
    },

    add: function(type, str, x, y, dx, dy, options){
        var Object = require("./object.js");
        var obj = new Object(this.div, str, x, y, dx, dy, options);

        this.obj_stack[type].push(obj);
        return obj;
    },

    update: function(frame_num){
        var options = this.options;

        $.each(this.obj_stack, (function(key, stack){
            this.obj_stack[key] = $.grep(stack, function(o){
                var res = o.update();

                if(!res || ((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.options.live_even_outside)){
                    o.clear();
                    return false;
                }

                return true;
            });
        }).bind(this));

        var is_collision = function(obj1, obj2){
            var c1 = obj1.center();
            var c2 = obj2.center();
            var d_c = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
            return d_c < (obj1.options.radius + obj2.options.radius);
        };

        $.each(this.obj_stack, (function(key, stack){
            if(typeof this.rules[key] != "undefined"){
                var dst_stack = this.obj_stack[this.rules[key].dst];
                var callback = this.rules[key].cb;

                $.each(stack, function(i, src){
                    $.each(dst_stack, function(i, dst){
                        if(is_collision(src, dst)){
                            callback(src, dst);
                        }
                    });
                });
            };
        }).bind(this));
    },

    register_collision_rule: function(src, dst, callback){
        this.rules[src] = {
            dst: dst,
            cb: callback
        };
    }
};
