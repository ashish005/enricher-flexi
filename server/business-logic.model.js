/**
 * Created by wizdev on 3/7/2016.
 */
module.exports = (function(fileNames, fs, async) {

    function readFileData(filePath, callback){
        var resultData = [];
        fs.readFile(filePath, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            };
            callback(data.split('\n'));
        });
    };

    function createFilterKeys(productKeys){
        var keyList = [],_key =  productKeys['product_name'].replace(new RegExp('_', 'g'), ' ');
        keyList.push(_key);
        var splitData = productKeys['product_name'].split('_');//TODO : Combination logic for creating multiple string
        return keyList;
    }

    Array.prototype.groupObjectByCommonKey = function(productKeys) {
        //var _prodName = productKeys['product_name'];
        //var _prodName = productKeys['product_name'].replace(new RegExp('_', 'g'), ' ');
        //var _prodName = ['Casio Exilim EX-FC150' ,  'Casio EX-FC150' , 'Exilim EX-FC150' , 'Casio EX-FC150'];
        var _prodName = createFilterKeys(productKeys);
        //productKeys['product_name'].split('_');//Other Possible options

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

    var sortableUtil = {};
    sortableUtil.exec = function(callback){
        var dataModel = {};
        console.log('Command Started');
        readFileData('./data-source/products.txt', function(productsData){
            dataModel['products'] = productsData;
            readFileData('./data-source/listings.txt', function(listingsData) {
                dataModel['listings'] = listingsData;
                sortableUtil.getResultantObject(dataModel['products'], dataModel['listings']);
            });
        });
    };

     sortableUtil.getResultantObject = function(primaryObj, nestedArrayIn) {
         //var _resultantArray = [];
         var wstream = fs.createWriteStream('./data-source/result.txt' ,  {flags: 'w', encoding: 'utf-8'});
         primaryObj.forEach(function(data, val){
             if(data) {
                 var _parsedData = JSON.parse(data);
                 var _obj = {};
                 _obj['product_name'] = _parsedData['product_name']; //Primary Key
                 _obj['listings'] = [];
                 var _listingData = nestedArrayIn.groupObjectByCommonKey(_parsedData);
                 _listingData.forEach(function(listedData){
                     _obj['listings'].push( JSON.parse(listedData));
                 });

                 //console.log(_obj);
                 wstream.write(JSON.stringify(_obj) + '\n');
                 //_resultantArray.push(_obj);
             }
             //console.log(_resultantArray);
         });

         wstream.end();
         console.log('Successfully done');
     };
   return sortableUtil.exec();
});