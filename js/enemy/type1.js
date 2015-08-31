/*global require , module, $, jQuery*/

function Type1(x, y, tx, ty, time, leave_cnt, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    var dx = (tx - x)/time;
    var dy = (ty - y)/time;

    this.leave_cnt = leave_cnt;
    this.time = time;
    this.cnt = 0;
    this.hp = 10;
    this.obj = this.obj_manager.add("\u96d1", x, y, dx, dy, true, {
        color: color,
        size: 25
    });
}

Type1.prototype.update = function(){
    this.cnt++;
    if(this.cnt < this.time){
        // kon-nitiwa
        return true;
    }else if(this.cnt < this.leave_cnt){
        // ZAP-ZAP-ZAP
        this.obj.dx = 0;
        this.obj.dy = 0;

        if(this.cnt % 15 == 0){
            var dx = (this.options.self.x - this.obj.x)/100;
            var dy = (this.options.self.y - this.obj.y)/100;
            this.obj_manager.add("\u26AB", this.obj.x, this.obj.y, dx, dy, false);
        }
    }else{
        // sayo-nara
        this.obj.dy = -1;
        if(this.obj.y < 5)return false;
    }

    return true;
};

Type1.prototype.clear = function(){
    this.obj.update = function(){return false;};
};

module.exports = Type1;
