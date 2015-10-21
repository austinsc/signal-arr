// Different Visual Studio and MVC project related helpers
'use strict';

var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var xmldom = require('xmldom');
var xpath = require('xpath');

module.exports = {

  // gets latest installed Visual Studio version
  getVsVer: function(cb) {
    var vsVer = '14.0'; // default, latest CTP (VS 2015)

    if (process.platform === 'win32') {
      var Winreg = require('winreg');
      var hkcr = new Winreg({
        hive: Winreg.HKCR
      });

      hkcr.keys(function(err, keys) {
        if (err) {
          throw err;
        }

        var dtes = keys.filter(function(key) {
          return key.key.indexOf('\\VisualStudio.DTE.') === 0;
        });

        if (dtes.length > 0) {
          var latestDte = dtes[dtes.length - 1];
          vsVer = latestDte.key.replace('\\VisualStudio.DTE.', '');
          cb(vsVer);
        }
      });
    } else {
      cb(vsVer);
    }
  },

  // gets configured server info in csproj file
  getServerInfo: function(csproj) {
    var proj = this._readFileAsString(csproj);
    var doc = new xmldom.DOMParser().parseFromString(proj);
    var select = xpath.useNamespaces({
      'msbuild': 'http://schemas.microsoft.com/developer/msbuild/2003'
    });

    var useIisEl = select('//msbuild:UseIIS/text()', doc)[0];
    var useIis = useIisEl && useIisEl.data && useIisEl.data.toUpperCase() === 'TRUE';
    var urlNode;

    if (useIis) {
      urlNode = select('//msbuild:IISUrl/text()', doc)[0];
    } else {
      urlNode = select('//msbuild:CustomServerUrl/text()', doc)[0];
    }

    var serverUrl = urlNode ? urlNode.data : null;

    var useIisExpressEl = select('//msbuild:UseIISExpress/text()', doc)[0];
    var useIisExpress = useIisExpressEl && useIisExpressEl.data && useIisExpressEl.data.toUpperCase() === 'TRUE';

    return {
      url: serverUrl,
      useIis: useIis,
      useIisExpress: useIisExpress
    };
  },

  // creates local IIS Express site
  createIisExpressSite: function(siteName, siteUrl, physicalPath, cb) {
    var iisCmdPath = 'c:/program files/iis express/appcmd.exe';

    cp.execFile(iisCmdPath, ['list', 'site', siteUrl], {}, function(err) {
      if (!err) {
        cb(null, false); // already created
      } else {
        cp.execFile(iisCmdPath, ['add', 'site',
            '/name:' + siteName,
            '/bindings:' + siteUrl,
            '/physicalPath:' + physicalPath
          ], {},
          function(err) {
            cb(err, !err);
          }
        );
      }
    });
  },

  deleteIisExpressSite: function(siteName, cb) {
    var iisCmdPath = 'c:/program files/iis express/appcmd.exe';

    cp.execFile(iisCmdPath, ['delete', 'site', siteName], {}, function(err) {
      cb(err);
    });
  },

  // gets the path of default mvc layout
  getLayoutPath: function() {
    var layoutPath = 'Views/Shared/_Layout.cshtml';

    if (fs.existsSync(layoutPath)) {
      return layoutPath;
    }

    var viewStartPath = 'Views/_ViewStart.cshtml';

    if (!fs.existsSync(viewStartPath)) {
      return layoutPath;
    }

    var viewStart = this._readFileAsString(viewStartPath);
    var layoutMatches = viewStart.match(/Layout\s*=\s*"([^"]+)"/);

    if (layoutMatches.length === 0) {
      return layoutPath;
    }

    layoutPath = layoutMatches[1].replace('~/', '');

    if (layoutPath[0] === '/') {
      layoutPath = layoutPath.slice(1);
    }

    return layoutPath;
  },

  // adds files to csproj
  // csproj: path to csproj, eg 'MyProject.csproj'
  // files: array of objects representing files to add, eg: [
  //   {
  //     path: 'Content/main.css',
  //     dev: false // `true` to create 'None' element instead of 'Content'
  //   }
  // ]
  // writeFunction (optional): custom write function with 'filepath' and 'content' params
  addToCsproj: function(csproj, files, writeFunction) {
    if (files.length === 0) {
      return;
    }

    var projXml = this._readFileAsString(csproj);
    var contentElems = [];
    var filesXml = '';

    files.forEach(function(file) {
      contentElems.push('    <' + (file.dev ? 'None' : 'Content') + ' Include="' + file.path.replace(/\//g, '\\') + '" />\r\n');
    });

    contentElems.forEach(function(elem) {
      projXml = projXml.replace(elem, '');
      filesXml += elem;
    });

    projXml = projXml.replace('  <ItemGroup>\r\n  </ItemGroup>\r\n', '');
    projXml = projXml.replace('</ItemGroup>', '</ItemGroup>\r\n  <ItemGroup>\r\n' + filesXml + '  </ItemGroup>');

    files.forEach(function(file) {
      if (file.path.indexOf('.targets') !== -1) {
        var importEl = '<Import Project="' + file.path.replace(/\//g, '\\') + '" />';
        if (projXml.indexOf(importEl) === -1) {
          projXml = projXml.replace('</ProjectExtensions>', '</ProjectExtensions>\r\n  ' + importEl);
        }
      }
    });

    this._writeFile(csproj, projXml, writeFunction);
  },

  // adds settings to web.config
  // parent: full xpath to the parent node, eg '/configuration/appSettings'
  // elems: array of objects representing xml elements, eg: [
  //   {name: 'add', attrs: {key: 'MySetting', value: 'AwesomeValue'}}
  // ]
  // writeFunction (optional): custom write function with 'filepath' and 'content' params
  addToConfig: function(parent, elems, writeFunction) {
    var changed = 0;
    var configXml = this._readFileAsString('Web.config');
    var configDom = new xmldom.DOMParser().parseFromString(configXml);

    changed += this._safeAddXmlConfigNodes(configDom, parent, elems);

    if (changed > 0) {
      this._safeXmlWrite('Web.config', configDom, configXml, writeFunction);
    }
  },

  _readFileAsString: function(filePath) {
    return fs.readFileSync(path.resolve(filePath), 'utf8');
  },

  _writeFile: function(filepath, content, writeFunction) {
    if (!writeFunction) {
      writeFunction = fs.writeFileSync;
    }

    writeFunction(filepath, content);
  },

  _fixDocIndent: function(doc, xml) {
    var rootComment = doc.documentElement.previousSibling;

    if (rootComment && rootComment.nodeType === 8 /* COMMENT_NODE */ ) {
      doc.insertBefore(doc.createTextNode('\r\n'), rootComment);
      doc.insertBefore(doc.createTextNode('\r\n'), doc.documentElement);
    }
  },

  _safeXmlWrite: function(path, doc, xml, writeFunction) {
    this._fixDocIndent(doc, xml);

    var xmlSerializer = new xmldom.XMLSerializer();
    var updatedXml = xmlSerializer.serializeToString(doc);

    // Fix serialization: use ' />' instead of '/>' if target config uses that style
    var noSpaceClosesCount = (xml.match(/[^ ]\/>/g) || []).length;
    var oneSpaceClosesCount = (xml.match(/ \/>/g) || []).length;

    if (oneSpaceClosesCount > noSpaceClosesCount) {
      updatedXml = updatedXml.replace(/([^ ])\/>/g, '$1 />');
    }

    this._writeFile(path, updatedXml, writeFunction);
  },

  _safeAddXmlConfigNodes: function(doc, parent, elems) {
    var parentNode = doc.documentElement;
    var node = null;
    var indent = 1;

    // get all required parent node names
    var nodeNames = parent.replace('/' + parentNode.nodeName + '/', '').split('/');

    // insert missing parent nodes
    for (var i = 0; i < nodeNames.length; ++i) {
      var nodeName = nodeNames[i];
      node = parentNode.getElementsByTagName(nodeName)[0];

      if (!node) {
        node = doc.createElement(nodeName);
        insertAlphabetically(parentNode, [node], indent, /*last*/ false);
      }

      parentNode = node;
      indent++;
    }

    var nodes = [];

    // create all missing nodes to be added
    for (var j = 0; j < elems.length; ++j) {
      var elem = elems[j];
      var existingNodes = parentNode.getElementsByTagName(elem.name);
      var nodeExists = Array.prototype.slice.call(existingNodes)
        .filter(function(node) {
          return sameAttrs(node, elem.attrs);
        }).length > 0;

      if (nodeExists) {
        continue;
      }

      node = doc.createElement(elem.name);

      for (var attr in elem.attrs) {
        node.setAttribute(attr, elem.attrs[attr]);
      }

      nodes.push(node);
    }

    // add missing nodes
    if (nodes.length > 0) {
      insertAlphabetically(parentNode, nodes, indent, /*last*/ true);
    }

    return nodes.length;
    // end

    function sameAttrs(node, attrs) {
      for (var attr in attrs) {
        if (node.getAttribute(attr) !== attrs[attr]) {
          return false;
        }
      }

      return true;
    }

    function insertAlphabetically(parentNode, nodes, indent, isLast) {
      var inserted = false;

      // always insert last node to the end
      if (!isLast) {
        var siblings = parentNode.childNodes;
        var nodeName = nodes[0].nodeName;

        // if 'system.*' node: place together with other 'system.*' nodes
        var isSystemNode = function(node) {
          return node.nodeName.indexOf('system.') === 0;
        };
        var isSystemNodeToInsert = isSystemNode(nodes[0]);

        if (isSystemNodeToInsert) {
          var systems = [];

          for (var i = 0; i < siblings.length; ++i) {
            if (siblings[i].nodeName.indexOf('system.') === 0) {
              systems.push(siblings[i]);
            }
          }

          if (systems.length > 0) {
            siblings = systems;
          }
        }

        // find a place alphabetically and insert nodes
        for (var j = 0; j < siblings.length; ++j) {
          var isLastSibling = j === siblings.length - 1;
          var isLastSystemSibling = isLastSibling && isSystemNodeToInsert;
          var isNextSiblingNextAlphabetically = !isLastSibling && siblings[j + 1].nodeName.localeCompare(nodeName) > 0;

          if (isLastSystemSibling || isNextSiblingNextAlphabetically) {
            var beforeNode = siblings[j].nextSibling;

            // if has next sibling - place before indent (for correct formatting)
            if (beforeNode && beforeNode.nodeType === 3 /* TEXT_NODE */ ) {
              beforeNode = beforeNode.nextSibling;
            }

            insertNodes(parentNode, nodes, indent, isLast, beforeNode);
            inserted = true;
            break;
          }
        }
      }

      // if wasn't inserted yet: just add to the end
      if (!inserted) {
        insertNodes(parentNode, nodes, indent, isLast);
      }
    }

    function insertNodes(parentNode, nodes, indent, isLast, beforeNode) {
      // create indents
      var indentBefore = doc.createTextNode(Array(indent + 1).join('  '));
      var indentInner = doc.createTextNode('\r\n');
      var indentAfter = doc.createTextNode('\r\n' + Array(indent).join('  '));
      var createSiblingIndentNode = function() {
        return doc.createTextNode('\r\n' + Array(indent + 1).join('  '));
      };

      if (beforeNode) {
        // insert before with fixed indents
        parentNode.insertBefore(indentAfter, beforeNode);
        var siblingBeforeNode = indentAfter;

        for (var i = nodes.length - 1; i >= 0; --i) {
          parentNode.insertBefore(nodes[i], siblingBeforeNode);
          siblingBeforeNode = nodes[i];

          if (i > 0) {
            var siblingIndentNode = createSiblingIndentNode();
            parentNode.insertBefore(siblingIndentNode, siblingBeforeNode);
            siblingBeforeNode = siblingIndentNode;
          }
        }

        parentNode.insertBefore(indentBefore, siblingBeforeNode);
      } else {
        // add to the end with fixed indents
        parentNode.appendChild(indentBefore);

        for (var j = 0; j < nodes.length; ++j) {
          parentNode.appendChild(nodes[j]);

          if (j < nodes.length - 1) {
            parentNode.appendChild(createSiblingIndentNode());
          }
        }

        parentNode.appendChild(indentAfter);
      }

      // if has prev sibling - decrease indent
      var prevSibling = indentBefore.previousSibling;

      if (prevSibling && prevSibling.nodeType === 3 && prevSibling.nodeValue.indexOf('  ') !== -1) {
        indentBefore.deleteData(0, prevSibling.nodeValue.replace('\r\n', '').length);
      }

      // if has next sibling - increase indent
      if (indentAfter.nextSibling) {
        indentAfter.appendData('  ');
      }

      // if has children - add inner indent
      if (!isLast) {
        nodes[0].appendChild(indentInner);
      }
    }
  }
};