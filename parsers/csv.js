//Required modules
var colors = require('colors');
var csv = require('csv');

function areOptionsInvalid(options) {
    
    if(!options || options.length == 0)
        return new Error("Empty options");
    
    if(!("os" in options))
        return new Error("Missing 'os' option");
    
    if(!("cultures" in options))
        return new Error("Missing 'cultures' option");
    
    return false;
}

module.exports = function (data, options, callback) {
    
    if(!data)
    {
        callback(new Error("Empty data")); 
        return;
    }
    
    var invalid = areOptionsInvalid(options);
    
    if(invalid)
    {
        callback(invalid); 
        return;
    }
    
    var cultures = [];
    options.cultures.forEach(function(c) { cultures.push(c.toLowerCase());});
    options.cultures = cultures;
    
    try {
              csv.parse(data, {delimiter: ";", comment: '#'}, function(err, output){
                  
                  var firstcolumns = ["os", "key", "description", "value"];
                  
                  if(err) {
                      callback(err); 
                  }
                  else if(output[0].length == 0 
                          || output[0][0] !== firstcolumns[0] 
                          || output[0][1] !== firstcolumns[1] 
                          || output[0][2] !== firstcolumns[2] 
                          || output[0][3] !== firstcolumns[3] ) {
                      
                      callback(new Error("Invalid file : it should start with ['key', 'description', 'os', 'value'] columns headers"));
                  }
                  else
                  {
                      var headers = output[0];
                      var othercultures = output[0].slice(4);
                      
                      var labels = {};
                      
                      //Creating os and cultures containers
                      options.os.forEach(function(o) {
                         var cultures = {};
                                         
                        if(options.cultures.length === 0 || options.cultures.indexOf("default") > -1) {
                          cultures.default = { labels : [] };
                         }
                          
                          othercultures.forEach(function(c) {
                            c = c.toLowerCase();
                          
                            if(options.cultures.length === 0 || options.cultures.indexOf(c) > -1) {
                              cultures[c] = { labels : [] }
                            }
                          });
                          
                         labels[o] = { 
                              cultures : cultures
                         };
                      });
                      
                      var errorOccured = false;
                      
                      if(output.length > 1)
                      {
                          //Creating labels
                          output.forEach(function(row,index) {

                              if(errorOccured || index == 0)
                                  return;

                             if(row.length > 3)
                             {
                                var os = row[0].trim().length == 0 ? options.os : row[0].split(",");

                                os.forEach(function(os) {

                                    os = os.trim();

                                    if(labels[os]) {

                                        var label = 
                                        {
                                            key: options.prefix + row[1],
                                            description: row[2],
                                            value: row[3]
                                        };

                                        if(labels[os].cultures.default)
                                        {
                                            labels[os].cultures.default.labels.push(label);
                                        }

                                        for(var i = 4; i < headers.length; i ++)
                                        {
                                            var c = headers[i].toLowerCase();

                                            if(labels[os].cultures[c])
                                            {
                                                var localized = {
                                                    key: label.key,
                                                    description: label.description,
                                                    value: row[i]
                                                };

                                                labels[os].cultures[c].labels.push(localized); 
                                            }
                                        }
                                    }
                                });
                             }
                            else if (row.length > 0)
                            {
                                errorOccured = true;
                                callback(new Error("missing data on line : " + index));
                            }
                          });
                      }
                      
                      if(!errorOccured) {
                          callback(null,labels);
                      }
                  }
              });
          }
          catch(e) {
            callback(e);
          }
    
}