var Waylon = Waylon || {};
Waylon.Models = Waylon.Models || {};

Waylon.Models.Job = Backbone.Model.extend({
    defaults: {
        status: "unknown",
        investigating: false,
        health: -1,
    },

    initialize: function(attrs) {
        /*
         * When jobs are initialized they may not have the display_name
         * attribute specified, as that value must be retrieved from the
         * Jenkins server. To ensure that jobs can be initially rendered with
         * a name of some kind, we reuse the project job name.
         *
         * Since this is occurring on the initial model creation we don't want
         * to trigger any Backbone events, so we bypass the #set method and
         * directly modify the attributes object.
         */
        this.attributes['display_name'] = (this.attributes['display_name'] || attrs['name']);
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
            success: function() {
                this.query();
            },
        });

    },

    // Sort jobs in descending order based on job type priority, and ascending order based on the job name.
    compare: function(other) {
        if (this.priority() > other.priority()) {
            return -1;
        } else if (this.priority() < other.priority()) {
            return 1;
        } else if (this.get('display_name') < other.get('display_name')) {
            return -1;
        } else if (this.get('display_name') > other.get('display_name')) {
            return 1;
        } else {
            return 0;
        }
    },

    priority: function() {
        switch (this.get('status')) {
            case "failure":
                return 10;
            case "aborted":
                return 9;
            case "disabled":
                return 8;
            case "not_run":
                return 7;
            case "unknown":
                return 6;
            case "running":
                return 2;
            case "success":
                return 1;
            default:
                // Ensure that jobs with an unhandled status are highly visible
                return 3;
        }
    },
});
