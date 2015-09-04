/*global require, module, $, jQuery*/

module.exports = {
    "hp_up": {
        char: "\u56de",
        options:{
            radius: 20,
            typename: "hp_up",
            color: "#feb24c"
        },
        apply_: function(self){
            self.recovery(10);
        }
    },
    "3way": {
        char: "\u2462",
        options:{
            radius: 20,
            typename: "3way",
            color: "#00f"
        },
        apply_: function(self){
            if(typeof self.shot_mode == "undefined"){
                self.wrap_shot(function(old_func){
                    var theta = Math.PI/3;
                    var dx = -1*self.options.shot_speed*Math.cos(theta);
                    var dy = -1*self.options.shot_speed*Math.sin(theta);
                    this.options.obj_manager.add("self_ball", "\u26AC", self.x, self.y, dx, dy);
                    this.options.obj_manager.add("self_ball", "\u26AC", self.x, self.y, -1*dx, dy);
                    old_func();
                });
            }
            self.shot_mode = "3way";
        }
    }
};
