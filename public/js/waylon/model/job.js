var Notochord = Notochord || {};

Notochord.JobModel = Backbone.Model.extend({
    defaults: {
        status: "unknown",
        investigating: false,
        health: null,
    },

    initialize: function(attrs) {
        this.query();
    },

    query: function() {
        $.ajax({
            context: this,
            url: this.baseurl() + ".json",
            dataType: "json",
            success: function(json) {
                this._reset(json);
            },
        });
    },

    baseurl: function() {
        return _.template('/api/view/{{view}}/server/{{server}}/job/{{name}}', this.attributes);
    },

    _reset: function(json) {
        var iter = function(value, key) {
              this.set(key, value);
        };

        _.each(json, iter, this);
    },

    describe: function(desc) {
        $.ajax({
            context: this,
            type: 'POST',
            url: this.baseurl() + '/describe',
            dataType: "json",
            data: {"desc": desc},
        });

    },

    // Sort jobs in descending order based on job type priority, and ascending order based on the job name.
    compare: function(other) {
        if (this.priority() > other.priority()) {
            return -1;
        } else if (this.priority() < other.priority()) {
            return 1;
        } else if (this.get('name') < other.get('name')) {
            return -1;
        } else if (this.get('name') > other.get('name')) {
            return 1;
        } else {
            return 0;
        }
    },

    priority: function() {
        switch (this.get('status')) {
            case "failure":
                return 3;
            case "unknown":
                return 2;
            case "running":
                return 1;
            case "success":
                return 0;
            default:
                return -1;
        }
    },
});
