var Notochord = Notochord || {};

Notochord.InvestigateMenuView = Backbone.View.extend({
    el: 'div',

    events: {
        'click [action]': 'setDesc',
    },

    initialize: function(options) {
        this.options = options || {};
    },

    template: Handlebars.compile([
        '{{#if failure}}',
        '<div class="dropdown pull-right">',
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">',
                '{{#if investigating}}',
                    'Under investigation',
                '{{else}}',
                    'Investigate',
                '{{/if}}',
                '&nbsp;<span class="caret"></span>',
            '</button>',
            '<ul class="dropdown-menu" role="menu">',
                '<span>',
                    '{{#if description}}',
                        '{{description}}',
                    '{{else}}',
                        'Not yet investigated',
                    '{{/if}}',
                '</span>',
                '<li class="divider" />',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="investigate">Mark as under investigation</a></li>',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="infra">Mark as infrastructure issue</a></li>',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="legit">Mark as legitimate failure</a></li>',
                '<li class="divider" />',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="uninvestigate">Mark as not under investigation</a></li>',
            '</ul>',
        '</div>',
        '{{/if}}',
    ].join("")),

    render: function() {
        var attributes = $.extend({}, this.model.attributes);
        if (this.model.get('status') === 'failure') {
            attributes.failure = true;
        }

        this.$el.html(this.template(attributes));
        return this;
    },

    setDesc: function(event) {
        var action = $(event.target).attr('action');

        var message;

        switch(action) {
            case 'investigate':
                message = "Under investigation";
                break;
            case 'uninvestigate':
                message = "";
                break;
            case 'infra':
                message = "Marked as infrastructure";
                break;
            case 'legit':
                message = "Marked as legitimate failure";
                break;
        }

        this.model.describe(message);
    },
});

