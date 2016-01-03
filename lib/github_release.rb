require 'github_api'
require 'nokogiri'

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

update_rdf = Nokogiri::XML(File.open(t.name))
update_rdf.at('//em:version').content = RELEASE
update_rdf.at('//RDF:Description')['about'] = "urn:mozilla:extension:#{EXTENSION_ID}"
update_rdf.xpath('//em:updateLink').each{|link| link.content = "https://github.com/ZotPlus/zotero-better-bibtex/releases/download/#{RELEASE}/zotero-#{EXTENSION}-#{RELEASE}.xpi" }
File.open('update.rdf','wb') {|f| update_rdf.write_xml_to f}

## upload new update.rdf
github.repos.releases.assets.upload('ZotPlus', "zotero-#{EXTENSION}", release.id, 'update.rdf', {
  name: 'update.rdf',
  content_type: 'application/rdf+xml'
})
