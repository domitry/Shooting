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
