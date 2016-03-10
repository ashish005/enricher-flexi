/**
 * Created by wizdev on 3/11/2016.
 */
function permutations(str){
    var arr = str.split(' ').filter(function(n){ return n.length > 0}),
        len = arr.length,
        perms = [],
        rest,
        picked,
        restPerms,
        next;

    if (len == 0)
        return [str];

    for (var i=0; i<len; i++)
    {
        rest = Object.create(arr);
        picked = rest.splice(i, 1);

        restPerms = permutations(rest.join(' '));

        for (var j=0, jLen = restPerms.length; j< jLen; j++)
        {
            if(restPerms[j].split(' ').filter(function(n){ return n.length > 0}).length==2){
                //next = picked.concat(restPerms[j]);
                perms.push(restPerms[j].trim().toLowerCase());
            }else{
                next = picked.concat(restPerms[j]);
                perms.push(next.join(' ').trim().toLowerCase());
            }

        }
    }
    return perms;
}

function createFilterKeys(productKeys){
    /*var keyList = [],_key =  productKeys['product_name'].replace(new RegExp('_', 'g'), ' ');
     keyList.push(_key);*/
    var _prod = productKeys['product_name'].split('_');
    var splitData = permutations(_prod.join(' '));//TODO : Combination logic for creating multiple string
    return splitData;
}

Array.prototype.groupObjectByCommonKey = function(productKeys) {
    var _prodName = createFilterKeys(productKeys);
    var _familyName = undefined;// productKeys['family']; //Apply optional family key filter
    if(_familyName) {
        _familyName = _familyName.replace(new RegExp('_', 'g'), ' ');
    };

    var groups = [];
    return this.filter(function( obj ) {
        if(obj) {
            var _parsedData = JSON.parse(obj)['title'];
            if (_parsedData) {
                _parsedData = _parsedData.toLowerCase();
                var isValidData =  false;
                isValidData =  _prodName.some(function(y) {
                        return (_parsedData.indexOf(y.toLowerCase())> -1); }
                );

                //var isValidData = (_parsedData.indexOf(_prodName.toLowerCase())> -1);
                if(_familyName && !isValidData) {
                    isValidData = (_parsedData.indexOf(_familyName.toLowerCase())> -1);
                }
                return  isValidData;
            }
        }
    });
};

self.addEventListener('message', function(e) {
    var products = e.data['products'];
    var listings = e.data['listings'];


   var getResultantObjectData = function(primaryObj, nestedArrayIn) {
        var _resultantArray = [];
        primaryObj.forEach(function(data, val){
            if(data) {
                var _parsedData = JSON.parse(data);
                var _obj = {};
                _obj['product_name'] = _parsedData['product_name']; //Primary Key
                _obj['listings'] = [];
                var _listingData = nestedArrayIn.groupObjectByCommonKey(_parsedData);
                _listingData.forEach(function(listedData){
                    _obj['listings'].push(JSON.parse(listedData));
                });
                _resultantArray.push(JSON.stringify(_obj) + "\n");
            }
        });
        return _resultantArray;
    };

    // Send the message back.
    self.postMessage(getResultantObjectData(products, listings).join(""));
}, false);