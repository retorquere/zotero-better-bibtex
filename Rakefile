require 'rake'
require 'nokogiri'
require 'net/http'
require 'json'
require 'fileutils'
require 'time'
require 'date'
require 'zip/filesystem'

EXTENSION_ID = Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
EXTENSION = EXTENSION_ID.gsub(/@.*/, '')
RELEASE = Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text

MAIN            = 'resource/translators/BibTex.js.template'
BETTERBIBTEX    = 'resource/translators/BetterBibTex.js'
BETTERCITETEX   = 'resource/translators/BetterCiteTex.js'
PANDOCCITE      = 'resource/translators/PandocCite.js'
KEYONLYCITE     = 'resource/translators/KeyOnly.js'
BETTERBIBLATEX  = 'resource/translators/BetterBibLaTex.js'

SOURCES = %w{chrome resource defaults chrome.manifest install.rdf bootstrap.js}
            .collect{|f| File.directory?(f) ?  Dir["#{f}/**/*"] : f}.flatten
            .select{|f| File.file?(f)}
            .reject{|f| File.extname(f) == '.template' || f =~ /[~]$/ || f =~ /\.swp$/}
            .collect{|f| f =~ /\.coffee$/i ? f.gsub(/\.coffee$/i, '.js') : f}
            .collect{|f| f =~ /\/unicode\/.xml$/ ? f.gsub(/\/unicode\.xml$/, '/unicode.js') : f } + [KEYONLYCITE, PANDOCCITE, BETTERBIBTEX, BETTERCITETEX, BETTERBIBLATEX]

FileUtils.mkdir_p(File.dirname(BETTERBIBTEX))

XPI = "zotero-#{EXTENSION}-#{RELEASE}.xpi"

UNICODE_JS = 'resource/translators/unicodeconverter.js.template'
UNICODE_XML = 'resource/translators/unicode.xml.template'

task :default => XPI do
end

rule '.coffee' => '.js' do |t|
  sh "coffee -c #{t.source}"
end

file XPI => SOURCES do |t|
  Dir['*.xpi'].each{|xpi| File.unlink(xpi)}
  sh "zip -r #{t.name} #{t.prerequisites.collect{|f| "\"#{f}\""}.join(' ')}"

#  moz_xpi = "moz-addons-#{t.name}"
#  FileUtils.cp(t.name, moz_xpi)
#
#  Zip::File.open(moz_xpi) {|zf|
#    install_rdf = Nokogiri::XML(zf.file.read('install.rdf'))
#    install_rdf.at('//em:updateURL').unlink
#    zf.file.open('install.rdf', 'w') {|f|
#      f.write install_rdf.to_xml
#    }
#  }
end

file 'update.rdf' => [XPI, 'install.rdf'] do |t|
  update_rdf = Nokogiri::XML(File.open(t.name))
  update_rdf.at('//em:version').content = RELEASE
  update_rdf.at('//RDF:Description')['about'] = "urn:mozilla:extension:#{EXTENSION_ID}"
  update_rdf.xpath('//em:updateLink').each{|link| link.content = "https://raw.github.com/friflaj/zotero-#{EXTENSION}/master/#{XPI}" }
  update_rdf.xpath('//em:updateInfoURL').each{|link| link.content = "https://github.com/friflaj/zotero-#{EXTENSION}" }
  File.open('update.rdf','wb') {|f| update_rdf.write_xml_to f}
end

task :publish => ['README.md', XPI, 'update.rdf'] do
  sh "git add --all ."
  sh "git commit -am #{RELEASE}"
  sh "git tag #{RELEASE}"
  sh "git push"
end

file 'README.md' => [XPI, 'Rakefile'] do |t|
  puts 'Updating README.md'
  readme = File.open(t.name).read
  readme.gsub!(/\(http[^)]+\.xpi\)/, "(https://raw.github.com/friflaj/zotero-#{EXTENSION}/master/#{XPI})")
  readme.gsub!(/\*\*[0-9]+\.[0-9]+\.[0-9]+\*\*/, "**#{RELEASE}**")
  readme.gsub!(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/, DateTime.now.strftime('%Y-%m-%d %H:%M'))
  File.open(t.name, 'w'){|f| f.write(readme)}
end

