var colors = require('colors');
var async = require('async');
var mustache = require('mustache');
var fs = require('fs-extra');
var countries = require('country-data').countries;

var template = null;

module.exports.id = "ios";

module.exports.format = function(value) { 
    var result = value.split("@%").join('%@');
    return result;
}

module.exports.generate = function(output, os, callback) {
    
    fs.readFile( __dirname + '/../templates/ios.mustache', function (err, data) {
      if (err) {
          callback(err);
          return;
      }
        template = data.toString();
        
        var cultures = [];

        for(var c in os.cultures) { 
            var culture = os.cultures[c]; 
            culture.id = c;
            culture.output = output;
            
            for(var c in culture.labels) {
            var f = module.exports.format(culture.labels[c].value);
            culture.labels[c].value = f;
            };
            
            cultures.push(culture);
        }

        async.map(cultures, generateCulture, callback);  
    });
    
};


function generateCulture (culture,callback) {
 
    var strings = mustache.render(template, culture);
    var file = culture.output + module.exports.id + "/strings/" + culture.id.toLowerCase() + "/Localizable.strings";
    
    fs.outputFile(file, strings, function(err) {
        if(err) {
            console.log(colors.red("[%s][%s][%s] Error : %s"), module.exports.id, culture.id, file, err);
            callback(err);
        }
        else
        {
            console.log(colors.cyan("[%s][%s][%s] Generation succeed"), module.exports.id, culture.id, file);
            callback(null,file);
        }
    })
    
}