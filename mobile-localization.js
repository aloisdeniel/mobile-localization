#!/usr/bin/env node
//Required modules
var colors = require('colors');
var fs = require('fs');
var async = require('async');

//Generators
var generators = {
    "android" : require('./generators/android.js'),
    "windows" : require('./generators/windows.js'),
    "javascript" : require('./generators/javascript.js'),
    "ios" : require('./generators/ios.js')
};

//Parsers
var parsers = {
    "csv" : require('./parsers/csv.js')
};

var mapping = require('./mapping.js');
var reporting = require('./reporting.js');

//Default options
var options = {
    prefix: "",
    file: "labels.csv",
    output: "./output/",
    mapping: null,
    os: ["android","ios","windows","javascript"],
    cultures: [],
    report: false
};

//Module
module.exports = {
    options : options,
    generate : generate,
    parseFile: parseFile,
    generators : generators,
    parsers : parsers
}

//Program
if(require.main === module) {

    //Program args
    var program = require('commander');

    program
      .version('0.0.1')
      .option('-f, --file <path>', 'The csv file containing all localized labels')
      .option('-o, --output <path>', 'The output folder')
      .option('-s, --os <id>', 'Generates localized file only for a specified os (ios, android, windows)')
      .option('-c, --culture <iso>', 'Generates localized file only for a specified culture (iso 3166-1 alpha2)')
      .option('-p, --prefix <value>', 'Adds a prefix to all keys')
      .option('-m, --mapping <path>', 'Adds a yaml mapping file. Each key will be mapped to extra keys.')
      .option('-r, --report', 'Generates an html report of all the labels.')
      .parse(process.argv);

    if(program.file) options.file = program.file;
    if(program.os) options.os = [program.os];
    if(program.culture) options.cultures = [program.culture];
    if(program.prefix) options.prefix = [program.prefix];
    if(program.mapping) options.mapping = program.mapping;
    if(program.report) options.report = program.report;
    if(program.output) {
        options.output = program.output;
        if(options.output.indexOf("/", options.output.length - 1) === -1 &&
           options.output.indexOf("\\", options.output.length - 1) === -1)
            options.output += "/";
    }

    module.exports.generate(options, function(err, files) {
        if(err) {
            console.log(colors.red("Generation failed : %s"),err);
        }
        else {
            console.log(colors.green("Generation Succeed"));
        }
    });
}

function generate(options,callback) {

    if(!options) options = module.exports.options;

    console.log(colors.green("Generating labels from \"%s\" file, %s os,  %s culture(s) to '%s'..."),options.file,options.os,options.cultures.length === 0 ? "all" : options.cultures,options.output);

    module.exports.parseFile(options,function(err,labels) {
        if(err)
        {
            console.log(colors.red("Parsing of \"%s\" file failed : %s"),options.file,err);
        }
        else
        {
            var oses = [];

            for(var os in labels) {
                oses.push({
                    id: os,
                    generator : generators[os],
                    labels : labels[os]
                });
            }

            async.map(oses, function(o,cb) {

                console.log(colors.yellow("[%s] Beginning generation ..."), o.id);

                 o.generator.generate(options.output, o.labels, function(err,files) {
                    if(err) {
                        cb(err);
                    }
                    else {
                        console.log(colors.yellow("[%s] Succeed."),o.id);
                        cb(null,files);
                    }

                });

            }, function(err,files) {

                if(err) {
                    callback(err);
                }
                else {

                    reporting(labels,options.output + "localization-report.html",function(err) {

                        if(err) {
                            console.log(colors.yellow("[Report] Failed : %s"), err);
                            callback(err);
                        }
                        else {
                            console.log(colors.yellow("[Report] Succeed."));
                            callback(null,files);
                        }

                    });

                }
            });
        }
    });
}


function parseFile(options, callback) {

    if(!options) options = module.exports.options;

    fs.readFile(options.file, 'utf8', function (err,data) {
      if (err) callback(err);
      else {
          parsers.csv(data,options,function(err,labels) {
              if(err) callback(err);
              else {
                  if(!options.mapping) {
                      callback(null,labels);
                  }
                  else {
                      mapping.mapFile(options.mapping,labels,callback);
                  }
              }
          });
      }
    });
}
