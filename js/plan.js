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
