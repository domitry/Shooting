(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"../effect.js":1}],3:[function(require,module,exports){
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

},{"../effect.js":1,"../util.js":19}],4:[function(require,module,exports){
/*global require , module, $, jQuery*/

var util = require("../util.js");
var effect = require("../effect.js");
var EPS = 1e-2;

//// SPIDER  ////
function Boss4(options){
    this.options = options;
    $.extend(this, {
        hins : [],
        fores : [],
        eyes : [],
        body0: null,
        body1: null,
        l0s : util.mul([20, 20, 20, 30], 2),
        l1s : util.mul([40, 50, 50, 30], 2),
        l0_num: [],
        l1_num: [],
        thetas: util.mul([0.10471975511965977, -0.2, -1.0471975511965976, -1.2707963267948965],2),
        phis: util.mul([1.3707963267948966, 1, -0.2, -1.0707963267948966], 2),
        size0: 50,
        size1: 30,
        eye_size: 15,
        leg_size: 3,
        cnt: 0
    });

    var thisObj = this;

    window.changeAngle = function(i, angle){
        thisObj.thetas[i] = angle;
        thisObj.thetas[i+4] = angle;
    };

    window.changeAngle2 = function(i, angle){
        thisObj.phis[i] = angle;
        thisObj.phis[i+4] = angle;
    };

    this.l0_num = $.map(this.l0s, function(l0, i){
        return Math.floor((l0/this.leg_size)/2);
    }.bind(this));

    this.l1_num = $.map(this.l1s, function(l1, i){
        return Math.floor((l1/this.leg_size)/2);
    }.bind(this));
    
    this.body0 = options.obj_manager.add("en", "\u8718", 0, 0, 0, 0, {
        live_even_outside: true,
        size: this.size0,
        radius: this.size0*0.8/2,
        hp_max: 100
     });
    
    this.body1 = options.obj_manager.add("en", "\u86db", 0, 0, 0, 0, {
        live_even_outside: true,
        size: this.size1,
        radius: this.size1*0.8/2,
        hp_max: 100
    });
    
    this.eyes = $.map([0, 0], function(){
        return options.obj_manager.add("others", "\u76ee", 0, 0, 0, 0, {
            live_even_outside: true,
            size: this.eye_size
        });
    }.bind(this));

    this.hins = this.l0_num.map(function(num, i){
        return util.array(num, 0).map(function(){
            return options.obj_manager.add("others", "\u8db3", 0, 0, 0, 0, {
                live_even_outside: true,
                size: this.leg_size
            });
         }.bind(this));
    }.bind(this));

    this.fores = this.l1_num.map(function(num, i){
        return util.array(num, 0).map(function(){
            return options.obj_manager.add("others", "\u8db3", 0, 0, 0, 0, {
                live_even_outside: true,
                size: this.leg_size
            });
        }.bind(this));
    }.bind(this));

    this.center = function(){
        return this.body0.center();
    };

    (function(){
        var gen_angle = function(){
            return (Math.PI/50)*2*(Math.random() - 0.5);
        };
        
        this.id_thetas = [].concat(this.thetas);
        this.id_phis = [].concat(this.phis);
        this.t_thetas = util.array(this.thetas.length, 0);
        this.t_phis = util.array(this.thetas.length, 0);
        
        this.set_random_theta = function(i){
            this.t_thetas[i] = this.id_thetas[i] + gen_angle();
        }.bind(this);

        this.set_random_phi = function(i){
            this.t_phis[i] = this.id_phis[i] +gen_angle();
        }.bind(this);
        
        var arr = util.array(this.thetas.length, 0);
        $.each(arr, function(i){this.set_random_theta(i);}.bind(this));
        $.each(arr, function(i){this.set_random_phi(i);}.bind(this));
    }.bind(this))();

    this.body0.hp = this.body0.options.hp_max;
    this.body1.hp = this.body1.options.hp_max;

    return this;
};

Boss4.prototype.move = function(x, y, thetas, phis){
    //// bodies
    var c = {x: x, y: y};

    this.body0.x = c.x - this.size0/2;
    this.body0.y = c.y - this.size0/2;
    this.body1.x = x - this.size1/2;
    this.body1.y = y + this.size0/2;
    
    this.changeColor = function(i, j, c){
        this.hins[i][j].changeColor(c);
    };

    //// legs
    $.each([1, -1], function(j, dx){
        $.each([-0.5, 0.1, 0.7, 1.2], function(k, dy){
            var i = 4*j + k;
            var hs = this.size0/2;
            
            var j0 = {
                x: c.x + (dx * hs) - this.leg_size,
                y: c.y + (dy * hs)
            };
            
            var j1 = {
                x: j0.x + dx*this.l0s[i]*Math.cos(thetas[i]),
                y: j0.y - this.l0s[i]*Math.sin(thetas[i])
            };
            
            var j2 = {
                x: j1.x + dx*this.l1s[i]*Math.cos(phis[i]),
                y: j1.y - this.l1s[i]*Math.sin(phis[i])
            };
            
            var dx_ = (j1.x - j0.x)/this.l0_num[i];
            var dy_ = (j1.y - j0.y)/this.l0_num[i];

            $.each(this.hins[i], function(n, obj){
                obj.x = j0.x + dx_*n - this.leg_size/2;
                obj.y = j0.y + dy_*n - this.leg_size/2;
            }.bind(this));
            
            dx_ = (j2.x - j1.x)/this.l1_num[i];
            dy_ = (j2.y - j1.y)/this.l1_num[i];
            
            $.each(this.fores[i], function(n, obj){
                obj.x = j1.x + dx_*n - this.leg_size/2;
                obj.y = j1.y + dy_*n - this.leg_size/2;
            }.bind(this));
        }.bind(this));
    }.bind(this));


    //// eyes
    $.each([-0.5, 0.5], function(i, dx){
        this.eyes[i].x = c.x + dx*(this.size0/3) - (this.eye_size/2);
        this.eyes[i].y = c.y - this.size0/2 - this.eye_size;
    }.bind(this));
};

Boss4.prototype.update = function(){
    if(this.cnt%2 == 0){
        if(this.cnt <= 200){
            var y = this.cnt - 100;
            $("#boss_bar").css("width", (this.cnt/200)*(this.options.game_width));
        }else{
            y = 100;
            var hp_max = this.body0.options.hp_max + this.body0.options.hp_max;
            var hp = this.body0.hp + this.body1.hp;
            $("#boss_bar").css("width", (hp/hp_max)*(this.options.game_width));
        }

        //// WAKI-WAKI
        $.each(this.thetas, function(i, theta) {
            if(Math.abs(theta - this.t_thetas[i]) < EPS){
                this.set_random_theta(i);
            }else{
                this.thetas[i] += (this.t_thetas[i] - theta)/2;
            }
        }.bind(this));

        $.each(this.phis, function(i, phi){
            if(Math.abs(phi - this.t_phis[i]) < EPS){
                this.set_random_phi(i);
            }else{
                this.phis[i] += (this.t_phis[i] - phi)/3;
            }
        }.bind(this));

        //// check if it is dead
        if(this.body0.hp + this.body1.hp<=0){
            $.each(this.eyes, function(i, eye){
                eye.changeText("X");
            });
        }

        this.move(100, y, this.thetas, this.phis);
    }
    this.cnt++;
    return true;
};

Boss4.prototype.clear = function(){
    this.options.game_manager.add_score(10000);
    this.options.enemy_manager.next_stage();
};

module.exports = Boss4;

},{"../effect.js":1,"../util.js":19}],5:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    title: require("./title.js"),
    type1: require("./type1.js"),
    type2: require("./type2.js"),
    type3: require("./type3.js"),
    boss1: require("./boss1.js"),
    boss3: require("./boss3.js"),
    boss4: require("./boss4.js")
};

},{"./boss1.js":2,"./boss3.js":3,"./boss4.js":4,"./title.js":6,"./type1.js":7,"./type2.js":8,"./type3.js":9}],6:[function(require,module,exports){
/*global require , module, $, jQuery*/

function Title(msg, press_key, _options){
    this.options = $.extend({
        time: 100
    }, _options);

    this.cnt = 0;
    this.score = 0;

    this.options.div.append("<div id=\"title\"></div>");
    this.content = $("#title")
        .html(msg)
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

},{}],7:[function(require,module,exports){
/*global require , module, $, jQuery*/

function Type1(x, y, tx, ty, time, leave_cnt, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    var dx = (tx - x)/time;
    var dy = (ty - y)/time;

    this.leave_cnt = leave_cnt;
    this.time = time;
    this.cnt = 0;
    this.obj = this.obj_manager.add("en", "\u96d1", x, y, dx, dy, {
        live_even_outside: true,
        color: color,
        size: 25,
        radius: 20,
        score: 1000
    });
    this.obj.hp = 10;
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
            this.obj_manager.add("en_ball", "\u26AB", this.obj.x, this.obj.y, dx, dy);
        }
    }else{
        // sayo-nara
        this.obj.dy = -3;
        if(this.obj.y < 5)return false;
    }

    if(this.obj.hp <= 0){
        require("../effect.js").explode(this.obj.x, this.obj.y);
        this.options.item_manager.random_add(this.obj.x, this.obj.y, 0.5, "hp_up");
        
        return false;
    }

    return true;
};

Type1.prototype.clear = function(){
    this.obj.clear();
};

module.exports = Type1;

},{"../effect.js":1}],8:[function(require,module,exports){
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
    this.obj = this.obj_manager.add("en", "\u9b5a", x, y, dx, dy, {
        live_even_outside: true,
        color: color,
        size: 25,
        radius: 20,
        score: 1000
    });
    this.obj.hp = 10;
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
            var DIR_NUM = 10;
            var d_theta = 2*Math.PI/DIR_NUM;
            var v = 5;
            for(var i=0; i<DIR_NUM; i++){
                var dx = v*Math.cos(i*d_theta);
                var dy = v*Math.sin(i*d_theta);
                this.obj_manager.add("en_ball", "\u203b", this.obj.x, this.obj.y, dx, dy);
            }
        }
    }else{
        // sayo-nara
        this.obj.dy = -3;
        if(this.obj.y < 5)return false;
    }

    if(this.obj.hp <= 0){
        require("../effect.js").explode(this.obj.x, this.obj.y);
        this.options.item_manager.random_add(this.obj.x, this.obj.y, 0.3, "3way");
        return false;
    }

    return true;
};

