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
            obj_stack: {},
            rules: {}
        });

        $.each(types, function(i, name){
            this.obj_stack[name] = [];
        }.bind(this));
   
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
                var ret = o.update();
                if(((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.options.live_even_outside)){
                    o.clear();
                    return false;
                }
                return ret;
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
                $.each(this.rules[key], function(i, rule){
                    var dst_stack = this.obj_stack[rule.dst];
                    var callback = rule.cb;
                    
                    $.each(stack, function(i, src){
                        $.each(dst_stack, function(i, dst){
                            if(is_collision(src, dst)){
                                callback(src, dst);
                            }
                        });
                    });
                }.bind(this));
            }
        }).bind(this));
    },
    
    register_collision_rule: function(src, dst, callback){
        if(typeof this.rules[src] == "undefined")
            this.rules[src] = [];

        this.rules[src].push({
            dst: dst,
            cb: callback
        });
    }
};
