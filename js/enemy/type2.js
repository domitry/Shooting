/*global require , module, $, jQuery*/

function Type2(x, y, tx, ty, time, leave_cnt, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    var dx = (tx - x)/time;
    var dy = (ty - y)/time;

    this.leave_cnt = leave_cnt;
    this.time = time;
    this.cnt = 0;
    this.hp = 10;
    this.obj = this.obj_manager.add("\u9b5a", x, y, dx, dy, {
        live_even_outside: true,
        color: color,
        size: 25
    });
}

Type2.prototype.update = function(){
    this.cnt++;
    if(this.cnt < this.time){
        // kon-nitiwa
        return true;
    }else if(this.cnt < this.leave_cnt){
        // ZAP-ZAP-ZAP
        this.obj.dx = 0;
        this.obj.dy = 0;

        if(this.cnt % 15 == 0){
            var DIR_NUM = 8;
            var d_theta = 2*Math.PI/DIR_NUM;
            var v = 5;
            for(var i=0; i<DIR_NUM; i++){
                var dx = v*Math.cos(i*d_theta);
                var dy = v*Math.sin(i*d_theta);
                this.obj_manager.add("\u203b", this.obj.x, this.obj.y, dx, dy);
            }
        }
    }else{
        // sayo-nara
        this.obj.dy = -1;
        if(this.obj.y < 5)return false;
    }

    return true;
};

Type2.prototype.clear = function(){
    this.obj.update = function(){return false;};
};

module.exports = Type2;
