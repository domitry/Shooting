/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({
            div: div
        }, _options);

        var managers = {
            game_manager: this,
            obj_manager: (require("./obj_manager.js")),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")),
            item_manager: (require("./item_manager.js")),
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
        this.obj_manager.init(["en", "en_ball", "self", "self_ball", "item", "others"], this.options),
        this.key_manager.init(this.options);
        this.item_manager.init(this.options);
        this.effect_system.init(this.obj_manager);

        var self = this.obj_manager.add("self", "\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, {
            size: 18,
            radius: 10,
            live_even_outside: true,
            hp: 50,
            hp_max: 50,
            hp_rest: 0,
            shot_speed: 6
        });
        
        self.wrap_update(function(func){
            var limit_x = this.options.game_width - self.options.size;
            var limit_y = this.options.game_height - self.options.size;
            if(this.x < 0)this.x=0;
            else if(this.x > limit_x)this.x = limit_x;
            if(this.y < 0)this.y=0;
            else if(this.y > limit_y)this.y = limit_y;

            if(this.options.hp_rest > 0){
                this.options.hp += 1;
                this.options.hp_rest--;
            }
            return func();
        });

        self.recovery = function(val){
            var o = this.options;
            o.hp_rest += val;
            if(o.hp + o.hp_rest > o.hp_max){
                o.hp_rest = o.max_val - o.hp;
            }
        };

        self.shot = function(){
            this.options.obj_manager.add("self_ball", "\u26AC", self.x, self.y, 0, -1*this.options.shot_speed);
        };

        self.wrap_shot = function(new_func){
            var old_func = this.shot;
            this.shot = function(){
                new_func.call(this, old_func.bind(this));
            };
        };
        
        this.obj_manager.register_collision_rule("self", "en_ball", (function(self, ball){
            self.options.hp--;
            $("#self_bar").css("width", (this.options.game_width/50)*(self.options.hp < 0 ? 0 : self.options.hp));
            ball.clear();
            
            if(self.options.hp <= 0){
                this.effect_system.explode(self.x, self.y);
                this.game_over();
            }
        }).bind(this));

        var cnt = 0;
        var nf = require("./util.js").ret_no;
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, nf, nf, (function(){if(cnt%5 == 0)self.shot();}));
        this.enemy_manager.init(this.obj_manager, $.extend({self: self}, this.options));
        
        //// Main loop
        (function(){
            var score_rest = 0;
            
            this.add_score = function(val){
                score_rest += val;
            };

            var update_score = function(){
                if(score_rest > 0){
                    score_rest -= 50;
                    this.score += 50;
                    var text = "score: " + ("00000" + (this.score)).slice(-6);
                    $("#score").text(text);
                }
            }.bind(this);
            
            var stop_flag = false;
            this.stop = function(flag){
                stop_flag = flag;
            };
            
            this.reset_cnt = function(){
                cnt=0;
            };
            
            var thisObj = this;
            this.restart = function(){
                stop_flag = false;
                
                (function(){
                    thisObj.key_manager.update();
                    thisObj.enemy_manager.update(cnt++);
                    thisObj.obj_manager.update();
                    update_score();

                    if(!stop_flag)
                        requestAnimationFrame(arguments.callee);
                })();
            };
        }).call(this);

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
