var Notochord = Notochord || {};

Notochord.StatsRollupView = Backbone.View.extend({

    el: 'div',

    template: Handlebars.compile([
        '<div id="stats-rollup" class="container stats-rollup">',
            '<h3>Successful <span id="successful-jobs" class="label label-success">{{successful}}</span></h3>',
            '<h3>Building   <span id="building-jobs" class="label label-warning">{{building}}</span></h3>',
            '<h3>Unknown    <span id="unknown-jobs" class="label label-info">{{unknown}}</span></h3>',
            '<h3>Failed     <span id="failed-jobs" class="label label-danger">{{failed}}</span></h3>',
            '<h3>Total      <span id="total-jobs" class="label label-primary">{{total}}</span></h3>',
        '</div>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
    },
});