Type2.prototype.clear = function(){
    this.obj.clear();
};

module.exports = Type2;

},{"../effect.js":1}],9:[function(require,module,exports){
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

},{"../effect.js":1}],10:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager, _options){
        this.options = $.extend({
            self: null,
            obj_manager: obj_manager,
            game_manager: null
        }, _options);

        this.plans = require("./plan.js");
        this.plan = this.plans[0];
        this.seek = 0;
        this.enemy_type_list = require("./enemy/list.js");

        obj_manager.register_collision_rule("en", "self_ball", function(en, ball){
            en.hp--;
            ball.clear();
        });

        this.obj_manager = obj_manager;
        this.enemy_stack = [];
    },
    update: function(num){
        if(typeof this.plan[num] !== "undefined"){
            var arr = this.plan[num];

            $.each(arr, (function(i, inst){
                var et = this.enemy_type_list[inst.type];
                
                inst.arg.push(this.options);// pass information like the position of self
                var Binded = et.bind.apply(et, [null].concat(inst.arg));
                this.enemy_stack.push(new Binded());
            }).bind(this));
        }

        this.enemy_stack = $.grep(this.enemy_stack, (function(e){
            if(!e.update()){
                e.clear();
                return false;
            };
            return true;
        }).bind(this));
    },
    next_stage: function(){
        this.plan = this.plans[++this.seek];
        this.options.game_manager.reset_cnt();
    }
};

},{"./enemy/list.js":5,"./plan.js":18}],11:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = function(_options){
    var options = $.extend({
        game_width: 500,
        game_height: 300
    }, _options);

    $("#msgs_div")
        .append("<div id=\"stage\"></div>");

    $("#msgs_div")
        .append("<div id=\"self_bar\"></div>");

    $("#msgs_div")
        .append("<div id=\"boss_bar\"></div>");

    $("#msgs_div")
        .append("<div id=\"score\">score: 000000</div>");

    var stage = $("#stage")
            .css({
                width: options.game_width,
                height: options.game_height,
                border: "solid 3px #000",
                position: "relative",
                padding: 0
            });

    $("#self_bar")
        .css({
            position: "relative",
            width: options.game_width,
            height: "10px",
            "background-color": "#00f"
        });

    $("#boss_bar")
        .css({
            position: "relative",
            width: "0px",
            height: "10px",
            "background-color": "#f00"
        });

    (require("./manager.js"))
        .init(stage, options)
        .start();
};

},{"./manager.js":15}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./item/list.js":12}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({
            div: div
        }, _options);

        var managers = {
            game_manager: this,
            obj_manager: (require("./obj_manager.js")),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")),
            item_manager: (require("./item_manager.js")),
            effect_system: (require("./effect.js"))
        };
        
        $.extend(this, {
            div: div,
            options: options,
            score: 0
        });

        $.extend(this, managers);
        $.extend(this.options, managers);

        return this;
    },
    start: function(){
        this.obj_manager.init(["en", "en_ball", "self", "self_ball", "item", "others"], this.options),
        this.key_manager.init(this.options);
        this.item_manager.init(this.options);
        this.effect_system.init(this.obj_manager);

        var self = this.obj_manager.add("self", "\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, {
            size: 18,
            radius: 10,
            live_even_outside: true,
            hp: 50,
            hp_max: 50,
            hp_rest: 0,
            shot_speed: 6
        });
        
        self.wrap_update(function(func){
            var limit_x = this.options.game_width - self.options.size;
            var limit_y = this.options.game_height - self.options.size;
            if(this.x < 0)this.x=0;
            else if(this.x > limit_x)this.x = limit_x;
            if(this.y < 0)this.y=0;
            else if(this.y > limit_y)this.y = limit_y;

            if(this.options.hp_rest > 0){
                this.options.hp += 1;
                this.options.hp_rest--;
            }
            return func();
        });

        self.recovery = function(val){
            var o = this.options;
            o.hp_rest += val;
            if(o.hp + o.hp_rest > o.hp_max){
                o.hp_rest = o.max_val - o.hp;
            }
        };

        self.shot = function(){
            this.options.obj_manager.add("self_ball", "\u26AC", self.x, self.y, 0, -1*this.options.shot_speed);
        };

        self.wrap_shot = function(new_func){
            var old_func = this.shot;
            this.shot = function(){
                new_func.call(this, old_func.bind(this));
            };
        };
        
        this.obj_manager.register_collision_rule("self", "en_ball", (function(self, ball){
            self.options.hp--;
            $("#self_bar").css("width", (this.options.game_width/50)*(self.options.hp < 0 ? 0 : self.options.hp));
            ball.clear();
            
            if(self.options.hp <= 0){
                this.effect_system.explode(self.x, self.y);
                this.game_over();
            }
        }).bind(this));

        var cnt = 0;
        var nf = require("./util.js").ret_no;
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, nf, nf, (function(){if(cnt%5 == 0)self.shot();}));
        this.enemy_manager.init(this.obj_manager, $.extend({self: self}, this.options));
        
        //// Main loop
        (function(){
            var score_rest = 0;
            
            this.add_score = function(val){
                score_rest += val;
            };

            var update_score = function(){
                if(score_rest > 0){
                    score_rest -= 50;
                    this.score += 50;
                    var text = "score: " + ("00000" + (this.score)).slice(-6);
                    $("#score").text(text);
                }
            }.bind(this);
            
            var stop_flag = false;
            this.stop = function(flag){
                stop_flag = flag;
            };
            
            this.reset_cnt = function(){
                cnt=0;
            };
            
            var thisObj = this;
            this.restart = function(){
                stop_flag = false;
                
                (function(){
                    thisObj.key_manager.update();
                    thisObj.enemy_manager.update(cnt++);
                    thisObj.obj_manager.update();
                    update_score();

                    if(!stop_flag)
                        requestAnimationFrame(arguments.callee);
                })();
            };
        }).call(this);

        this.restart();
        return this;
    },
    game_over: function(){
        this.stop(true);
        this.div.append("<div> Game Over... </div>");
    },
    clear: function(){
        this.stop(true);
        this.div.append("<div> Game Clear!!! </div>");
    }
};

},{"./effect.js":1,"./enemy_manager.js":10,"./item_manager.js":13,"./key_manager.js":14,"./obj_manager.js":16,"./util.js":19}],16:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(types, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: options.div,
            options: options,
            obj_stack: {},
            rules: {}
        });

        $.each(types, function(i, name){
            this.obj_stack[name] = [];
        }.bind(this));
   
        return this;
    },

    add: function(type, str, x, y, dx, dy, options){
        var Object = require("./object.js");
        var obj = new Object(this.div, str, x, y, dx, dy, $.extend(options, this.options));

        this.obj_stack[type].push(obj);
        return obj;
    },

    update: function(frame_num){
        var options = this.options;

        $.each(this.obj_stack, (function(key, stack){
            this.obj_stack[key] = $.grep(stack, function(o){
                var ret = o.update();
                if(((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.options.live_even_outside)){
                    o.clear();
                    return false;
                }
                return ret;
            });
        }).bind(this));

        var is_collision = function(obj1, obj2){
            var c1 = obj1.center();
            var c2 = obj2.center();
            var d_c = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
            return d_c < (obj1.options.radius + obj2.options.radius);
        };

        $.each(this.obj_stack, (function(key, stack){
            if(typeof this.rules[key] != "undefined"){
                $.each(this.rules[key], function(i, rule){
                    var dst_stack = this.obj_stack[rule.dst];
                    var callback = rule.cb;
                    
                    $.each(stack, function(i, src){
                        $.each(dst_stack, function(i, dst){
                            if(is_collision(src, dst)){
                                callback(src, dst);
                            }
                        });
                    });
                }.bind(this));
            }
        }).bind(this));
    },
    
    register_collision_rule: function(src, dst, callback){
        if(typeof this.rules[src] == "undefined")
            this.rules[src] = [];

        this.rules[src].push({
            dst: dst,
            cb: callback
        });
    }
};

},{"./object.js":17}],17:[function(require,module,exports){
/*global require, module, $, jQuery*/

var util = require("./util.js");

function Object(parent, str, x, y, dx, dy, _options){
    this.options = $.extend({
        size: 18,
        bold: false,
        color: "#000",
        radius: 3,
        live_even_outside: false,
        score: 0
    }, _options);

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    var new_id = require("./util.js").uuid();
    parent.append("<div id=\"" + new_id + "\">" + str + "</div>");
    this.selection = $("#" + new_id)
        .css({
            "position": "absolute",
            "font-size": this.options.size,
            "font-weight": (this.options.bold ? "bold" : "normal"),
            "color": this.options.color
        });
    
    return this;
}

Object.prototype.update = function(){
    this.x += this.dx;
    this.y += this.dy;

    this.selection.css({
        "left": this.x,
        "top": this.y
    });

    return true;
};

Object.prototype.wrap_update = function(new_func){
    var old_func = this.update;
    this.update = function(){
        return new_func.call(this, old_func.bind(this));
    };
};

Object.prototype.changeColor = function(color){
    this.selection.css({
        color: color
    });
};

Object.prototype.changeText = function(text){
    this.selection.html(text);
};

Object.prototype.clear = function(){
    this.options.game_manager.add_score(this.options.score);
    this.wrap_update(util.ret_f);
    this.selection.remove();
};

Object.prototype.box = function(){
    return this.selection[0].getBoundingClientRect();
};

Object.prototype.center = function(){
    var rect = this.box();
    return {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
};

module.exports = Object;

},{"./util.js":19}],18:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = [
    {
        0: [
            {type: "title", arg: ["PRESS ENTER", true]}
        ]
    },
    {
        0: [
            {type: "title", arg: ["Stage1", false]}
        ],
        100: [
            // type1: x, y, tx, ty, time, leave_cnt
            {type: "type3", arg: [250, -10, 80, "#0f0"]},
            {type: "type1", arg: [100, 10, 400, 40, 50, 400, "#00f"]},
            {type: "type1", arg: [400, 10, 100, 40, 50, 400, "#00f"]}
        ],
        600: [
            {type: "type2", arg: [250,-30, 400, 40, 50, 400, "#f00"]},
            {type: "type2", arg: [250, -30, 40, 140, 50, 400, "#f00"]}
        ],
        1100: [
            {type: "type1", arg: [100, 10, 400, 40, 50, 400, "#00f"]},
            {type: "type1", arg: [400, 10, 100, 40, 50, 400, "#00f"]},
            {type: "type2", arg: [250,-30, 400, 140, 50, 400, "#f00"]},
            {type: "type2", arg: [250, -30, 100, 140, 50, 400, "#f00"]}
        ],
        1500: [
            {type: "type2", arg: [250,-30, 250, 90, 100, 500, "#f00"]},
        ],
        1600: [
            {type: "type3", arg: [100, -10, 40, "#0f0"]}
        ],
        1650: [
            {type: "type3", arg: [250, -10, 50, "#0f0"]}
        ],
        1700: [
            {type: "type3", arg: [400, -10, 40, "#0f0"]}
        ],
        2000: [
            {type: "title", arg: ["!! BOSS !!", false]}
        ],
        2200: [
            {type: "boss1", arg: [250, 50, 40], clear: true}
        ]
    },
    {
        0: [
            {type: "title", arg: ["Stage2", false]}
        ],
        100: [
            {type: "type2", arg: [250,-30, 400, 40, 50, 400, "#f00"]},
            {type: "type2", arg: [250, -30, 40, 140, 50, 400, "#f00"]}
        ],
        600: [
            {type: "boss3", arg: []}
        ]
    },
    {
        0: [
            {type: "title", arg: ["Stage3", false]}
        ],
        100: [
            {type: "boss4", arg: []}
        ]
    }
];

},{}],19:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    uuid: function(){
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;

            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += "-";
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    },
    rk4: function(t0, x0, integrand, t1, h){
        var x = x0;
        var t = t0;

        if(typeof h == "undefined")h = 1e-3;

        function add(){
            return [].reduce.call(arguments, function(prev, curr){
                return $.map(curr, function(val, i){
                    return val + prev[i];
                });
            });
        }

        function mul_c(c, vec){
            return $.map(vec, function(val){
                return c*val;
            });
        }
        
        while(t < t1){
            var k1s = integrand(t, x);
            var k2s = integrand(t+h/2, add(x, mul_c(h/2, k1s)));
            var k3s = integrand(t+h/2, add(x, mul_c(h/2, k2s)));
            var k4s = integrand(t+h, add(x, mul_c(h, k3s)));
            x = add(x, mul_c(h/6, add(k1s, mul_c(2, k2s), mul_c(2, k3s), k4s)));
            t += h;
        }
        return x;
    },
    euler: function(t0, x0, integrand, t1, h){
        var x = x0;
        var t = t0;

        if(typeof h == "undefined")h = 1e-3;

        while(t < t1){
            var dx = integrand(t+h, x);
            x = $.map(x, function(val, i){
                return val + h*dx[i];
            });
            t+=h;
        }

        return x;
    },
    array: function(num, init){
        if(typeof init == "undefined")init = 0;
        var ret = new Array(num);
        for(var i=0; i<num; i++)ret[i] = init;
        return ret;
    },
    ret_t: function(){
        return true;
    },
    ret_f: function(){
        return false;
    },
    ret_no: function(){
    },
    mul: function(arr, times){
        var ret=[];
        for(var i=0; i<times; i++)ret = ret.concat(arr);
        return ret;
    }
};

},{}],20:[function(require,module,exports){
/*global require, module, $, jQuery*/

$(function(){
    (require("./init.js"))();
});

},{"./init.js":11}]},{},[20]);
