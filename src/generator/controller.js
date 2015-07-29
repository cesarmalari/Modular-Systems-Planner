(function() {
    'use strict;'

    angular.module('app').controller('GeneratorController', ['$http', function ($http) {
        var c = this;
        
        c.configData = null;
        $http.get('resources/blockValues.json').then(function (data) {
            c.configData = data.data;
            c.config = [];
            for (var key in c.configData) {
                c.config.push({ block: key, quantity: 0 });
            }
        });
        
    }]);
})();