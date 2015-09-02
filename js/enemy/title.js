/*global require , module, $, jQuery*/

function Title(msg, press_key, _options){
    this.options = $.extend({
        time: 100
    }, _options);

    this.cnt = 0;
    this.score = 0;

    this.options.div.append("<div id=\"title\"></div>");
    this.content = $("#title")
        .text(msg)
        .css({
            position: "absolute",
            top: this.options.game_height/2 - 30,
            height: 60,
            text: 50,
            width: this.options.game_width,
            "text-align": "center"
        });

    if(press_key){
        var nf = function(){};
        this.options.key_manager.register(0x0D, (function(){
            this.update = function(){return false;};
            this.options.game_manager.restart();
            this.options.enemy_manager.next_stage();
        }).bind(this), nf, nf);

        this.options.game_manager.stop(true);
    }
}

Title.prototype.update = function(){
    this.cnt++;
    if(this.cnt == this.options.time){
        this.clear();
    }
    return true;
};

Title.prototype.clear = function(){
    this.content.remove();
};

module.exports = Title;
