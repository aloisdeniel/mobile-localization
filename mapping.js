var yaml = require('js-yaml');
var fs = require('fs');

module.exports.mapFile = function (file,labels,callback) {
    
    var data = fs.readFileSync(file, 'utf8');
    
    module.exports.parse(data,function(err,mapping) {
        if(err) { 
            callback(err);
        }
        else {
            module.exports.insert(mapping,labels);
            callback(null,labels);
        }
    });
}

module.exports.parse = function(data,callback) {
    try {
        var doc = yaml.safeLoad(data);
        
        //TODO : validate doc
        
        callback(null,doc);
      
    } catch (e) {
        callback(e);
    }
    
}

module.exports.insert = function(mapping, labels) {
    for(var os in mapping) {
        var l_os = labels[os];
        if(l_os) {
            
            for(var c in l_os.cultures) {
                var culture  =  l_os.cultures[c];
                
                for(var label_key in mapping[os]) {
                    
                    var label = null;
                    var labelIndex = -1;
                    
                    culture.labels.forEach(function(l,i) {
                        if(l.key === label_key) 
                        {
                            label = l;
                            labelIndex = i;
                        }
                    });
                    
                    culture.labels.splice(labelIndex, 1);
                    
                    if(label) {
                        
                        var newKeys = mapping[os][label_key];
                        newKeys.forEach(function(newKey) {
                            culture.labels.push({
                                key: newKey,
                                description: label.description,
                                value: label.value
                            });
                        });
                        
                    }
                }
            }
        }
    }
}