var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.StatsRollup = Backbone.View.extend({

    el: '#stats-rollup',

    className: "container-fluid stats-rollup",

    template: Handlebars.compile([
        '<div class="row">',
        '{{#if failed}}',
            '<div class="col-md-2">',
                '<span class="h3">Failed <span id="failed-jobs" class="label label-danger">{{failed}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if aborted}}',
            '<div class="col-md-2">',
                '<span class="h3">Aborted <span id="aborted-jobs" class="label label-info">{{aborted}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if disabled}}',
            '<div class="col-md-2">',
                '<span class="h3">Disabled <span id="disabled-jobs" class="label label-disabled">{{disabled}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if not_run}}',
            '<div class="col-md-2">',
                '<span class="h3">Not Run <span id="unknown-jobs" class="label label-disabled">{{not_run}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if unknown}}',
            '<div class="col-md-2">',
                '<span class="h3">Unknown <span id="unknown-jobs" class="label label-info">{{unknown}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if building}}',
            '<div class="col-md-2">',
                '<span class="h3">Building <span id="building-jobs" class="label label-warning">{{building}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if successful}}',
            '<div class="col-md-2">',
                '<span class="h3">Successful <span id="successful-jobs" class="label label-success">{{successful}}</span></span>',
            '</div>',
        '{{/if}}',
        '{{#if total}}',
            '<div class="col-md-2">',
                '<span class="h3">Total <span id="total-jobs" class="label label-primary">{{total}}</span></span>',
            '</div>',
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
