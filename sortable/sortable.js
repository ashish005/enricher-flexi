(function(window){
    "use strict";
    var app = angular.module("sortableApp", []);

    /*$.pluck = function(arr, key) {
        return $.map(arr, function(e) { return e[key]; })
    }*/

    Array.prototype.groupObjectByCommonKey = function(key) {
       //return $.pluck(this, key);
        var groups = {};
        this.forEach(function(item){
            var _key = item[key].toLowerCase();
            var list = groups[_key];

            if(list){
                list.push(item);
            } else{
                groups[_key] = [item];
            }
        });
        return groups;
    };

    var _ops = {
        isItemMatched : function(arrayItem, search) {
            for (var item in arrayItem){
                if(search.indexOf(arrayItem[item]) > -1) {
                    return true;
                }
             }
            return false;
        },
        matchedArray : function(array, commonKey, search){
            var groupByValue = search[commonKey].toLowerCase();
            var arr = array[groupByValue];
            return arr;
        }
    }

    function searchMatchingItems(arr, searchText) {
        var a = [];
        angular.forEach(arr, function(items, val){
            for (var item in items){
                if(searchText.indexOf(items[item]) > -1) {
                    a.push(items);
                }
            }
        });
        return a;
    };
    function commonKeysInArray(array1, array2){
        var common = [];
        for (var key in array1) {
            if (array2.indexOf(array1[key])>-1)
                common.push(array1[key]);
        }
        return common;
    }

    function getResultantObject(primaryObj, nestedArrayIn, _resultantArray){
        var keys = Object.keys(primaryObj[0]);
        var NestedJsonkeys = Object.keys(nestedArrayIn[0]);
        var commonKeys = commonKeysInArray(keys, NestedJsonkeys);
        var groupedItem = nestedArrayIn.groupObjectByCommonKey(commonKeys[0]);
        angular.forEach(primaryObj, function(data, val){
            var _filter = {}, filterText = '';
            angular.forEach(keys, function(item, val){
                _filter[item] =  data[item];
                filterText+= data[item];
            });
            //model":"DSC-W310","family":"Cyber-shot
            var _obj = {}
            _obj['product_name'] = data['product_name']; //Primary Key
            /*_obj['product_name1'] = data;*/
            _obj['listings'] =  searchMatchingItems(_ops.matchedArray(groupedItem, commonKeys[0], _filter), filterText);
            _resultantArray.push(_obj);
        });

        saveTextAsFile( JSON.stringify(_resultantArray), 'shortableResponse');
        return _resultantArray;
    }

    function saveTextAsFile(data, filename)
    {
            var blob = new Blob([data], {type: 'text/csv'});
        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        }
        else{
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename + '.txt';
            document.body.appendChild(elem)
            elem.click();
            document.body.removeChild(elem);
        }
    }
    function mainController($scope, $rootScope, $http, $location, commonSvc) {
        $scope.initMain = function() {
            var arr = [
                $http({ method: 'GET', url: 'data-source/products.json' }),
                $http({ method: 'GET', url: 'data-source/listings.json' })
            ];

            commonSvc.parallelGet(arr).then(function(resp){
                 getResultantObject(resp[0], resp[1], $scope.resp = []); // Perform all permutaion and combination
            }, function(error){
                console.log(error);
            })
        };
    }

    function commonService($http, $q) {
        var commonSvc = {};
        commonSvc.parallelGet = function(arr){
            var deferred = $q.defer();
            $q.all(arr).then(function (respArray) {
                var resultArr = [arr.length];
                for(var i=0; i<arr.length; i++){
                    resultArr[i] = respArray[i]['data'];
                }
                deferred.resolve(resultArr);
            }, function (xhr) {
                deferred.reject(xhr);
            });
            return deferred.promise;
        };
        return commonSvc;
    }
    app
        .controller('mainController', ['$scope', '$rootScope', '$http', '$location', 'commonService', mainController])
        .service('commonService', ['$http', '$q', commonService])

})(window);

