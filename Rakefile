require 'rake'
require 'nokogiri'
require 'openssl'
require 'net/http'
require 'json'
require 'fileutils'
require 'time'
require 'date'
require 'pp'
require 'zip'

EXTENSION_ID = Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
EXTENSION = EXTENSION_ID.gsub(/@.*/, '')
RELEASE = Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text

TRANSLATORS = ['Better BibTeX', 'Better BibLaTeX', 'BibTeX Citations', 'Pandoc Citations', 'BibTeX Citation Keys']

UNICODE_MAPPING = 'unicode/unicode.xml'

SOURCES = %w{chrome resource defaults chrome.manifest install.rdf bootstrap.js}
            .collect{|f| File.directory?(f) ?  Dir["#{f}/**/*"] : f}.flatten
            .select{|f| File.file?(f)}
            .reject{|f| f =~ /[~]$/ || f =~ /\.swp$/} + [UNICODE_MAPPING]

XPI = "zotero-#{EXTENSION}-#{RELEASE}.xpi"

task :default => XPI do
end

file XPI => SOURCES do |t|
  Dir['*.xpi'].each{|xpi| File.unlink(xpi)}

  begin
    puts "Creating #{t.name}"
    Zip::File.open(t.name, 'w') do |zipfile|
      t.prerequisites.reject{|f| f=~ /^(unicode|resource)\// }.each{|file|
        zipfile.add(file, file)
      }

      zipfile.mkdir('resource/translators')
      TRANSLATORS.each{|translator|
        translator = "resource/translators/#{translator}.js"
        zipfile.get_output_stream(translator){|f|
          f.write((Translator.new translator ).to_s)
        }
      }
    end
  rescue => e
    File.unlink(t.name) if File.exists?(t.name)
    throw e
  end

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
  sh "git add #{XPI}"
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


class Translator
  @@mapping = nil

  def initialize(source)
    @source = source
    @root = File.dirname(@source)

    @_timestamp = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
    @_unicode_mapping = Translator.mapping
  end
  attr_reader :_id, :_label, :_timestamp, :_unicode, :_unicode_mapping

  def self.mapping
    if @@mapping.nil?
      mapping = Nokogiri::XML(open(UNICODE_MAPPING))

      unicode2latex = {};
      latex2unicode = {};
      mapping.xpath('//character[@dec and latex]').each{|char|
        id = char['dec'].to_s.split('-').collect{|i| Integer(i)}
        key = id.pack('U' * id.size)
        value = char.at('.//latex').inner_text

        # need to figure something out for this. This hase the for X<combining char>, which needs to be transformed to 
        # \combinecommand{X}
        #raise value if value =~ /LECO/

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

      @@mapping = "
        var convert = {
          unicode2latex: #{JSON.pretty_generate(unicode2latex)},
          unicode2latex_maxpattern: #{unicode2latex.keys.collect{|k| k.size}.max},

          latex2unicode: #{JSON.pretty_generate(latex2unicode)}
        };
      "
    end

    return @@mapping
  end

  def _include(partial)
    return render(File.read(File.join(@root, File.basename(partial))))
  end

  def to_s
    puts "Creating #{@source}"

    #code = File.open(@template, 'rb', :encoding => 'utf-8').read
    js = File.open(@source, 'r').read

    header = nil
    start = js.index('{')
    length = 2
    while start && length < 1024
      begin
        header = JSON.parse(js[start, length])
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

    return render(js)
  end

  def render(template)
    return template.gsub(/\/\*= (.*?) =\*\//){|match, command|
      arguments = $1.split
      command = arguments.shift
      self.send("_#{command}".intern, *arguments)
    }
  end
end

file UNICODE_MAPPING => 'Rakefile' do |t|
  begin
    return unless download('http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)

    mapping = Nokogiri::XML(open(t.name))
    #Nokogiri.parse(open(t.name))
    puts mapping.errors

    mapping.at('//charlist') << "<character id='U0026' dec='38' mode='text' type='punctuation'><latex>\\&</latex></character>"

    {
      "\\textdollar"        => "\\$",
      "\\textquotedblleft"  => "``",
      "\\textquotedblright" => "''",
      "\\textasciigrave"    => "`",
      "\\textquotesingle"   => "'",
      "\\space"             => ' '
    }.each_pair{|ist, soll|
      nodes = mapping.xpath(".//latex[normalize-space(text())='#{ist}']")
      next unless nodes
      nodes.each{|node| node.content = soll }
    }

    File.open(t.name,'w') {|f| mapping.write_xml_to f}
  rescue => e
    File.rename(t.name, t.name + '.err') if File.exists?(t.name)
    throw e
  end
end

### UTILS

def download(url, file)
  puts "Downloading #{url} to #{file}"
  uri = URI(url)

  req = Net::HTTP::Get.new(uri.request_uri)
  #http.use_ssl = true if url =~ /^https/i
  #req.verify_mode = OpenSSL::SSL::VERIFY_NONE

  if File.exists?(file)
    stat = File.stat file
    req['If-Modified-Since'] = stat.mtime.rfc2822
  end

  res = Net::HTTP.start(uri.hostname, uri.port) {|http|
    http.request(req)
  }

  if res.is_a?(Net::HTTPSuccess)
    FileUtils.mkdir_p(File.dirname(file))
    open(file, 'w') { |file| file.write(res.body) }
    return true
  else
    throw "Failed to download #{url}: #{res}"
    return false
  end
  #open(file, 'wb', :encoding => 'utf-8') { |file| file.write(resp.body) }
end
