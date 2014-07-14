var assemble = require("./assemble.js");
var disassemble = require("./disassemble.js");
var FS = require("fs");

function addToDescriptor(folder, name, done) {
    FS.readFile("htdocs/index.json", function(err, data) {
        var obj;
        if(err) obj = [];
        else obj = JSON.parse(data);
        var arr = [];
        for(var i in obj) {
            if(obj[i].folder != folder) arr.push(obj[i]);
        }
        arr.push({
            folder : folder,
            name : name
        });
        FS.writeFile("htdocs/index.json", JSON.stringify(arr), function() {
            done();
        });
    });
}

module.exports = function(grunt) {
    grunt.registerTask('assemble-west', function() {
        var done = this.async();
        try { FS.mkdirSync("big") } catch(err) {}
        assemble({
            folder : "original/west",
            span : {
                x : {
                    min : parseInt("2e", 16),
                    max : parseInt("4a", 16)
                },
                y : {
                    min : parseInt("31", 16),
                    max : parseInt("48", 16)
                }
            },
            scale : 512,
            output : "big/west.png",
            finish : function() {
                done();
            }
        });
    });
    grunt.registerTask('disassemble-west', function() {
        var done = this.async();
        try { FS.mkdirSync("htdocs/map_west") } catch(err) {}
        disassemble({
            scale : 128,
            maxStep : 8,
            startStep : 8,
            finish : function() {
                addToDescriptor("map_west", "Western Continent", function() {
                    done();
                });
            },
            file : "big/west.png",
            folder : "htdocs/map_west"
        });
    });
    grunt.registerTask('assemble-east', function() {
        var done = this.async();
        try { FS.mkdirSync("big") } catch(err) {}
        assemble({
            folder : "original/east",
            span : {
                x : {
                    min : parseInt("3b", 16),
                    max : parseInt("51", 16)
                },
                y : {
                    min : parseInt("30", 16),
                    max : parseInt("4d", 16)
                }
            },
            scale : 512,
            output : "big/east.png",
            finish : function() {
                done();
            }
        });
    });
    grunt.registerTask('disassemble-east', function() {
        var done = this.async();
        try { FS.mkdirSync("htdocs/map_east") } catch(err) {}
        disassemble({
            scale : 128,
            maxStep : 8,
            startStep : 8,
            finish : function() {
                addToDescriptor("map_east", "Eastern Continent", function() {
                    done();
                });
            },
            file : "big/east.png",
            folder : "htdocs/map_east"
        });
    });
    grunt.registerTask('west', ['assemble-west', 'disassemble-west']);
    grunt.registerTask('east', ['assemble-east', 'disassemble-east']);
    grunt.registerTask('maps', ['west', 'east']);
};
