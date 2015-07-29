(function() {
    'use strict;'

    angular.module('app').directive('navbar', [function() {
        return {
            restrict: 'A',
            templateUrl: 'directives/navbar/navbar.html',
            replace: true
        };
    }])
})();