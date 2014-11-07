var Waylon = Waylon || {};

var alertCollection = Backbone.Collection.extend({
    model: Waylon.Models.Alert,
});

Waylon.AlertCollection = new alertCollection();
