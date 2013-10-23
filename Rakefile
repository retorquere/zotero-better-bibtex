require 'rake'
require 'nokogiri'
require 'net/http'
require 'json'

EXTENSION_ID = Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
EXTENSION = EXTENSION_ID.gsub(/@.*/, '')
RELEASE = Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text

TRANSLATOR = 'resource/translators/BetterBibTex.js'
SOURCES = %w{chrome resource defaults chrome.manifest install.rdf bootstrap.js}
            .collect{|f| File.directory?(f) ?  Dir["#{f}/**/*"] : f}.flatten
            .select{|f| File.file?(f)}
            .reject{|f| f =~ /[~]$/ || f =~ /\.swp$/}
            .collect{|f| f =~ /\.coffee$/i ? f.gsub(/\.coffee$/i, '.js') : f}
            .collect{|f| f =~ /\/unicode\/.xml$/ ? f.gsub(/\/unicode\.xml$/, '/unicode.js') : f } + [TRANSLATOR]

XPI = "zotero-#{EXTENSION}-#{RELEASE}.xpi"

UNICODE_JS = 'resource/translators/unicodeconverter.js'
UNICODE_XML = 'resource/translators/unicode.xml'

task :default => XPI do
end

rule '.coffee' => '.js' do |t|
  sh "coffee -c #{t.source}"
end

file XPI => SOURCES do |t|
  Dir['*.xpi'].each{|xpi| File.unlink(xpi)}
  sh "zip -r #{t.name} #{t.prerequisites.collect{|f| "\"#{f}\""}.join(' ')}"
end

file 'update.rdf' => [XPI, 'install.rdf'] do |t|
  update_rdf = Nokogiri::XML(File.open(t.name))
  update_rdf.at('//em:version').content = RELEASE
  update_rdf.at('//RDF:Description')['about'] = "urn:mozilla:extension:#{EXTENSION_ID}"
  update_rdf.xpath('//em:updateLink').each{|link| link.content = "https://raw.github.com/friflaj/zotero-#{EXTENSION}/master/#{XPI}" }
  update_rdf.xpath('//em:updateInfoURL').each{|link| link.content = "https://github.com/friflaj/zotero-#{EXTENSION}" }
  File.open('update.rdf','wb') {|f| update_rdf.write_xml_to f}
end

task :publish => [XPI, 'update.rdf'] do
  sh "git add --all ."
  sh "git commit -am #{RELEASE}"
  sh "git push"
end

task :release, :bump do |t, args|
  bump = args[:bump] || 'patch'

  release = RELEASE.split('.').collect{|n| Integer(n)}
  release = case bump
            when 'major' then [release[0] + 1, 0, 0]
            when 'minor' then [release[0], release[1] + 1, 0]
            when 'patch' then [release[0], release[1], release[2] + 1]
            else raise "Unexpected release increase #{bump.inspect}"
            end
  release = release.collect{|n| n.to_s}.join('.')

  install_rdf = Nokogiri::XML(File.open('install.rdf'))
  install_rdf.at('//em:version').content = release
  install_rdf.at('//em:updateURL').content = "https://raw.github.com/friflaj/zotero-#{EXTENSION}/master/update.rdf"
  File.open('install.rdf','wb') {|f| install_rdf.write_xml_to f}
  puts "Release set to #{release}. Please publish."
end

#### GENERATED FILES

file UNICODE_JS => [UNICODE_XML, 'Rakefile'] do |t|
  puts "Creating #{t.name}"

  mapping = Nokogiri::XML(open(t.prerequisites[0]))

  unicode2latex = {};
  latex2unicode = {};
  mapping.xpath('//character[@id and @mode and latex]').each{|char|
    id = char['id'].to_s
    next unless char.at('.//latex')

    raise "Unexpected char #{id.inspect}" unless id =~ /^U[0-9A-F]{4,}(-[0-9A-F]{4,})*$/i

    id = id.split('-').collect{|n| ((n.gsub(/^U/, ''))[-4,4]).hex}
    key = id.pack('U' * id.size)
    value = char.at('.//latex').inner_text.strip

    value = "``" if value == "\\textquotedblleft"
    value = "''" if value == "\\textquotedblright"
    value = "`" if value == "\\textasciigrave"
    value = "'" if value == "\\textquotesingle"
    value = ' ' if value == "\\space"

    next if key == value

    if key == "\u00A0"
      value = ' '
      mathmode = false
    else
      mathmode = (char['mode'] == 'math')
    end
    key = key.gsub("\\", "\\\\\\")
    value = value.gsub("\\", "\\\\\\")

    unicode2latex[key] = {latex: value, math: mathmode}
    latex2unicode[value] = key
  }

  File.open(t.name, 'wb', :encoding => 'utf-8'){|f| f.write("
    if (!convert) { var convert = {}; }
    convert.unicode2latex = #{JSON.pretty_generate(unicode2latex)};
    convert.latex2unicode = #{JSON.pretty_generate(latex2unicode)};
  "); }
end

file TRANSLATOR => ['../translators/BibTex.js', UNICODE_JS, 'Rakefile'] do |t|
  puts "Creating #{t.name}"
  
  root = File.dirname(t.name)
  File.open(t.name, 'wb', :encoding => 'utf-8'){|f|
    template = File.open(t.prerequisites[0], 'rb', :encoding => 'utf-8').read
    while template =~ /(\/\*: include (.*?) :\*\/)/ do
      template.gsub!($1, File.open(File.join(root, $2), 'rb', :encoding=> 'utf-8').read)
    end
    f.write(template)
  }
end

file UNICODE_XML do |t|
  download('http://www.w3.org/Math/characters/unicode.xml', t.name)
end

### UTILS

def download(url, file)
  puts "Downloading #{url} to #{file}"
  uri = URI.parse(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true if url =~ /^https/i
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE # read into this
  resp = http.get(uri.request_uri)
  
  open(file, 'wb', :encoding => 'utf-8') { |file| file.write(resp.body) }
end
