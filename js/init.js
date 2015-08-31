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
