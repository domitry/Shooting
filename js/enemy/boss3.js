/*global require , module, $, jQuery*/

var util = require("../util.js");
var effect = require("../effect.js");

function Boss3(options){
    this.options = options;
    this.obj_manager = options.obj_manager;
    
    var xy = [250, 10];
    var CS = {
        HEAD_SIZE: 30,
        OBJ_NUM: 8,
        CLOWD_HEIGHT: 90,
        CLOWD_NUM: 4,
        CLOWD_SIZE: 20
    };
    $.extend(this, CS);

    this.objs = $.map(new Array(CS.OBJ_NUM), (function(){
        var ret = this.obj_manager.add("en", "\u9f8d", xy[0], xy[1], 0, 0, {
            live_even_outside: true,
            size: CS.HEAD_SIZE,
            bold: true,
            radius: 10
        });
        ret.hp=20;
        return ret;
    }).bind(this));

    this.clowds = [];
    this.rain_roots = [];
    this.phase = 0;

    this.filo = (function(pair0, delay){
        var num = delay*(CS.OBJ_NUM-1) + 1;
        return {
            arr: (util.array(num, 0)).map(function(){return [].concat(pair0);}),
            seek: num-1,
            get: function(i){
                var j = this.index(this.seek - delay*i);
                return this.arr[j];
            },
            push: function(pair){
                this.seek = this.index(this.seek+1);
                this.arr[this.seek] = pair;
            },
            index: function(val){
                if(val >= num)return val-num;
                if(val < 0)return num+val;
                return val;
            }
        };
    })(xy, 20);

    this.head = this.objs[0];
    this.head.dx = 1;
    this.head.dy = 1;
    this.head.wrap_update(function(func){
        var ret = func();
        if(this.x<0 || this.x > options.game_width - CS.HEAD_SIZE)
            this.dx *= -1;
        if(this.y<0 || this.y > CS.CLOWD_HEIGHT - CS.HEAD_SIZE)
            this.dy *= -1;
        return ret;
    });

    this.cnt=0;
}

Boss3.prototype.generateClowds = function(){
    var cx = 20*Math.random();
    var size = this.CLOWD_SIZE;
    var dx = (this.options.game_width - cx*2)/this.CLOWD_NUM;
    
    this.clowds = util.array(this.CLOWD_NUM, 0).map(function(val, i){
        var cy = this.CLOWD_HEIGHT + 50*Math.random();
        var ret = [];
        for(var j=0; j<5; j++){
            ret.push(this.obj_manager.add("en", "\u96f2", cx + size*j, cy + 10*(j%2), 0, 0, {
                size: size,
                color: "#fff",
                radius: 5
            }));
        }
        cx += dx;
        return ret;
    }.bind(this));

    this.rain_roots = $.map(this.clowds, function(arr, i){
        return $.grep(arr, function(obj, i){return i%2;})
            .map(function(obj, i){
                return [obj.x + this.CLOWD_SIZE/2, obj.y + this.CLOWD_SIZE];
            }.bind(this));
    }.bind(this));
};

Boss3.prototype.update = function(){
    this.cnt++;
    var game_manager = this.options.game_manager;
    var self = this.options.self;

    this.filo.push([this.head.x, this.head.y]);
    
    $.each(this.objs, function(i, obj){
        var pair = this.filo.get(i);
        obj.x = pair[0];
        obj.y = pair[1];
    }.bind(this));

    //// BOSS BAR
    if(this.cnt <= 40){
        $("#boss_bar")
            .css("width", (this.cnt/40)*(this.options.game_width));
    }else{
        this.hp = this.objs.reduce(function(prev, obj){
            return prev + (obj.hp < 0 ? 0 : obj.hp);
        }, 0);
        $("#boss_bar")
            .css("width", this.hp*(this.options.game_width/(20*this.OBJ_NUM)));
    }

    if(this.phase == 0)
        return this.update0();
    else
        return this.update1();
};

Boss3.prototype.update1 = function(){
    if(this.hp == 0){
    }
    return false;
};

Boss3.prototype.update0 = function(){
    //// Generate Clowd
    if(this.cnt%500 == 0){
        this.generateClowds();
    }

    if(this.cnt%500 < 50){
        //// Fade in
        var color = parseInt(255 - (this.cnt%500)*((255 - 170)/50));
        $.each(this.clowds, function(i, arr){
            $.each(arr, function(j, clowd){
                clowd.changeColor("rgb("+[color, color, color].join(",") + ")");
            });
        });
    }else if(this.cnt%500 < 400){
        //// rain
        var cnt = this.cnt%500 - 50;
        if(cnt%100 == 0){
            var theta = (Math.PI/3)*Math.random() + Math.PI/3;
            this.rain_dx = 3*Math.cos(theta);
            this.rain_dy = 3*Math.sin(theta);
        }else if(cnt%100 < 80){
            if(cnt%100 < 60 && !(cnt%5)){
                $.each(this.rain_roots, function(i, xy){
                    this.obj_manager.add("en_ball", "\u96e8", xy[0]-5, xy[1], this.rain_dx, this.rain_dy, {
                        size: 10,
                        color: "#c0c0ff"
                    });
                }.bind(this));
            }
        }

    }else if(this.cnt%500 < 450){
        //// Fade out
        color = parseInt(170 + ((this.cnt%500 - 400))*((255 - 170)/50));
        if(color < 230){
        $.each(this.clowds, function(i, arr){
            $.each(arr, function(j, clowd){
                clowd.changeColor("rgb("+[color, color, color].join(",") + ")");
            });
        });
        }else{
            $.each(this.clowds, function(i, arr){
                $.each(arr, function(j, clowd){
                    clowd.clear();
                });
            });
            this.clowds = [];
        }
    }

    //// Fire!!
    if(self.y > this.CLOWD_HIGHT && this.cnt%50 < 25 && this.cnt%5==0){
        var dx = this.head.dx*3;
        var dy = this.head.dy*3;
        var ball = this.obj_manager.add("en_ball", "\u708e", this.head.x, this.head.y, dx, dy, {
            color: "#f00",
            size: 20
        });
        var limit_x = this.options.game_width - 10;
        var limit_y = this.CLOWD_HEIGHT;
        var COLL_MAX = 3;
        ball.coll_cnt=0;
        
        ball.wrap_update(function(func){
            if(this.x < 3 || this.x > limit_x){
                if(this.coll_cnt < COLL_MAX){
                    this.dx *= -1;
                    this.coll_cnt++;
                }
            }
            if(this.y < 3 || this.y > limit_y){
                if(this.coll_cnt < COLL_MAX){
                    this.dy *= -1;
                    this.coll_cnt++;
                }
            }
            return func();
        });
    }

    //// check if it is dead
    $.each(this.objs, function(i, obj){
        if(obj.hp<=0){
            obj.changeColor("#aaa");
        }
    });

    if(this.hp<=0){
        $.each(this.clowds, function(i, arr){
            $.each(arr, function(j, clowd){
                effect.explode(clowd.x, clowd.y, {
                    speed: 5,
                    num: 5,
                    time: 200,
                    r_max: 30
                });
                clowd.clear();
            });
        });

        $.each(this.objs, function(i, obj){
            obj.clear();
            
            effect.explode(obj.x, obj.y, {
                speed: 5,
                num: 30,
                time: 1000,
                r_max: 30
            });
        });

        this.clowds = [];
        this.phase = 0;
        return false;
    }

    return true;
};

Boss3.prototype.clear = function(){
    this.options.game_manager.add_score(10000);
    this.options.enemy_manager.next_stage();
};

module.exports = Boss3;
