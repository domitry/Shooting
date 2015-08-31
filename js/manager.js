/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_manager: (require("./obj_manager.js")).init(div, options),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")).init()
        });

        return this;
    },
    start: function(){
        var self = this.obj_manager.add("\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, {live_even_outside: true});

        var nf = function(){};
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, (function(){
            this.obj_manager.add("\u26AC", self.x, self.y, 0, -3);
        }).bind(this), nf, nf);

        this.enemy_manager.init(this.obj_manager, {self: self});

        // fuck'n dirty
        var key_manager = this.key_manager;
        var obj_manager = this.obj_manager;
        var enemy_manager = this.enemy_manager;
        var cnt = 0;

        (function(){
            key_manager.update();
            enemy_manager.update(cnt++);
            obj_manager.update();

            requestAnimationFrame(arguments.callee);
        })();
        
        return this;
    }
};
