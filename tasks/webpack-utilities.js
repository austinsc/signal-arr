module.exports = function(grunt) {
  var _ = require('lodash');
  function getWithPlugins(ns) {
    var obj = grunt.config(ns) || {};
    fixPlugins(ns, obj);
    return obj;
  }

  function fixPlugins(ns, obj) {
    if (grunt.util._.isArray(obj)) {
      obj.forEach(function (item, idx) {
        if (typeof item === 'object' && item.constructor === Object) {
          fixPlugins(ns.concat(idx + ''), item);
        }
      });
    } else {
      if (obj.plugins) {
        // getRaw must be used or grunt.config will clobber the types (i.e.
        // the array won't a BannerPlugin, it will contain an Object)
        obj.plugins = grunt.config.getRaw(ns.concat(['plugins']));

        // See https://github.com/webpack/grunt-webpack/pull/9
        obj.plugins = obj.plugins.map(function (plugin) {
          if (grunt.util._.isFunction(plugin)) {
            return plugin;
          }

          var instance = Object.create(plugin); // Operate on a copy of the plugin, since the webpack task
          // can be called multiple times for one instance of a plugin
          for (var key in plugin) {
            // Re-interpolate plugin string properties as templates
            if (Object.prototype.hasOwnProperty.call(plugin, key) && typeof plugin[key] === 'string') {
              instance[key] = grunt.template.process(plugin[key]);
            }
          }
          return instance;
        });
      }
      Object.keys(obj).forEach(function (key) {
        if (key !== 'plugins' && obj[key] && typeof obj[key] === 'object' && obj[key].constructor === Object) {
          fixPlugins(ns.concat(key), obj[key]);
        }
      });
    }
  };

  function mergeFunction (a, b) {
    if (_.isArray(a) && _.isArray(b)) {
      return a.concat(b);
    }
    if (_.isArray(a) && !_.isArray(b)) {
      return a.map(function(item) {
        return _.merge({}, { x: item }, { x: b }, mergeFunction).x;
      });
    }
    if (_.isArray(b) && !_.isArray(a)) {
      return b.map(function(item) {
        return _.merge({}, { x: a }, { x: item }, mergeFunction).x;
      });
    }
  };

  return {
    getWithPlugins: getWithPlugins,
    fixPlugins: fixPlugins,
    mergeFunction: mergeFunction
  };
};