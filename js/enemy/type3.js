/*global require , module, $, jQuery*/

function Type3(x, y0, ty, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    this.time = 50;
    this.y0 = y0;
    this.ty = ty;
    this.leave_cnt = 500;
    this.cnt = 0;
    this.obj = this.obj_manager.add("en", "\u6575", x, y0, 0, 0, {
        live_even_outside: true,
        color: color,
        size: 25,
        radius: 20,
        score: 1000
    });
    this.obj.hp = 10;
}

var target_x=0, target_y=0;

Type3.prototype.update = function(){
    this.cnt++;
    
    if(this.cnt < this.time){
        var int = (this.time - this.cnt);
        this.obj.y = Math.sin((this.cnt/this.time)*(Math.PI/2))*(this.ty - this.y0) + this.y0;
        return true;
    }else if(this.cnt == this.time){
        this.ball_dx = (this.options.self.x - this.obj.x)/100;
        this.ball_dy = (this.options.self.y - this.obj.y)/100;
    }else if(this.cnt < this.time + 49){
        if(this.cnt%5==0){
            var ball = this.options.obj_manager.add("en_ball", "\u2606", this.obj.x, this.obj.y, this.ball_dx, this.ball_dy, {});
            ball.cnt = 0;

            ball.wrap_update(function(func){
                this.cnt++;
                if(this.cnt == 50){
                    this.dx = (target_x - this.x)/50;
                    this.dy = (target_y - this.y)/50;
                }
                return func();
            });
        }

    }else if(this.cnt - this.time == 50){
        target_x = this.options.self.x;
        target_y= this.options.self.y;
    }else {
        // sayo-nara
        this.obj.dy = -3;
        if(this.obj.y < 5)return false;
    }

    if(this.obj.hp <= 0){
        require("../effect.js").explode(this.obj.x, this.obj.y);
        this.options.item_manager.random_add(this.obj.x, this.obj.y, 0.1);
        return false;
    }

    return true;
};

Type3.prototype.clear = function(){
    this.obj.clear();
};

module.exports = Type3;
