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
        var hashstring = window.location.hash;

        if (successful === total) {
            // Don't do anything, this is Nirvana mode
        } else {
            // Trouble mode is disabled if threshold is 0 (default)
            if (threshold > 0 && hashstring != '#disable-trouble') {
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

        var theTemplate = [
            '<div id="trouble-mode-alert" class="alert alert-danger alert-dismissable" role="alert">',
            '<button type="button" class="close" data-dismiss="alert">',
            '<span aria-hidden="true">&times;</span>',
            '<span class="sr-only">Close</span></button>',
            '<strong>Heads up!</strong> This view has entered "trouble" ',
            'state. This means the number of failed jobs is greater than ',
            '<code>trouble_threshold</code> as configured in waylon.yml. ',
            'If you need to see the radiator view of jobs, ',
            '<a class="alert-link" href="#disable-trouble">click here</a> ',
            'to return to the list of jobs.',
            '</div>',
            ].join("");
        $('#global-alerts').html(theTemplate);
    },

    end: function() {
        this.$el.removeClass('trouble');
        this.$el.css('background-image', 'none');

        $('#global-alerts').remove('#trouble-mode-alert');
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
