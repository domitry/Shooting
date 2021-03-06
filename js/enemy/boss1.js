/*global require , module, $, jQuery*/

function Boss1(tx, ty, time, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    ///// tsuyoi
    var TSUYOI_WIDTH = 50;
    this.tsuyoi_offset = TSUYOI_WIDTH/2;
    var cx = tx-this.tsuyoi_offset;
    var cy = 0;
    var dy = (ty - cy)/time;

    this.time = time;
    this.cnt = 0;
    this.tsuyoi = this.obj_manager.add("en", "\u5f37", cx, cy, 0, dy, {
        live_even_outside: true,
        size: TSUYOI_WIDTH,
        bold: true,
        radius: 25
    });
    this.tsuyoi.hp = 50;

    ///// yowai
    this.yowais = [];
    var YOWAI_NUM = 8, YOWAI_WIDTH = 30;
    this.yowai_offset = YOWAI_WIDTH/2;
    this.diff_theta = 2*Math.PI/YOWAI_NUM;
    this.r = 60;
    
    for(var i=0; i<YOWAI_NUM; i++){
        var x = cx + this.r*Math.cos(i*this.diff_theta) + YOWAI_WIDTH/2;
        var y = cy + this.r*Math.sin(i*this.diff_theta) + YOWAI_WIDTH/2;

        this.yowais.push(this.obj_manager.add("en", "\u5f31", x, y, 0, dy, {
            live_even_outside: true,
            size: YOWAI_WIDTH,
            bold: true,
            radius: 10
        }));
    }

    $.each(this.yowais, function(i, yowai){
        yowai.hp=5;
    });

    this.shooting_yowai = 0;
}

Boss1.prototype.update = function(){
    this.cnt++;
    var d_theta = Math.PI/200;

    //// move to the start position
    if(this.cnt == this.time){
        this.tsuyoi.dy=0;
        $.each(this.yowais, function(i, yowai){yowai.dy = 0;});
    }

    //// Change BOSS Bar
    if(this.cnt < this.time){
        $("#boss_bar").css("width", this.cnt*(this.options.game_width/this.time));
    }else{
        $("#boss_bar")
            .css("width", this.tsuyoi.hp*(this.options.game_width/50));
    }

    //// rotate yowai
    if(this.cnt > this.time){
        var cx = this.tsuyoi.x;
        var cy = this.tsuyoi.y;

        $.each(this.yowais, (function(i, yowai){
            var offset_theta = this.diff_theta*i;
            yowai.x = cx + this.r*Math.cos((this.cnt - this.time)*d_theta + offset_theta)
                + this.yowai_offset;
            yowai.y = cy + this.r*Math.sin((this.cnt - this.time)*d_theta + offset_theta)
                + this.yowai_offset;
        }).bind(this));
    }

    //// change the color of yowai
    if((this.cnt - this.time)%500 == 0){
        this.shooting_yowai = (this.shooting_yowai + 1)%2;
        $.each(this.yowais, (function(i, yowai){
            if(i%2 == this.shooting_yowai)
                yowai.changeColor("#f00");
            else
                yowai.changeColor("#000");
        }).bind(this));
    }

    //// shoot from yowai
    if((this.cnt - this.time)%50 == 0){
        $.each(this.yowais, (function(i, yowai){
            if(i%2 == this.shooting_yowai && yowai.hp>0){
                var dx = (this.options.self.x - yowai.x)/100;
                var dy = (this.options.self.y - yowai.y)/100;
                var b = this.obj_manager.add("en_ball", "\u26AB", yowai.x, yowai.y, dx, dy);
                b.changeColor("#f00");
            }
        }).bind(this));
    }

    if((this.cnt - this.time)%500 > 400){
        //// beam tsuyoi
        var y = this.tsuyoi.y + this.tsuyoi_offset;
        var cx = this.tsuyoi.x + this.tsuyoi_offset - 15;
        var o = {color: "#ff8000", size: 30};
        var bc = this.obj_manager.add("en_ball", "\u25a0", cx, y, 0, 20, o);
        var bl = this.obj_manager.add("en_ball", "\u25a0", cx-20, y, 0, 20, o);
        var br = this.obj_manager.add("en_ball", "\u25a0", cx+20, y, 0, 20, o);
        
    }else{
        //// move tsuyoi
        var dx = (this.options.self.x - this.tsuyoi.x > 0 ? 1 : -1);
        this.tsuyoi.x += dx;

        //// change tusyoi color
        var d = 255/400;
        var red = parseInt(d*((this.cnt - this.time)%500));
        this.tsuyoi.changeColor("rgb("+red +",0,0)");
    }

    var effect = require("../effect.js");
    var game_manager = this.options.game_manager;

    //// check if it is dead
    $.each(this.yowais, function(i, yowai){
        if(yowai.hp <= 0){
            yowai.wrap_update(function(){
                game_manager.score += 100;
                effect.explode(yowai.x, yowai.y);
                yowai.clear();
                return false;
            });
        }
    });

    if(this.tsuyoi.hp <= 0){
        effect.explode(this.tsuyoi.x, this.tsuyoi.y, {
            speed: 5,
            num: 30,
            time: 1000,
            r_max: 30
        });
        return false;
    }

    return true;
};

Boss1.prototype.clear = function(){
    //// Game clear
    this.options.game_manager.add_score(10000);
    this.options.enemy_manager.next_stage();

    var ret_false = function(){return false;};

    $.each(this.yowais, function(i, yowai){
        yowai.clear();
    });
    this.tsuyoi.clear();
};

module.exports = Boss1;
