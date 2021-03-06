(function() {
    'use strict;'

    angular.module('app').controller('GeneratorController', ['$http', '$scope', '$q', '$stateParams', '$state', function ($http, $scope, $q, $stateParams, $state) {
        var c = this;
        
        c.blockExtraInfo = {
            "minecraft:redstone_block:-1": { icon: '', name: 'Redstone' },
            "minecraft:quartz_block:-1": { icon: '', name: 'Quartz' },
            "minecraft:gold_block:-1": { icon: '', name: 'Gold' },
            "minecraft:diamond_block:-1": { icon: '', name: 'Diamond' },
            "minecraft:lapis_block:-1": { icon: '', name: 'Lapis' },
            "minecraft:brick_block:-1": { icon: '', name: 'Brick' },
            "minecraft:stained_hardened_clay:-1": { icon: '', name: 'Stained Hardened Clay' },
            "minecraft:stone:-1": { icon: '', name: 'Stone' },
            "minecraft:cobblestone:-1": { icon: '', name: 'Cobblestone' },
            "minecraft:sandstone:-1": { icon: '', name: 'Sandstone' },
            "minecraft:iron_block:-1": { icon: '', name: 'Iron Block' },
            "minecraft:mossy_cobblestone:-1": { icon: '', name: 'Mossy Cobblestone' },
            "minecraft:netherrack:-1": { icon: '', name: 'Netherrack' },
            "minecraft:emerald_block:-1": { icon: '', name: 'Emerald' },
            "minecraft:stonebrick:-1": { icon: '', name: 'Stone Brick' },
            "minecraft:coal_block:-1": { icon: '', name: 'Coal Block' },
            "chisel:marble:-1": { icon: '', name: 'Marble' },
            "minecraft:obsidian:-1": { icon: '', name: 'Obsidian' },
            "minecraft:nether_brick:-1": { icon: '', name: 'Nether Brick' },
            "chisel:cobblestone:-1": { icon: '', name: 'Cobblestone' },
            "minecraft:end_stone:-1": { icon: '', name: 'End stone' }
        };
        c.configData = null;
        $q.all([
            $http.get('resources/blockValues.json').then(function (data) {
                c.configData = data.data;
            }),
            // initial values based on https://github.com/sinkillerj/ProjectE/blob/master/src/main/java/moze_intel/projecte/emc/mappers/LazyMapper.java
            $http.get('resources/emcValues.json').then(function (data) {
                c.emcValues = data.data;
            })
        ]).then(function () {
            var stateConfig = JSON.parse(atob($stateParams.config || '') || '{}');
            c.config = [];
            for (var key in c.configData) {
                c.config.push({ block: key, quantity: stateConfig[key] || 0 });
            }
        });
        
        c.calcMod = function (fn, qty) {
            return qty == 0 ? 0 : Math.max(fn.floor, Math.min(fn.ceiling, ((fn.scaleFactorNumerator / fn.scaleFactorDenominator) * (Math.pow((qty + fn.xOffset), fn.power))) + fn.yOffset));
        };
        c.calc = function (config) {
            var sum = function (arr) { return _.reduce(arr, function (a, i) { return a + i; }, 0); }
            var calcFunc = function (funcName) { return sum(_.map(config, function (i) { return c.calcMod(c.configData[i.block][funcName], i.quantity); })); }
            
            var blocksUsed = sum(_.map(config, function (i) { return i.quantity; }));
            var emcUsed = sum(_.map(config, function (i) { return (c.emcValues[i.block] || 0) * i.quantity; }));
            var speed = calcFunc('speedFunction');
            var eff = calcFunc('efficiencyFunction');
            var mult = calcFunc('multiplicityFunction') + 1;
            var rfTick = (8 * mult * -1 * speed);
            var tickMod = (1600 + eff) / 1600 / mult;
            var rfPerCoal = Math.max(0, rfTick) * (1600 * tickMod);
            var overallEff = rfPerCoal / (8 * 1600);
            var rfTickPerEMC = emcUsed ? rfTick / emcUsed : 0;
            var rfCoalPerEMC = emcUsed ? rfPerCoal / emcUsed : 0;
            return {
                speed: speed,
                eff: eff,
                mult: mult,
                rfTick: rfTick,
                tickMod: tickMod,
                rfPerCoal: rfPerCoal,
                overallEff: overallEff,
                emcUsed: emcUsed,
                rfTickPerEMC: rfTickPerEMC,
                rfCoalPerEMC: rfCoalPerEMC,
                blocksUsed: blocksUsed
            };
        };
        
        var allCubes = [];
        var maxSize = 20;
        for (var i = 1; i < maxSize; i++) {
            for (var j = 1; j <= i; j++) {
                for (var k = 1; k <= j; k++) {
                    allCubes.push({ size: (i + 2) + 'x' + (j + 2) + 'x' + (k + 2), blocks: (i + 2) * (j + 2) * (k + 2) - i * j * k });
                } 
            } 
        } 
        allCubes.sort(function (a, b) { return a.blocks - b.blocks; });
        
        $scope.$watch('c.config', function () {
            c.calcResult = c.calc(c.config);
            c.whatIf = {};
            _.each(c.config, function (i) {
                var cc = angular.copy(c.config);
                _.each(cc, function (ii) {
                    if (ii.block == i.block) {
                        ii.quantity = ii.quantity + 1;
                    }
                });
                c.whatIf[i.block] = c.calc(cc);
            });
            
            var targetIx = _.sortedIndex(allCubes, { blocks: c.calcResult.blocksUsed }, 'blocks');
            c.cubes = allCubes.slice(Math.max(0, targetIx - 3), targetIx + 5);

            if(c.config.length) {
                var stateConfig = {};
                _.each(c.config, function(i) {
                    stateConfig[i.block] = i.quantity;
                });
                var x = btoa(JSON.stringify(stateConfig));
                $state.go('.', { config: x }, { location: 'replace', reload: false });
            }
        }, true);
        
    }]);
})();