/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager, _options){
        this.options = $.extend({
            self: null,
            obj_manager: obj_manager,
            game_manager: null
        }, _options);

        this.plan = require("./plan.js");
        this.enemy_type_list = require("./enemy/list.js");

        obj_manager.register_collision_rule("en", "self_ball", function(en, ball){
            en.hp--;
            ball.clear();
        });

        this.obj_manager = obj_manager;
        this.enemy_stack = [];
    },
    update: function(num){
        if(typeof this.plan[num] !== "undefined"){
            var arr = this.plan[num];

            $.each(arr, (function(i, inst){
                var et = this.enemy_type_list[inst.type];
                
                inst.arg.push(this.options);// pass information like the position of self
                var Binded = et.bind.apply(et, [null].concat(inst.arg));
                this.enemy_stack.push(new Binded());
            }).bind(this));
        }

        this.enemy_stack = $.grep(this.enemy_stack, (function(e){
            if(!e.update()){
                this.options.game_manager.score += e.score;
                e.clear();
                return false;
            };
            return true;
        }).bind(this));
    }
};
