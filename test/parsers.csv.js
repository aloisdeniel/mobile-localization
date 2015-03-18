var assert = require("assert");
var should = require("should");
var parse = require('../parsers/csv.js');

//Constants
var validOptions = { prefix: "", os: ["android","ios","windows"], cultures: [] };
var validFirstRow = "os;key;description;value;FR;DE"
var validDocument = "os;key;description;value;FR;DE\n;title;title of the application;My application;Mon application;Meine Anwendung\nios, android;subtitle;description of the application;The greatest app in the world.;La meilleure application du monde.;Die größte App der Welt.";

var titleDefaultLabel = { 
    key: "title", 
    value: "My application",
    description: "title of the application"
};

var subtitleDefaultLabel = { 
    key: "subtitle", 
    value: "The greatest app in the world.",
    description: "description of the application"
};

var titleFrLabel = { 
    key: "title", 
    value: "Mon application",
    description: "title of the application"
};

var subtitleFrLabel = { 
    key: "subtitle", 
    value: "La meilleure application du monde.",
    description: "description of the application"
};

var titleDeLabel = { 
    key: "title", 
    value: "Meine Anwendung",
    description: "title of the application"
};

var subtitleDeLabel = { 
    key: "subtitle", 
    value: "Die größte App der Welt.",
    description: "description of the application"
};

var outputValid = {
   ios : {
       cultures: {
            default : { labels : [titleDefaultLabel,subtitleDefaultLabel] },
            fr: { labels : [titleFrLabel,subtitleFrLabel] },
            de: { labels : [titleDeLabel,subtitleDeLabel] }
        }
    },
    android : {
       cultures: {
            default : { labels : [titleDefaultLabel,subtitleDefaultLabel] },
            fr: { labels : [titleFrLabel,subtitleFrLabel] },
            de: { labels : [titleDeLabel,subtitleDeLabel] }
        }
    },
    windows : {
       cultures: {
            default : { labels : [titleDefaultLabel] },
            fr: { labels : [titleFrLabel] },
            de: { labels : [titleDeLabel] }
        }
    }
};

//Tests

describe('CSV parsing', function(){
    
  describe('first row', function(){
    
    it('should fail if empty', function(done){
        parse("", validOptions, function(err,labels) {
            should.exist(err);
            done();
        });
    });
      
    it('should have column description', function(done){
        parse("1;2;3;4\n5;6;7;8", validOptions, function(err,labels) {
            should.exist(err);
            done();
        });
    });
      
    it('should have valid column description', function(done){
        parse("os;description;key\n5;6;7;8", validOptions, function(err,labels) {
            should.exist(err);
            done();
        });
    });
          
    it('should succeed if valid', function(done){
        parse(validFirstRow, validOptions, function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            done();
        });
    });
  })
  
  describe('options', function(){
      
    it('should fail if null', function(done){
        
        parse(validDocument, null , function(err,labels) {
            should.exist(err);
            done();
        });
    });
      
    it('should fail if empty', function(done){
        parse(validDocument, { } , function(err,labels) {
            should.exist(err);
            done();
        });
    });
    
    it('should fail if no os specified', function(done){
        parse(validDocument, { cultures : [] } , function(err,labels) {
            should.exist(err);
            done();
        });
    });
    
    it('should fail if no cultures specified', function(done){
        parse(validDocument, { os : [] } , function(err,labels) {
            should.exist(err);
            done();
        });
    });
      
    
      
  });
    
   describe('os', function(){
      
    it('should produce labels only for specified os in options', function(done){
        parse(validDocument, { prefix: "", os: ["ios","windows"], cultures: [] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            Object.keys(labels).length.should.eql(2);
            should.not.exist(labels.android);
            should.exist(labels.ios);
            should.exist(labels.windows);
            done();
        });
    });
       
       it('should produce os labels only when precised', function(done){
        parse(validDocument, { prefix: "", os: ["ios","windows"], cultures: [] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            Object.keys(labels).length.should.eql(2);
            should.exist(labels.ios);
            should.exist(labels.windows);
            labels.ios.cultures.default.labels.should.containEql(titleDefaultLabel);
            labels.windows.cultures.default.labels.should.containEql(titleDefaultLabel);
            labels.ios.cultures.default.labels.should.containEql(subtitleDefaultLabel);
            labels.windows.cultures.default.labels.should.not.containEql(subtitleDefaultLabel);
            done();
        });
           
    });
   });
    
    
    describe('cultures', function(){
      
    it('should produce labels only for one specified culture in options', function(done){
        parse(validDocument, { prefix: "", os: ["ios","windows"], cultures: ["fr"] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            should.exist(labels.ios);
            should.exist(labels.ios.cultures.fr);
            should.not.exist(labels.ios.cultures.default);
            should.not.exist(labels.ios.cultures.de);
            done();
        });
    });
        
        
    it('should produce labels only for multiple specified cultures in options', function(done){
        parse(validDocument, { prefix: "", os: ["ios","windows"], cultures: ["fr","DE"] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            should.exist(labels.ios);
            should.exist(labels.ios.cultures.fr);
            should.exist(labels.ios.cultures.de);
            should.not.exist(labels.ios.cultures.default);
            done();
        });
    });
        
        
        it('should produce labels for all cultures if empty cultures in options', function(done){
        parse(validDocument, { prefix: "", os: ["ios","windows"], cultures: [] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            should.exist(labels.ios);
            should.exist(labels.ios.cultures.fr);
            should.exist(labels.ios.cultures.de);
            should.exist(labels.ios.cultures.default);
            done();
        });
    });
   });
    
    describe('labels', function(){
      
    it('should produce default labels', function(done){
        parse(validDocument, { prefix: "", os: ["ios"], cultures: [] } , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            should.exist(labels.ios);
            should.exist(labels.ios.cultures.default);
            labels.ios.cultures.default.labels.should.containEql(titleDefaultLabel);
            labels.ios.cultures.default.labels.should.containEql(subtitleDefaultLabel);
            done();
        });
    });
        
        it('should produce all labels of all os and cultures', function(done){
        parse(validDocument, validOptions , function(err,labels) {
            should.not.exist(err);
            should.exist(labels);
            labels.should.eql(outputValid);
            done();
        });
    });
        
    });
})