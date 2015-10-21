var edge = require('edge');


module.exports = function(grunt) {
  grunt.registerMultiTask('signalr-proxy', 'This task generates the signalr proxy using edge.js and writes it to the specified file.', function() {
    var done = this.async();
    var generator = edge.func({
      assemblyFile: this.data.assembly,
      typeName: this.data.typeName,
      methodName: this.data.methodName
    });
    const outFile = this.data.outFile;
    generator(this.data.serviceUrl, function(error, result) {
      grunt.file.write(outFile, result.script);
      done(result.script);
    });
  });
};