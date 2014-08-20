var Notochord = Notochord || {};

var jobCollection = Backbone.Collection.extend({
    model: Notochord.JobModel,

    initialize: function() {
        this.listenTo(this, 'change:status', _.debounce(this.sort, 450));
    },

    count: function(status) {
        var matching = this.filter(function(job) {
            return job.get('status') === status;
        });

        return _.size(matching);
    },

    comparator: function(a, b) {
        return a.compare(b);
    },
});

Notochord.JobCollection = new jobCollection();
