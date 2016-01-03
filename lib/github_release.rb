require 'github_api'
require 'nokogiri'
require 'tempfile'

github = Github.new({oauth_token: ENV['GITHUB_TOKEN']})

# create release and upload assets

release = github.repos.releases.create('ZotPlus', "zotero-#{EXTENSION}", {
  tag_name: RELEASE,
  name: RELEASE,
  body: RELEASE
})

github.repos.releases.assets.upload('ZotPlus', "zotero-#{EXTENSION}", release.id, "zotero-#{EXTENSION}-#{RELEASE}.xpi", {
  name: "zotero-#{EXTENSION}-#{RELEASE}.xpi"
  content_type: 'application/x-xpinstall'
})

# point update.rdf to the right place
release = github.repos.releases.list('ZotPlus', "zotero-#{EXTENSION}").detect{|rel| rel.name == 'update.rdf' }

## Remove any existing assets
github.repos.releases.assets.list('ZotPlus', "zotero-#{EXTENSION}", release.id){ |asset| 
  github.repos.releases.assets.delete 'ZotPlus', "zotero-#{EXTENSION}", asset.id
}

update_rdf = Nokogiri::XML::Builder.new { |xml|
  xml.RDF('xmlns:RDF'=>'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'xmlns:em' => 'http://www.mozilla.org/2004/em-rdf#') {
    xml.parent.namespace = xml.parent.namespace_definitions.find{|ns|ns.prefix=='RDF'}
    xml['RDF'].Description(about: "urn:mozilla:extension:#{EXTENSION_ID}") {
      xml['em'].updates {
        xml['RDF'].Seq {
          xml['RDF'].li {
            xml['RDF'].Description {
              xml['em'].version { xml.text RELEASE }
              xml['em'].targetApplication {
                xml['RDF'].Description {
                  xml['em'].id { xml.text "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}" }
                  xml['em'].minVersion { xml.text "17.0" }
                  xml['em'].maxVersion { xml.text "43.*" }
                  xml['em'].updateLink { xml.text "https://github.com/ZotPlus/zotero-better-bibtex/releases/download/#{RELEASE}/zotero-#{EXTENSION}-#{RELEASE}.xpi" }
                  xml['em'].updateInfoURL { xml.text "https://zotplus.github.io/better-bibtex/CHANGELOG.html" }
                }
              }
              xml['em'].targetApplication {
                xml['RDF'].Description {
                  xml['em'].id { xml.text "zotero@chnm.gmu.edu" }
                  xml['em'].minVersion { "3.0" }
                  xml['em'].maxVersion { "4.0.*" }
                  xml['em'].updateLink{ xml.text "https://github.com/ZotPlus/zotero-better-bibtex/releases/download/#{RELEASE}/zotero-#{EXTENSION}-#{RELEASE}.xpi" }
                  xml['em'].updateInfoURL { xml.text "https://zotplus.github.io/better-bibtex/CHANGELOG.html" }
                }
              }
            }
          }
        }
      }
    }
  }
}

Tempfile.create('update_rdf') do |tmp|
  File.open(tmp, 'wb') {|f| f.write update_rdf.to_xml }

  ## upload new update.rdf
  github.repos.releases.assets.upload('ZotPlus', "zotero-#{EXTENSION}", release.id, tmp.path, {
    name: 'update.rdf',
    content_type: 'application/rdf+xml'
  })
end
