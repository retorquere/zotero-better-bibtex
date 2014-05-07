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
require 'tempfile'

EXTENSION_ID = Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
EXTENSION = EXTENSION_ID.gsub(/@.*/, '')
RELEASE = Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text

TRANSLATORS = [
  {name: 'Better BibTeX'},
  {name: 'Better BibLaTeX', unicode: true},
  {name: 'LaTeX Citation'},
  {name: 'Pandoc Citation'},
  {name: 'BibTeX Citation Keys'}
]

UNICODE_MAPPING = 'tmp/unicode.json'
BIBTEX_GRAMMAR  = Dir["resource/**/*.pegjs"][0]
DICT            = 'tmp/dict.js'

SOURCES = %w{chrome test/import test/export resource defaults chrome.manifest install.rdf bootstrap.js}
            .collect{|f| File.directory?(f) ?  Dir["#{f}/**/*"] : f}.flatten
            .select{|f| File.file?(f)}
            .reject{|f| f =~ /[~]$/ || f =~ /\.swp$/} + [UNICODE_MAPPING, BIBTEX_GRAMMAR, DICT]

XPI = "zotero-#{EXTENSION}-#{RELEASE}.xpi"

task :default => XPI do
end

task :test => XPI do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(dropbox, XPI))

  #Dir['test/*.test.json'].each{|test|
  #  next unless test =~ /BibTeX2/
  #  puts test
  #  puts `node test/test.js #{File.basename(test).inspect}`
  #}
end

task :tests do
  Dir['test/*.xml'].each{|test|
    Test.new(test)
  }
end

file XPI => SOURCES do |t|
  Dir['*.xpi'].each{|xpi| File.unlink(xpi)}

  begin
    puts "Creating #{t.name}"
    Zip::File.open(t.name, 'w') do |zipfile|
      t.prerequisites.reject{|f| f=~ /^(test|tmp|resource)\// }.each{|file|
        zipfile.add(file, file)
      }

      zipfile.mkdir('resource/translators')
      TRANSLATORS.each{|translator|
        translator[:source] = "resource/translators/#{translator[:name]}.js"
        zipfile.get_output_stream(translator[:source]){|f|
          f.write((Translator.new(translator)).to_s)
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
  update_rdf.xpath('//em:updateLink').each{|link| link.content = "https://raw.github.com/ReichenHack/zotero-#{EXTENSION}/master/#{XPI}" }
  update_rdf.xpath('//em:updateInfoURL').each{|link| link.content = "https://github.com/ReichenHack/zotero-#{EXTENSION}" }
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
  readme.gsub!(/\(http[^)]+\.xpi\)/, "(https://raw.github.com/ReichenHack/zotero-#{EXTENSION}/master/#{XPI})")
  readme.gsub!(/\*\*[0-9]+\.[0-9]+\.[0-9]+\*\*/, "**#{RELEASE}**")
  readme.gsub!(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/, DateTime.now.strftime('%Y-%m-%d %H:%M'))
  File.open(t.name, 'w'){|f| f.write(readme)}
end

task :release, :bump do |t, args|
  puts `git checkout zotero*.xpi`

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
  install_rdf.at('//em:updateURL').content = "https://raw.github.com/ReichenHack/zotero-#{EXTENSION}/master/update.rdf"
  File.open('install.rdf','wb') {|f| install_rdf.write_xml_to f}
  puts `git add install.rdf`
  puts "Release set to #{release}. Please publish."
end

#### GENERATED FILES

class Test
  def initialize(test)
    basename = File.join(File.dirname(test), File.basename(test, File.extname(test)))
    js = basename + '.js'
  end
end

class Translator
  @@mapping = nil
  @@parser = nil
  @@dict = nil

  def initialize(translator)
    @source = translator[:source]
    @root = File.dirname(@source)
    @_unicode = !!(translator[:unicode])

    @_timestamp = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
    @_unicode_mapping = Translator.mapping
    @_bibtex_parser = Translator.parser
    @_dict = Translator.dict
    @_release = RELEASE
    get_testcases
  end
  attr_reader :_id, :_label, :_timestamp, :_release, :_unicode, :_unicode_mapping, :_bibtex_parser, :_dict, :_testcases

  def self.dict
    @@dict ||= "var Dict = (function() {\nvar module = {};\n" + File.open(DICT).read + "\n
      function assertString(key) {
        if ((typeof key !== 'string') && (typeof key !== 'number')) {
          throw new TypeError('key must be a string or number.');
        }
      }

      function jsonCapableDict(init) {
        var dict = module.exports(init);

        dict.toJSON = function() {
          var _dict = {};
          this.forEach(function(value, key) { _dict[key] = value; });
          return _dict;
        }

        return dict;
      }

      return jsonCapableDict;
      })();\n"
  end

  def self.parser
    if @@parser.nil?
      parser = Tempfile.new('bibtex')
      puts `pegjs -e BibTeX #{BIBTEX_GRAMMAR.inspect} #{parser.path.inspect}`
      @@parser = File.open(parser.path).read
      parser.unlink
    end
    return @@parser
  end

  def self.mapping
    if @@mapping.nil?
      mapping = JSON.parse(open(UNICODE_MAPPING).read)

      u2l = {
        unicode: {
          math: [],
          map: {}
        },
        ascii: {
          math: [],
          map: {}
        }
      }

      l2u = { }

      mapping.each_pair{|key, repl|
        # need to figure something out for this. This has the form X<combining char>, which needs to be transformed to 
        # \combinecommand{X}
        #raise value if value =~ /LECO/

        if key =~ /^[\x20-\x7E]$/ # an ascii character that needs translation? Probably a TeX special character
          u2l[:unicode][:map][key] = repl['latex']
          u2l[:unicode][:math] << key if repl['math']
        end
        u2l[:ascii][:map][key] = repl['latex']
        u2l[:ascii][:math] << key if repl['math']

        l2u[repl['latex']] = key if repl['latex'] =~ /\\/
      }

      [:ascii, :unicode].each{|map|
        u2l[map][:math] = '/(' + u2l[map][:math].collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('|') + ')/g'
        u2l[map][:text] = '/' + u2l[map][:map].keys.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('|') + '/g'
      }

      @@mapping = "
        var LaTeX = {
          regex: {
            unicode: {
              math: #{u2l[:unicode][:math]},
              text: #{u2l[:unicode][:text]}
            },

            ascii: {
              math: #{u2l[:ascii][:math]},
              text: #{u2l[:ascii][:text]}
            }
          },

          toLaTeX: #{JSON.pretty_generate(u2l[:ascii][:map])},
          toUnicode: #{JSON.pretty_generate(l2u)}
        };
        "
    end

    return @@mapping
  end

  def get_testcases
    @_testcases = []
    Dir["test/import/#{File.basename(@source, File.extname(@source)) + '.*.bib'}"].sort.each{|test|
      @_testcases << {type: 'import', input: File.open(test).read, items: JSON.parse(File.open(test.gsub(/\.bib$/, '.json')).read)}
    }
    @_testcases = JSON.pretty_generate(@_testcases)
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
    js = render(js)

    File.open(File.join('tmp', File.basename(@source)), 'w'){|f| f.write(js) }

    return js
  end

  def render(template)
    return template.gsub(/\/\*= (.*?) =\*\//){|match, command|
      arguments = $1.split
      command = arguments.shift
      self.send("_#{command}".intern, *arguments)
    }
  end
