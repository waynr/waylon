var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Weather = Backbone.View.extend({
    el: 'img',

    attributes: function() {
        return { 'data-toggle': 'tooltip' }
    },

    initialize: function(options) {
        this.options = options || {};
    },

    render: function() {
        var state = this.getState();

        this.$el.attr('src', state.src);
        this.$el.attr('alt', state.alt);
        this.$el.attr('title', state.title);
        this.$el.tooltip({'placement': 'bottom'});
        return this;
    },

    getState: function() {
        var state = {};

        switch (parseInt(this.model.get('health'))) {
            case 100:
                state.src   = "/img/sun.png",
                state.alt   = "[sun]",
                state.title = "No recent builds failed";
                break;
            case 80:
                state.src   = "/img/cloud.png",
                state.alt   = "[cloud]",
                state.title = "1 of the last 5 builds failed";
                break;
            case 60:
            default:
                state.src   = "/img/umbrella.png",
                state.alt   = "[umbrella]",
                state.title = "2 or more of the last 5 builds failed";
                break;
            case -1:
                state.src   = "/img/unknown.png",
                state.alt   = "[unknown]",
                state.title = "No build history";
        }
        return state;
    },
});
