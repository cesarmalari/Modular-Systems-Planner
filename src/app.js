(function() {
    'use strict;'

    angular.module('app', ['ng', 'ui.router']).config([ '$urlRouterProvider', '$httpProvider', function($urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('requestInterceptor');
    }])
})();