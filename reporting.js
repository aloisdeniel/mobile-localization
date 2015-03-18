var jade = require('jade');
var colors = require('colors');
var fs = require('fs-extra');

module.exports = function(data, file,callback) {

    var xml = jade.renderFile('./templates/report.jade', {data: data});
    
    fs.outputFile(file, xml, function(err) {
        if(err) {
            console.log(colors.red("[Report] Error : %s"), err);
            callback(err);
        }
        else
        {
            console.log(colors.cyan("[Report][%s] Generation succeed"), file);
            callback();
        }
    })
    
}

