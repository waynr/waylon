var Waylon = Waylon || {};

Waylon.App = function(options) {
    this.initialize.apply(this, [options]);
};

_.extend(Waylon.App.prototype, {

    defaults: {
        refresh_interval: 60,
        trouble_threshold: 0,
    },

    initialize: function(options) {
        this.options  = options || {};
        this.refresh_interval = options.refresh_interval || this.defaults.refresh_interval;

        this.radiator = new Waylon.Views.Radiator({view: this.options.view});
        this.rollup   = new Waylon.Views.StatsRollup({});
        this.nirvana  = new Waylon.Views.Nirvana({radiator: this.radiator});
        this.alerts   = new Waylon.Views.AlertList({});
        this.trouble  = new Waylon.Views.Trouble({
            radiator: this.radiator,
            trouble_threshold: this.options.trouble_threshold
        });
    },

    run: function() {
        this.setup();
        setInterval(this.refresh, this.refresh_interval * 1000);
    },

    setup: function() {
        Waylon.JobCollection.url = '/api/view/' + this.options.view + '/jobs.json';
        Waylon.JobCollection.fetch({
            context: this,
            success: function(model, response, options) {
                var radiator = options.context.radiator;
                radiator.doneLoading();
            },
        });
    },

    refresh: function() {
        Waylon.JobCollection.each(function(job) {
            job.query();
        });
    }
});
