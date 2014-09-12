var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.StatsRollup = Backbone.View.extend({

    el: '#stats-rollup',

    className: "container stats-rollup",

    template: Handlebars.compile([
        '{{#if failed}}',
            '<h3>Failed <span id="failed-jobs" class="label label-danger">{{failed}}</span></h3>',
        '{{/if}}',
        '{{#if aborted}}',
            '<h3>Aborted <span id="aborted-jobs" class="label label-info">{{aborted}}</span></h3>',
        '{{/if}}',
        '{{#if disabled}}',
            '<h3>Disabled <span id="disabled-jobs" class="label label-disabled">{{disabled}}</span></h3>',
        '{{/if}}',
        '{{#if not_run}}',
            '<h3>Not Run <span id="unknown-jobs" class="label label-disabled">{{not_run}}</span></h3>',
        '{{/if}}',
        '{{#if unknown}}',
            '<h3>Unknown <span id="unknown-jobs" class="label label-info">{{unknown}}</span></h3>',
        '{{/if}}',
        '{{#if building}}',
            '<h3>Building <span id="building-jobs" class="label label-warning">{{building}}</span></h3>',
        '{{/if}}',
        '{{#if successful}}',
            '<h3>Successful <span id="successful-jobs" class="label label-success">{{successful}}</span></h3>',
        '{{/if}}',
        '{{#if total}}',
            '<h3>Total <span id="total-jobs" class="label label-primary">{{total}}</span></h3>',
        '{{/if}}',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        this.listenTo(Waylon.JobCollection, 'remove', this.render);
        this.listenTo(Waylon.JobCollection, 'change:status', this.render);
    },

    render: function() {
        var attrs = {
            successful: Waylon.JobCollection.count('success'),
            building: Waylon.JobCollection.count('running'),
            unknown: Waylon.JobCollection.count('unknown'),
            disabled: Waylon.JobCollection.count('disabled'),
            aborted: Waylon.JobCollection.count('aborted'),
            not_run: Waylon.JobCollection.count('not_run'),
            failed: Waylon.JobCollection.count('failure'),
            total: Waylon.JobCollection.size(),
        };

        this.$el.html(this.template(attrs));

        return this;
    },
});
