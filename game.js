(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    this.hp = 100;
    this.tsuyoi = this.obj_manager.add("\u5f37", cx, cy, 0, dy, true, {
        size: TSUYOI_WIDTH,
        bold: true
    });

    ///// yowai
    this.yowais = [];
    var YOWAI_NUM = 8, YOWAI_WIDTH = 30;
    this.yowai_offset = YOWAI_WIDTH/2;
    this.diff_theta = 2*Math.PI/YOWAI_NUM;
    this.r = 60;
    
    for(var i=0; i<YOWAI_NUM; i++){
        var x = cx + this.r*Math.cos(i*this.diff_theta) + YOWAI_WIDTH/2;
        var y = cy + this.r*Math.sin(i*this.diff_theta) + YOWAI_WIDTH/2;

        this.yowais.push(this.obj_manager.add("\u5f31", x, y, 0, dy, true, {
            size: YOWAI_WIDTH, 
            bold: true
        }));
    }

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
            if(i%2 == this.shooting_yowai){
                var dx = (this.options.self.x - yowai.x)/100;
                var dy = (this.options.self.y - yowai.y)/100;
                var b = this.obj_manager.add("\u26AB", yowai.x, yowai.y, dx, dy, false);
                b.changeColor("#f00");
            }
        }).bind(this));
    }

    if((this.cnt - this.time)%500 > 400){
        //// beam tsuyoi
        var y = this.tsuyoi.y + this.tsuyoi_offset;
        var cx = this.tsuyoi.x + this.tsuyoi_offset - 15;
        var o = {color: "#ff8000", size: 30};
        var bc = this.obj_manager.add("\u25a0", cx, y, 0, 20, false, o);
        var bl = this.obj_manager.add("\u25a0", cx-20, y, 0, 20, false, o);
        var br = this.obj_manager.add("\u25a0", cx+20, y, 0, 20, false, o);
        
    }else{
        //// move tsuyoi
        var dx = (this.options.self.x - this.tsuyoi.x > 0 ? 1 : -1);
        this.tsuyoi.x += dx;

        //// change tusyoi color
        var d = 255/400;
        var red = parseInt(d*((this.cnt - this.time)%500));
        this.tsuyoi.changeColor("rgb("+red +",0,0)");
    }

    return true;
};

Boss1.prototype.clear = function(){
    this.obj.update = function(){return false;};
};

module.exports = Boss1;

},{}],2:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    type1: require("./type1.js"),
    type2: require("./type2.js"),
    boss1: require("./boss1.js")
};

},{"./boss1.js":1,"./type1.js":3,"./type2.js":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
    this.obj = this.obj_manager.add("\u9b5a", x, y, dx, dy, true, {
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
                this.obj_manager.add("\u203b", this.obj.x, this.obj.y, dx, dy, false);
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

},{}],5:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(obj_manager, _options){
        this.options = $.extend({
            self: null,
            obj_manager: obj_manager
        }, _options);

        this.plan = require("./plan.js");
        this.enemy_type_list = require("./enemy/list.js");

        window.enemys = this.enemy_stack;

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

        this.enemy_stack = $.grep(this.enemy_stack, function(e){
            if(!e.update()){
                e.clear();
                return false;
            };
            return true;
        });
    }
};

},{"./enemy/list.js":2,"./plan.js":11}],6:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = function(_options){
    var options = $.extend({
        game_width: 500,
        game_height: 300
    }, _options);

    $("#msgs_div").append("<div id=\"stage\"></div>");

    var stage = $("#stage")
            .css({
                width: options.game_width,
                height: options.game_height,
                border: "solid 3px #000",
                position: "relative",
                padding: 0
            });

    (require("./manager.js"))
        .init(stage, options)
        .start();
};

},{"./manager.js":8}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_manager: (require("./obj_manager.js")).init(div, options),
            enemy_manager: (require("./enemy_manager.js")),
            key_manager: (require("./key_manager.js")).init()
        });

        return this;
    },
    start: function(){
        var self = this.obj_manager.add("\u672a", this.options.game_width/2, this.options.game_height-30, 0, 0, true);

        var nf = function(){};
        this.key_manager.register(37, nf, nf, function(){self.x -= 3;});
        this.key_manager.register(39, nf, nf, function(){self.x += 3;});
        this.key_manager.register(32, (function(){
            this.obj_manager.add("\u26AC", self.x, self.y, 0, -3, false);
        }).bind(this), nf, nf);

        this.enemy_manager.init(this.obj_manager, {self: self});

        // fuck'n dirty
        var key_manager = this.key_manager;
        var obj_manager = this.obj_manager;
        var enemy_manager = this.enemy_manager;
        var cnt = 0;

        (function(){
            key_manager.update();
            enemy_manager.update(cnt++);
            obj_manager.update();

            requestAnimationFrame(arguments.callee);
        })();
        
        return this;
    }
};

},{"./enemy_manager.js":5,"./key_manager.js":7,"./obj_manager.js":9}],9:[function(require,module,exports){
/*global require, module, $, jQuery*/

module.exports = {
    init: function(div, _options){
        var options = $.extend({}, _options);

        $.extend(this, {
            div: div,
            options: options,
            obj_stack: []
        });

        return this;
    },

    add: function(str, x, y, dx, dy, live_even_outside, options){
        var Object = require("./object.js");
        var obj = new Object(this.div, str, x, y, dx, dy, options);
        obj.live_even_outside = live_even_outside;

        this.obj_stack.push(obj);

        return obj;
    },

    update: function(frame_num){
        var options = this.options;

        this.obj_stack = $.grep(this.obj_stack, function(o){
            var res = o.update();

            if(!res || ((o.x<0 || o.y<0 || o.x > options.game_width || o.y > options.game_height)&& !o.live_even_outside)){
                o.clear();
                return false;
            }

            return true;
        });
    }
};

},{"./object.js":10}],10:[function(require,module,exports){
/*global require, module, $, jQuery*/

function Object(parent, str, x, y, dx, dy, _options){
    this.options = $.extend({
        size: 18,
        bold: false,
        color: "#000"
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

module.exports = Object;

},{"./util.js":12}],11:[function(require,module,exports){
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
    1100: [
        {type: "boss1", arg: [250, 50, 40]}
    ]
};

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/*global require, module, $, jQuery*/

$(function(){
    (require("./init.js"))();
});

},{"./init.js":6}]},{},[13]);
