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
        this.attributes.display_name = (this.attributes.display_name || attrs.name);
        this.query();
    },

    query: function() {
        if (this.alert) {
            Waylon.AlertCollection.remove(this.alert);
            this.alert = null;
        }
        $.ajax({
            context: this,
            url: this.baseurl() + ".json",
            dataType: "json",
            success: function(json) {
                this._reset(json);
            },
            error: function(xhr, textStatus, err) {
                this.alert = new Waylon.Models.Alert({"level": "warning", "title": "Best check yo'self.", "content": "Couldn't get info for job: '" + this.get('display_name') + "' - " + err});
                Waylon.AlertCollection.add(this.alert);
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
                return 100;
            case "aborted":
                return 90;
            case "disabled":
                return 70;
            case "not_run":
                return 60;
            case "unknown":
                return 50;
            case "running":
                return 80;
            case "success":
                return 10;
            default:
                // Ensure that jobs with an unhandled status are highly visible
                return 30;
        }
    },
});
