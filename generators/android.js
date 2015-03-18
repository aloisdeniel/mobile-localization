var colors = require('colors');
var jade = require('jade');
var async = require('async');
var fs = require('fs-extra');
var countries = require('country-data').countries;

module.exports.id = "android";

module.exports.format = function(value) { 
    var result = value.split("@%").join('%s');
    return result;
}

module.exports.generate = function(output, os, callback) {
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
};

function generateCulture (culture,callback) {
    
    culture.pretty = true;
    
    var xml = jade.renderFile('./templates/android.jade', culture);
            
    var suffix = culture.id === "default" ? "" : "-" + culture.id.toLowerCase();
    
    var resw =  culture.output + module.exports.id + "/values" + suffix + "/strings.xml";
    
    fs.outputFile(resw, xml, function(err) {
        if(err) {
            console.log(colors.red("[%s][%s][%s] Error : %s"), module.exports.id, culture.id, resw, err);
            callback(err);
        }
        else
        {
            console.log(colors.cyan("[%s][%s][%s] Generation succeed"), module.exports.id, culture.id, resw);
            callback(null,resw);
        }
    })
}