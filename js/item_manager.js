/*global require, module, $, jQuery*/

module.exports = {
    init: function(options){
        this.options = options;
        this.item_list = require("./item/list.js");
        
         options.obj_manager.register_collision_rule("self", "item", function(self, item){
             var tn = item.options.typename;
             this.item_list[tn].apply_(self);
             item.clear();
        }.bind(this));
    },
    add: function(type, x, y){
        var i = this.item_list[type];
        var item = this.options.obj_manager.add("item", i.char, x, y, 0, 1, i.options);
        item.wrap_update(this.update);
    },
    update: function(old_func){
        this.dy += 0.3;
        return old_func();
    },
    random_add: function(x, y, p, type){
        if(typeof type == "undefined"){
            var keys = Object.keys(this.item_list);
            type= keys[Math.floor(Math.random() * keys.length)];
        }
        if(p < Math.random()){
            this.add(type, x, y);
        };
    }
};
