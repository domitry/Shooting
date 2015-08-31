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
            var f = obj.update;
            obj.update = function(){
                f.apply(this);
                obj.cnt++;
                if(obj.cnt < options.time)return true;
                else return false;
            };
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
    this.score = 10000;
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

    //// check if it is dead
    $.each(this.yowais, function(i, yowai){
        if(yowai.hp <= 0){
            yowai.update = function(){
                effect.explode(yowai.x, yowai.y);
                return false;
            };
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
    var ret_false = function(){return false;};
    $.each(this.yowais, function(i, yowai){
        yowai.update = ret_false;
    });
    this.tsuyoi.update = ret_false;
};

module.exports = Boss1;

},{"../effect.js":1}],3:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    type1: require("./type1.js"),
    type2: require("./type2.js"),
    boss1: require("./boss1.js")
};

},{"./boss1.js":2,"./type1.js":4,"./type2.js":5}],4:[function(require,module,exports){
/*global require , module, $, jQuery*/

function Type1(x, y, tx, ty, time, leave_cnt, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    var dx = (tx - x)/time;
    var dy = (ty - y)/time;

    this.leave_cnt = leave_cnt;
    this.score = 500;
    this.time = time;
    this.cnt = 0;
    this.obj = this.obj_manager.add("en", "\u96d1", x, y, dx, dy, {
        live_even_outside: true,
        color: color,
        size: 25,
        radius: 20
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
        return false;
    }

    return true;
};

Type1.prototype.clear = function(){
    this.obj.update = function(){
        require("../effect.js").explode(this.x, this.y);
        return false;
    };
};

module.exports = Type1;

},{"../effect.js":1}],5:[function(require,module,exports){
/*global require , module, $, jQuery*/

function Type2(x, y, tx, ty, time, leave_cnt, color, options){
    this.options = options;
    this.obj_manager = options.obj_manager;

    var dx = (tx - x)/time;
    var dy = (ty - y)/time;

    this.leave_cnt = leave_cnt;
    this.time = time;
    this.score = 1000;
    this.cnt = 0;
    this.hp = 10;
    this.obj = this.obj_manager.add("en", "\u9b5a", x, y, dx, dy, {
        live_even_outside: true,
        color: color,
        size: 25,
        radius: 20
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
        return false;
    }

    return true;
};

Type2.prototype.clear = function(){
    this.obj.update = function(){
        require("../effect.js").explode(this.x, this.y);
        return false;
    };
};

module.exports = Type2;

},{"../effect.js":1}],6:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager, _options){
        this.options = $.extend({
            self: null,
            obj_manager: obj_manager,
            game_manager: null
        }, _options);

        this.plan = require("./plan.js");
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
                this.options.game_manager.score += e.score;
                e.clear();
                return false;
            };
            return true;
        }).bind(this));
    }
};

},{"./enemy/list.js":3,"./plan.js":12}],7:[function(require,module,exports){
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

},{"./manager.js":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({
            game_manager: this
        }, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_manager: (require("./obj_manager.js")).init(div, options),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")).init(),
            effect_system: (require("./effect.js")),
            score: 0
        });

        return this;
    },
    start: function(){
        var self = this.obj_manager.add("self", "\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, {
            radius: 10,
            live_even_outside: true
        });
        self.hp = 50;
        window.self = self;

        this.obj_manager.register_collision_rule("self", "en_ball", (function(self, ball){
            self.hp--;
            $("#self_bar").css("width", (this.options.game_width/50)*(self.hp < 0 ? 0 : self.hp));
            ball.clear();
            if(self.hp <= 0)this.game_over();
        }).bind(this));

        var nf = function(){};
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, (function(){
            this.obj_manager.add("self_ball", "\u26AC", self.x, self.y, 0, -3);
        }).bind(this), nf, nf);

        this.enemy_manager.init(this.obj_manager, $.extend({self: self}, this.options));
        this.effect_system.init(this.obj_manager);

        // fuck'n dirty
        var key_manager = this.key_manager;
        var obj_manager = this.obj_manager;
        var enemy_manager = this.enemy_manager;
        var cnt = 0;

        var stop_flag = false;
        this.stop = function(flag){
            stop_flag = flag;
        };

        var thisObj = this; //....
        var update_score = function(){
            var text = "score: " + ("00000" + (thisObj.score)).slice(-6);
            $("#score").text(text);
        };

        (function(){
            key_manager.update();
            enemy_manager.update(cnt++);
            obj_manager.update();
            update_score();

            if(!stop_flag)
                requestAnimationFrame(arguments.callee);
        })();
        
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

},{"./effect.js":1,"./enemy_manager.js":6,"./key_manager.js":8,"./obj_manager.js":10}],10:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_stack: {
                "self": [],
                "en": [],
                "self_ball": [],
                "en_ball": [],
                "others": []
            },
            rules: {}
        });

        return this;
    },

    add: function(type, str, x, y, dx, dy, options){
        var Object = require("./object.js");
        var obj = new Object(this.div, str, x, y, dx, dy, options);

        this.obj_stack[type].push(obj);
        return obj;
    },

    update: function(frame_num){
        var options = this.options;

        $.each(this.obj_stack, (function(key, stack){
            this.obj_stack[key] = $.grep(stack, function(o){
                var res = o.update();

                if(!res || ((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.options.live_even_outside)){
                    o.clear();
                    return false;
                }

                return true;
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
                var dst_stack = this.obj_stack[this.rules[key].dst];
                var callback = this.rules[key].cb;

                $.each(stack, function(i, src){
                    $.each(dst_stack, function(i, dst){
                        if(is_collision(src, dst)){
                            callback(src, dst);
                        }
                    });
                });
            };
        }).bind(this));
    },

    register_collision_rule: function(src, dst, callback){
        this.rules[src] = {
            dst: dst,
            cb: callback
        };
    }
};

},{"./object.js":11}],11:[function(require,module,exports){
/*global require, module, $, jQuery*/

function Object(parent, str, x, y, dx, dy, _options){
    this.options = $.extend({
        size: 18,
        bold: false,
        color: "#000",
        radius: 3,
        live_even_outside: false
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

Object.prototype.changeColor = function(color){
    this.selection.css({
        color: color
    });
};

Object.prototype.clear = function(){
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

},{"./util.js":13}],12:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    100: [
        // type1: x, y, tx, ty, time, leave_cnt
        {type: "type1", arg: [100, 10, 400, 40, 50, 200, "#00f"]},
        {type: "type1", arg: [400, 10, 100, 40, 50, 200, "#00f"]}
    ],
    400: [
        {type: "type2", arg: [250,-30, 400, 40, 50, 200, "#f00"]},
        {type: "type2", arg: [250, -30, 40, 140, 50, 200, "#f00"]}
    ],
    700: [
        {type: "type1", arg: [100, 10, 400, 40, 50, 200, "#00f"]},
        {type: "type1", arg: [400, 10, 100, 40, 50, 200, "#00f"]},
        {type: "type2", arg: [250,-30, 400, 140, 50, 200, "#f00"]},
        {type: "type2", arg: [250, -30, 100, 140, 50, 200, "#f00"]}
    ],
    1200: [
        {type: "boss1", arg: [250, 50, 40]}
    ]
};

},{}],13:[function(require,module,exports){
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
    }
};

},{}],14:[function(require,module,exports){
/*global require, module, $, jQuery*/

$(function(){
    (require("./init.js"))();
});

},{"./init.js":7}]},{},[14]);
