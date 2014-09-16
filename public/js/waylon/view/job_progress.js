var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.JobProgress = Backbone.View.extend({
    el: 'div',

    initialize: function(options) {
        this.options = options || {};
    },

    template: Handlebars.compile([
        '<img class="job-status" src="/img/eta.png" data-toggle="tooltip" title="Estimated time remaining" alt="ETA" />',
        '&nbsp;',
        '{{eta}}',
    ].join("")),

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        this.$('img').tooltip({'placement': 'bottom'});

        return this;
    },
});

