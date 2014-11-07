var Waylon = Waylon || {};
Waylon.Models = Waylon.Models || {};

Waylon.Models.Alert = Backbone.Model.extend({

    defaults: {
        "level": "info",
        "content": ""
    },
});
