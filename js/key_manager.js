/*global require, module, $, jQuery*/

module.exports = {
    init: function(){
        $.extend(this, {
            hash: {}
        });

        $(document).on("keydown", (function(event){
            $.each(this.hash, function(k, v){
                if(k == event.keyCode){
                    v.pushed=true;
                    v.down_cb();
                }
            });
        }).bind(this));

        $(document).on("keyup", (function(event){
            $.each(this.hash, function(k, v){
                if(k == event.keyCode){
                    v.pushed=false;
                    v.up_cb();
                }
            });
        }).bind(this));

        return this;
    },
    register: function(keycode, down_f, up_f, f){
        this.hash[keycode] = {
            pushed: false,
            down_cb: down_f,
            up_cb: up_f,
            cont_cb: f
        };
    },
    update: function(){
        $.each(this.hash, function(k, v){
            if(v.pushed)v.cont_cb();
        });
    }
};
