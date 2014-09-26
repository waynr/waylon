var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Nirvana = Backbone.View.extend({
    el: 'body',

    initialize: function(options) {
        this.options = options || {};
        this.radiator = options.radiator;

        this.listenTo(Waylon.JobCollection, 'change:status', this.check);
    },

    check: function() {
        var ok = true;

        var successful = Waylon.JobCollection.count('success');
        var total      = Waylon.JobCollection.size();

        if (successful === total) {
            this.begin();
        } else {
            this.end();
        }
    },

    begin: function() {
        this.$el.addClass('nirvana');
        this.$el.css('background-image', 'url(' + this.imageOfTheDay() + ')');

        this.radiator.hide();
    },

    end: function() {
        this.$el.removeClass('nirvana');
        this.$el.css('background-image', 'none');

        this.radiator.show();
    },

    // Nirvana mode routines
    // Return the image of the day for nirvana mode
    imageOfTheDay: function () {
        'use strict';
        var date = new Date(),
            day = date.getDay(),
            result = "/img/nirvana/img0" + day + ".png";
        return result;
    },
});
