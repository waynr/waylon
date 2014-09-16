var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.JobStatusIcon = Backbone.View.extend({
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

        switch (this.model.get('status')) {
            case "running":
                state.src   = "/img/building.png",
                state.alt   = "[building]",
                state.title = "Build in progress";
                break;
            case "failure":
                state.src   = "/img/failed.png",
                state.alt   = "[failed]",
                state.title = "Last build failed";
                break;
            case "success":
                state.src   = "/img/success.png",
                state.alt   = "[success]",
                state.title = "Last build was successful";
                break;
            case "aborted":
                state.src   = "/img/aborted.png",
                state.alt   = "[aborted]",
                state.title = "Last build was aborted";
                break;
            case "disabled":
                state.src   = "/img/disabled.png",
                state.alt   = "[disabled]",
                state.title = "Job is disabled";
                break;
            case "not_run":
                state.src   = "/img/not_run.png",
                state.alt   = "[not run]",
                state.title = "Job has never run";
                break;
            default:
                state.src   = "/img/unknown.png",
                state.alt   = "[unknown]",
                state.title = "Job is in an unknown state";
                break;
        }
        return state;
    },
});
