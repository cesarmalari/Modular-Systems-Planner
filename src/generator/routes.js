(function() {
    'use strict;'

    angular.module('app').config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('generator', {
                url: '/generator',
                templateUrl: 'generator/generator.html',
                controller: 'GeneratorController',
                controllerAs: 'c'
            });
    }])
})();