(function() {
    'use strict;'

    angular.module('app').controller('GeneratorController', ['$http', '$scope', function ($http, $scope) {
        var c = this;
        
        c.configData = null;
        $http.get('resources/blockValues.json').then(function (data) {
            c.configData = data.data;
            c.config = [];
            for (var key in c.configData) {
                c.config.push({ block: key, quantity: 0 });
            }
        });
        
        c.calcMod = function (fn, qty) {
            return qty == 0 ? 0 : Math.max(fn.floor, Math.min(fn.ceiling, ((fn.scaleFactorNumerator / fn.scaleFactorDenominator) * (Math.pow((qty + fn.xOffset), fn.power))) + fn.yOffset));
        };
        c.calc = function () {
            var sum = function (arr) { return _.reduce(arr, function (a, i) { return a + i; }, 0); }
            var calcFunc = function (funcName) { return sum(_.map(c.config, function (i) { return c.calcMod(c.configData[i.block][funcName], i.quantity); })); }
            
            var blocksUsed = sum(_.map(c.config, function (i) { return i.quantity; }));
            var speed = calcFunc('speedFunction');
            var eff = calcFunc('efficiencyFunction');
            var mult = calcFunc('multiplicityFunction') + 1;
            var rfTick = (8 * mult * -1 * speed);
            var tickMod = (1600 + eff) / 1600 / mult;
            var rfPerCoal = Math.max(0, rfTick) * (1600 * tickMod) / 3;
            return {
                speed: speed,
                eff: eff,
                mult: mult,
                rfTick: rfTick,
                tickMod: tickMod,
                rfPerCoal: rfPerCoal,
                blocksUsed: blocksUsed
            };
        };
        
        var allCubes = [];
        var maxSize = 20;
        for (var i = 1; i < maxSize; i++) {
            for (var j = 1; j <= i; j++) {
                for (var k = 1; k <= j; k++) {
                    allCubes.push({ size: (i + 2) + 'x' + (j + 2) + 'x' + (i + 2), blocks: (i + 2) * (j + 2) * (k + 2) - i * j * k });
                } 
            } 
        } 
        allCubes.sort(function (a, b) { return a.blocks - b.blocks; });
        
        $scope.$watch('c.config', function () {
            c.calcResult = c.calc();
            
            var targetIx = _.sortedIndex(allCubes, { blocks: c.calcResult.blocksUsed }, 'blocks');
            c.cubes = allCubes.slice(Math.max(0, targetIx - 3), targetIx + 5);
        }, true);
        
    }]);
})();