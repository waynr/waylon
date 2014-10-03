var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Trouble = Backbone.View.extend({
    el: 'body',

    initialize: function(options) {
        this.options = options || {};
        this.radiator = options.radiator;
        this.trouble_threshold = options.trouble_threshold;

        this.listenTo(Waylon.JobCollection, 'change:status', this.check);
    },

    check: function() {
        var ok = true;

        var successful = parseInt(Waylon.JobCollection.count('success'));
        var failed     = parseInt(Waylon.JobCollection.count('failure'));
        var total      = parseInt(Waylon.JobCollection.size());
        var threshold  = parseInt(this.trouble_threshold);

        if (successful === total) {
            // Don't do anything, this is Nirvana mode
        } else {
            // Trouble mode is disabled if threshold is 0 (default)
            if (threshold > 0) {
                if (failed >= threshold) {
                    this.begin();
                } else {
                    this.end();
                }
            }
        }
    },

    begin: function() {
        this.$el.addClass('trouble');
        this.$el.css('background-image', 'url(' + this.imageOfTheDay() + ')');

        this.radiator.hide();
    },

    end: function() {
        this.$el.removeClass('trouble');
        this.$el.css('background-image', 'none');

        this.radiator.show();
    },

    // Return the image of the day for trouble mode
    imageOfTheDay: function () {
        'use strict';
        var date = new Date(),
            day = date.getDay(),
            result = "/img/trouble/img0" + day + ".png";
        return result;
    },
});
