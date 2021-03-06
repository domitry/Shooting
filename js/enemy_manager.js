/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager, _options){
        this.options = $.extend({
            self: null,
            obj_manager: obj_manager,
            game_manager: null
        }, _options);

        this.plans = require("./plan.js");
        this.plan = this.plans[0];
        this.seek = 0;
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
                e.clear();
                return false;
            };
            return true;
        }).bind(this));
    },
    next_stage: function(){
        this.plan = this.plans[++this.seek];
        this.options.game_manager.reset_cnt();
    }
};