end

file DICT => ['Rakefile'] do |t|
  download('https://raw.githubusercontent.com/domenic/dict/master/dict.js', t.name)
end

file UNICODE_MAPPING => 'Rakefile' do |t|
  begin
    xml = File.join(File.dirname(t.name), File.basename(t.name, File.extname(t.name)) + '.xml')
    download('http://www.w3.org/2003/entities/2007xml/unicode.xml', xml)

    mapping = Nokogiri::XML(open(xml))
    puts mapping.errors

    mapping.at('//charlist') << "
      <character id='U0026' dec='38' mode='text' type='punctuation'><latex>\\&</latex></character>
      <character id='UFFFD' dec='239-191-189' mode='text' type='punctuation'><latex>\\dbend</latex></character>
    "

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

    json = {}
    mapping.xpath('//character[@dec and latex]').each{|char|
      id = char['dec'].to_s.split('-').collect{|i| Integer(i)}
      key = id.pack('U' * id.size)
      value = char.at('.//latex').inner_text
      mathmode = (char['mode'] == 'math')

      case key
        when '_', '}', '{', '[', ']'
          value = "\\" + key
          mathmode = false
        when "\u00A0"
          value = ' '
          mathmode = false
      end

      next if key =~ /^[\x20-\x7E]$/ && ! %w{# $ % & ~ _ ^ { } [ ] > < \\}.include?(key)
      next if key == value && !mathmode

      # need to figure something out for this. This has the form X<combining char>, which needs to be transformed to 
      # \combinecommand{X}
      #raise value if value =~ /LECO/

      json[key] = {latex: value, math: mathmode}
    }

    #File.open(t.name,'w') {|f| mapping.write_xml_to f}
    File.open(t.name,'w') {|f| f.write(json.to_json) }
  rescue => e
    File.rename(t.name, t.name + '.err') if File.exists?(t.name)
    throw e
  end
end

### UTILS

def download(url, file)
  puts "Downloading #{url} to #{file}"
  puts `curl -z #{file.inspect} -o #{file.inspect} #{url.inspect}`
  return true
end

task :fields do
  fields = IO.readlines('../zotero/chrome/locale/en-US/zotero/zotero.properties').collect{|line|
    m = line.match(/itemFields\.([a-zA-Z]+)/)
    if m
      m[1]
    else
      nil
    end
  }.compact
  fields << 'month'
  fields.sort!{|a, b| a.downcase <=> b.downcase}
  fieldwidth = fields.collect{|f| f.size}.max

  columns = 4
  puts '| ' + ([' ' * fieldwidth] * columns).join(' | ') + ' |'
  puts '| ' + (['-' * fieldwidth] * columns).join(' | ') + ' |'
  fields.each_slice(columns){|row|
    puts '| ' + (row + ([''] * columns))[0..columns-1].collect{|f| f.ljust(fieldwidth) }.join(' | ') + ' |'
  }
end
