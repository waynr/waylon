var Notochord = Notochord || {};

Notochord.App = function(options) {
    this.initialize.apply(this, [options]);
};

_.extend(Notochord.App.prototype, {

    initialize: function(options) {
        this.options  = options || {};
        this.radiator = new Notochord.RadiatorView({view: this.options.view});
    },

    run: function() {
        Notochord.JobCollection.url = '/api/view/' + this.options.view + '/jobs.json';
        Notochord.JobCollection.fetch({
            context: this,
            success: function(model, response, options) {
                var radiator = options.context.radiator;
                radiator.doneLoading();
            },
        });
    },
});
