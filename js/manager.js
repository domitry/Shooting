/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({
            div: div
        }, _options);

        var managers = {
            game_manager: this,
            obj_manager: (require("./obj_manager.js")).init(div, options),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")).init(),
            effect_system: (require("./effect.js"))
        };

        $.extend(this, {
            div: div,
            options: options,
            score: 0
        });

        $.extend(this, managers);
        $.extend(this.options, managers);

        return this;
    },
    start: function(){
        var self = this.obj_manager.add("self", "\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, {
            radius: 10,
            live_even_outside: true
        });
        self.hp = 50;

        this.obj_manager.register_collision_rule("self", "en_ball", (function(self, ball){
            self.hp--;
            $("#self_bar").css("width", (this.options.game_width/50)*(self.hp < 0 ? 0 : self.hp));
            ball.clear();

            if(self.hp <= 0){
                this.effect_system.explode(self.x, self.y);
                this.game_over();
            }
        }).bind(this));

        var nf = function(){};
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, (function(){
            this.obj_manager.add("self_ball", "\u26AC", self.x, self.y, 0, -3);
        }).bind(this), nf, nf);

        this.enemy_manager.init(this.obj_manager, $.extend({self: self}, this.options));
        this.effect_system.init(this.obj_manager);

        // fuck'n dirty
        var key_manager = this.key_manager;
        var obj_manager = this.obj_manager;
        var enemy_manager = this.enemy_manager;
        var cnt = 0;

        var stop_flag = false;
        this.stop = function(flag){
            stop_flag = flag;
        };

        var thisObj = this; //....
        var update_score = function(){
            var text = "score: " + ("00000" + (thisObj.score)).slice(-6);
            $("#score").text(text);
        };

        this.reset_cnt = function(){
            cnt=0;
        };

        
        this.restart = function(){
            stop_flag = false;

            (function(){
                key_manager.update();
                enemy_manager.update(cnt++);
                obj_manager.update();
                update_score();

                if(!stop_flag)
                    requestAnimationFrame(arguments.callee);
            })();
        };

        this.restart();
        return this;
    },
    game_over: function(){
        this.stop(true);
        this.div.append("<div> Game Over... </div>");
    },
    clear: function(){
        this.stop(true);
        this.div.append("<div> Game Clear!!! </div>");
    }
};
