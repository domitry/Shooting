/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager){
        this.obj_manager = obj_manager;
    },

    explode: function(x, y, _options){
        var options = $.extend({
            speed: 10,
            r_max: 15,
            num: 10,
            char: "x",
            time: 70
        }, _options);
        
        for(var i=0; i<options.num; i++){
            //var size = parseInt(options.r_max * Math.random());
            var size = options.r_max;
            var speed = options.speed*Math.random();
            var theta = 2*Math.PI*Math.random();
            var dx = speed*Math.cos(theta);
            var dy = speed*Math.sin(theta);
            var obj = this.obj_manager.add("others", options.char, x, y, dx, dy, {
                size: size
            });
            
            obj.cnt=0;
            obj.wrap_update(function(func){
                func();
                obj.cnt++;
                if(obj.cnt < options.time)return true;
                this.clear();
                return false;
            });
        }
    }
};
