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
    }
};