task :release, :bump do |t, args|
  `git checkout zotero*.xpi`

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

  mapping.at('//charlist') << "<character id='U0026' dec='38' mode='text' type='punctuation'><latex>\\&</latex></character>"

  unicode2latex = {};
  latex2unicode = {};
  mapping.xpath('//character[@dec and latex]').each{|char|
    id = char['dec'].to_s.split('-').collect{|i| Integer(i)}
    key = id.pack('U' * id.size)
    value = char.at('.//latex').inner_text.strip

    # need to figure something out for this. This hase the for X<combining char>, which needs to be transformed to 
    # \combinecommand{X}
    #raise value if value =~ /LECO/

    value = "\\$" if value == "\\textdollar"
    value = "``" if value == "\\textquotedblleft"
    value = "''" if value == "\\textquotedblright"
    value = "`" if value == "\\textasciigrave"
    value = "'" if value == "\\textquotesingle"
    value = ' ' if value == "\\space"

    next if key == value

    force = (key =~ /^[\x20-\x7E]$/)
    if key == "\u00A0"
      value = ' '
      mathmode = false
    else
      mathmode = (char['mode'] == 'math')
    end

    unicode2latex[key] = {latex: value}
    unicode2latex[key][:math] = true if mathmode
    unicode2latex[key][:force] = true if force
    latex2unicode[value] = key
  }
  unicode2latex['['] = {latex: '[', math: true}
  unicode2latex[']'] = {latex: ']', math: true}

  #File.open(t.name, 'wb', :encoding => 'utf-8'){|f| f.write("
  File.open(t.name, 'w'){|f| f.write("
    var convert = {
      unicode2latex: #{JSON.pretty_generate(unicode2latex)},
      unicode2latex_maxpattern: #{unicode2latex.keys.collect{|k| k.size}.max},

      latex2unicode: #{JSON.pretty_generate(latex2unicode)}
    };
  "); }
end

class Template
  def self.name(target)
    return target+ '.template'
  end

  def initialize(target)
    @target = target
    @template = Template.name(@target)
    @root = File.dirname(@template)
    @_timestamp = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
  end
  attr_reader :_id, :_label, :_timestamp, :_unicode

  def _render(partial)
    return render(File.read(File.join(@root, partial + '.template')))
  end

  def generate
    puts "Creating #{@target}"

    #code = File.open(@template, 'rb', :encoding => 'utf-8').read
    code = File.open(@template, 'r').read

    header = nil
    start = code.index('{')
    length = 2
    while start && length < 1024
      begin
        header = JSON.parse(code[start, length])
        break
      rescue JSON::ParserError
        header = nil
        length += 1
      end
    end

    raise "No header in #{@template}" unless header

    @_id = header['translatorID']
    @_label = header['label']
    @_unicode = !!(header['configOptions'] && header['configOptions']['unicode'])

    code = render(code)

    #File.open(@target, 'wb', :encoding => 'utf-8'){|f|
    File.open(@target, 'w'){|f|
      f.write(code)
    }
  end

  def render(template)
    return template.gsub(/\/\*= (.*?) =\*\//){|match, command|
      arguments = $1.split
      command = arguments.shift
      self.send("_#{command}".intern, *arguments)
    }
  end
end

file BETTERBIBLATEX => [Template.name(BETTERBIBLATEX), MAIN, UNICODE_JS, 'Rakefile'] do |t|
  Template.new(t.name).generate
end

file BETTERBIBTEX => [Template.name(BETTERBIBTEX), MAIN, UNICODE_JS, 'Rakefile'] do |t|
  Template.new(t.name).generate
end
file BETTERCITETEX => [Template.name(BETTERCITETEX), MAIN, 'Rakefile'] do |t|
  Template.new(t.name).generate
end
file PANDOCCITE => [Template.name(PANDOCCITE), MAIN, 'Rakefile'] do |t|
  Template.new(t.name).generate
end
file KEYONLYCITE => [Template.name(KEYONLYCITE), MAIN, 'Rakefile'] do |t|
  Template.new(t.name).generate
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

  #open(file, 'wb', :encoding => 'utf-8') { |file| file.write(resp.body) }
  open(file, 'w') { |file| file.write(resp.body) }
end
