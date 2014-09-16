var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.JobProgress = Backbone.View.extend({
    el: 'div',

    initialize: function(options) {
        this.options = options || {};

        // Abusing Handlebars for my own personal gain
        Handlebars.registerHelper('ifEtaIsUnknown', function(eta, options) {
            if (eta === -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        })
    },

    template: Handlebars.compile([
        '<img class="job-status" src="/img/eta.png" data-toggle="tooltip" title="Estimated time remaining" alt="ETA" />',
        '&nbsp;',
        '{{#ifEtaIsUnknown eta}}',
            'unknown',
        '{{else}}',
            '{{eta}}',
        '{{/ifEtaIsUnknown}}',
    ].join("")),

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        this.$('img').tooltip({'placement': 'bottom'});

        return this;
    },
});

