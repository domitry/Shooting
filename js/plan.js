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
