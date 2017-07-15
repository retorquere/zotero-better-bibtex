'use strict';

const ConcatSource = require('webpack-sources').ConcatSource;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const fs = require('fs');
const path = require('path');
const version = require('./version');
const xml = require('xml');

function InstallRDFPlugin(options) {
  this.options = options || {}
};
module.exports = InstallRDFPlugin;

InstallRDFPlugin.prototype.apply = function(compiler) {
  var options = this.options;
  var self = this;

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      for (let chunk of chunks) {
        if ('isInitial' in chunk && !chunk.isInitial()) continue;

        var install_rdf = {
          RDF: [
            { _attr: { "xmlns": "http://www.w3.org/1999/02/22-rdf-syntax-ns#", "xmlns:em": "http://www.mozilla.org/2004/em-rdf#" } },
            { Description: [
                { _attr: { about: "urn:mozilla:install-manifest" } },
                { "em:name": "Zotero Better Bib(La)Tex" },
                { "em:id": "better-bibtex@iris-advies.com" },
                { "em:version": version },
                { "em:description": "Make Zotero useful for us LaTeX holdouts." },
                { "em:homepageURL": "https://github.com/retorquere/zotero-better-bibtex/wiki" },
                { "em:creator": "Emiliano Heyns" },
                { "em:iconURL": "chrome://zotero-better-bibtex/skin/better-bibtex.svg" },
                { "em:updateURL": "https://retorquere.github.io/zotero-better-bibtex/update.rdf" },
                { "em:type": "2" },
                { "em:optionsURL": "chrome://zotero/content/preferences/preferences.xul#better-bibtex" },
                { "em:targetApplication": [
                    { Description: [
                        { "em:id": "zotero@chnm.gmu.edu" },
                        { "em:minVersion": "5.0" },
                        { "em:maxVersion": "5.0.*" }
                      ]
                    },
                    {
                      Description: [
                        { "em:id": "juris-m@juris-m.github.io" },
                        { "em:minVersion": "5.0" },
                        { "em:maxVersion": "5.0.*" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        };
        install_rdf = xml(install_rdf, { declaration: true, indent: '  '});

        for (let file of chunk.files.filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))) {
          compilation.assets[file] = new ConcatSource(install_rdf);
        }
      }
      callback();
    });
  });
}
