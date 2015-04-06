require 'rake'
require 'shellwords'
require 'nokogiri'
require 'openssl'
require 'net/http'
require 'json'
require 'fileutils'
require 'typhoeus'
require 'time'
require 'date'
require 'pp'
require 'zip'
require 'tempfile'
require 'rubygems/package'
require 'zlib'
require 'open3'
require 'yaml'
require 'rake/loaders/makefile'

NODEBIN="node_modules/.bin"
TIMESTAMP = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')

LINTED=[]
def expand(file, options={})
  dependencies = []

  #puts "expanding #{file.path.gsub(/^\.\//, '').inspect}"
  if File.extname(file.path) == '.coffee' && !options[:collect] && !LINTED.include?(file.path)
    sh "#{NODEBIN}/coffeelint #{file.path.shellescape}"
    LINTED << file.path
  end

  src = file.read
  src.gsub!("$namespace$", options[:namespace]) if options[:namespace]
  throw "No namespace expension performed on #{file.path} with #{options.inspect}" if src =~ /\$namespace\$/
  options.delete(:namespace)
  src.gsub!(/(^|\n)require\s*\(?\s*'([^'\n]+)'([^\n]*)/) {
    all = $&
    prefix = $1
    tbi = $2.strip
    namespace = $3

    if namespace =~ /\s*,\s*'([^'\n]+)'/
      namespace = $1
    else
      namespace = nil
    end

    if tbi =~ /\.js$/
      #puts "registering #{tbi.inspect}"
      result = all
      tbi = File.join(File.dirname(file.path), tbi)
      dependencies << tbi
    elsif tbi == ':constants:'
      dependencies << 'Rakefile'
      #puts "expanding #{tbi.inspect}"
      if options[:collect]
        result = ''
      else
        throw "No header information present" unless options[:header]
        result = []
        result << "Translator.translatorID    = #{options[:header]['translatorID'].to_json}"
        result << "Translator.label           = #{options[:header]['label'].to_json}"
        result << "Translator.timestamp       = #{options[:header]['lastUpdated'].to_json}"
        result << "Translator.release         = #{RELEASE.to_json}"
        result << "Translator.unicode_default = #{(!(((options[:header]['displayOptions'] || {})['exportCharset'] || 'ascii').downcase =~ /ascii/)).to_json}"
        result = result.join("\n")
      end
    else
      #puts "including #{tbi.inspect}"
      i = [File.join(File.dirname(file.path), tbi), File.join('include', tbi)].detect{|f| File.file?(f) }
      throw "#{tbi} not found in #{file.path}" unless i
      dependencies << i
      result = File.file?(i) || !options[:collect] ? expand(open(i), options.merge(namespace: namespace)) : ''
      if result.is_a?(Array)
        dependencies << result[1]
        result = result[0]
      end
    end
    prefix + result
  }
  return [src, dependencies.flatten.uniq] if options[:collect]
  return src
end

ZIPFILES = [
  'chrome/content/zotero-better-bibtex/errorReport.js',
  'chrome/content/zotero-better-bibtex/errorReport.xul',
  'chrome/content/zotero-better-bibtex/include.js',
  'chrome/content/zotero-better-bibtex/jsencrypt.min.js',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.js',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.js',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'chrome.manifest',
  'defaults/preferences/defaults.js',
  'install.rdf',
  'resource/error-reporting.pub.pem',
  'resource/translators/Better BibLaTeX.js',
  'resource/translators/Better BibLaTeX.json',
  'resource/translators/Better BibTeX.js',
  'resource/translators/Better BibTeX.json',
  'resource/translators/BibTeXAuxScanner.js',
  'resource/translators/BibTeXAuxScanner.json',
  'resource/translators/json5.js',
  'resource/translators/LaTeX Citation.js',
  'resource/translators/LaTeX Citation.json',
  'resource/translators/Pandoc Citation.js',
  'resource/translators/Pandoc Citation.json',
  'resource/translators/xregexp-all-min.js',
  'resource/translators/Zotero TestCase.js',
  'resource/translators/Zotero TestCase.json',
] + Dir['chrome/skin/**/*.*']

SOURCES = [
  'chrome/content/zotero-better-bibtex/errorReport.coffee',
  'chrome/content/zotero-better-bibtex/Formatter.pegcoffee',
  'chrome/content/zotero-better-bibtex/include.coffee',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.coffee',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.coffee',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'chrome.manifest',
  'defaults/preferences/defaults.coffee',
  'install.rdf',
  "#{NODEBIN}/coffee",
  "#{NODEBIN}/coffeelint",
  "#{NODEBIN}/pegjs",
  'Rakefile',
  'resource/translators/Better BibLaTeX.coffee',
  'resource/translators/Better BibTeX.coffee',
  'resource/translators/LaTeX Citation.coffee',
  'resource/translators/latex_unicode_mapping.coffee',
  'resource/translators/Pandoc Citation.coffee',
  'resource/translators/Parser.pegcoffee',
  'resource/translators/translator.coffee',
  'resource/translators/unicode_translator.coffee',
  'resource/translators/unicode.xml',
  'resource/translators/Zotero TestCase.coffee',
] + Dir['chrome/skin/**/*.*']

FileUtils.mkdir_p 'tmp'

class String
  def shellescape
    Shellwords.escape(self)
  end
end

require 'zotplus-rakehelper'

rule '.json' => '.yml' do |t|
  open(t.name, 'w'){|f|
    header = YAML::load_file(t.source)
    header['lastUpdated'] = TIMESTAMP
    f.write(JSON.pretty_generate(header))
  }
end

rule '.js' => '.pegcoffee' do |t|
  name = "tmp/#{File.basename(t.name)}"
  source = "tmp/#{File.basename(t.source)}"
  open(source, 'w'){|f| f.write(expand(open(t.source))) }
  sh "#{NODEBIN}/pegjs --plugin pegjs-coffee-plugin -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{source} #{name}"
  FileUtils.mv(name, t.name)
end

rule '.js' => '.coffee' do |t|
  header = t.source.sub(/\.coffee$/, '.yml')
  if File.file?(header)
    header = YAML.load_file(header)
    header['lastUpdated'] = TIMESTAMP
  else
    header = nil
  end

  comment = "###\n DO NOT EDIT/REVIEW! Edit/review the CoffeScript source instead\n###\n"
  tmp = "tmp/#{File.basename(t.source)}"
  open(tmp, 'w'){|f| f.write(comment + expand(open(t.source), header: header)) }
  puts "Compiling #{t.source}"
  output, status = Open3.capture2e("#{NODEBIN}/coffee -mbpc #{tmp.shellescape}")
  raise output if status.exitstatus != 0

  # include javascript generated from pegjs
  output.gsub!(/(^|\n)require\('([^'\n]+\.js)'\);[^\n]*/) {
    tbi = $2.strip
    puts "Importing javascript: #{tbi}"
    tbi = File.join(File.dirname(t.source), tbi)
    open(tbi).read
  }

  #output, status = Open3.capture2e('uglifyjs', stdin_data: output)
  #raise output if status.exitstatus != 0

  open(t.name, 'w') {|target|
    target.write(output)
  }
end

task :keys, [:size] do |t, args|
  args[:size] ||= 1024

  sh "openssl genrsa -out error-reporting.priv.pem #{args[:size]}"
  sh "openssl rsa -pubout -in error-reporting.priv.pem -out resource/error-reporting.pub.pem"
end

task :newtest, [:kind, :name] do |t, args|
  args[:name] =~ /#([0-9]+)/
  tag = $1
  open("features/#{args[:kind]}.feature", 'a') { |f|
    f.puts("")
    f.puts("@#{tag}") if tag
    f.puts("Scenario: #{args[:name]}")
    if args[:kind] == 'export'
      f.puts("  When I import 1 reference from 'export/#{args[:name]}.json'")
      f.puts("  Then a library export using 'Better BibLaTeX' should match 'export/#{args[:name]}.bib'")
    else
      f.puts("    When I import 1 reference from 'import/#{args[:name]}.bib'")
      f.puts("    Then the library should match 'import/#{args[:name]}.json'")
    end
  }
end

task :amo => XPI do
  amo = XPI.sub(/\.xpi$/, '-amo.xpi')

  Zip::File.open(amo, 'w') do |tgt|
    Zip::File.open(XPI) do |src|
      src.each do |entry|
        data = entry.get_input_stream.read
        if entry.name == 'install.rdf'
          data = Nokogiri::XML(data)
          data.at('//em:updateURL').unlink
          data = data.to_xml
        end
        tgt.get_output_stream(entry.name) { |os| os.write data }
      end
    end
  end
end

task :validate => XPI do
  dir = File.expand_path(File.dirname(XPI)).shellescape
  xpi = File.basename(XPI).shellescape
  sh "docker run --rm -v #{dir}:/xpi marceloandrader/amo-validator /xpi/#{xpi} -v -t extension --selfhosted"
end

task :test, [:tag] => XPI do |t, args|
  if File.file?('features/plugins.yml')
    plugins = YAML.load_file('features/plugins.yml')
  else
    plugins = []
  end
  plugins << "file://" + File.expand_path(XPI)
  plugins << 'https://zotplus.github.io/debug-bridge/update.rdf'
  plugins << 'https://www.zotero.org/download/update.rdf'
  plugins.uniq!
  ZotPlus::RakeHelper.getxpis(plugins, 'tmp/plugins')

  if ENV['CIRCLE_SHA1'].to_s != ''
    tag = {'0' => 'export1', '1' => 'export2', '2' => 'import', '3' => 'bulkexport'}[ENV['CIRCLE_NODE_INDEX'].to_s]
  else
    tag = args[:tag]
  end
  tag = "@#{tag}".sub(/^@@/, '@')
  puts "Tests running: #{tag}"

  if tag == '@'
    tag = ''
  else
    tag = "--tags #{tag}"
  end

  success = true
  open('cucumber.log', 'w'){|log|
    IO.popen("cucumber #{tag}"){|io|
      io.each { |line|
        log.write(line)
        puts line.chomp
      }
      io.close
      success = ($?.to_i == 0)
    }
  }
  throw 'One or more tests failed' unless success
end

task :circle => XPI do |t, args|
  if File.file?('features/plugins.yml')
    plugins = YAML.load_file('features/plugins.yml')
  else
    plugins = []
  end
  plugins << "file://" + File.expand_path(XPI)
  plugins << 'https://zotplus.github.io/debug-bridge/update.rdf'
  plugins << 'https://www.zotero.org/download/update.rdf'
  plugins.uniq!
  ZotPlus::RakeHelper.getxpis(plugins, 'tmp/plugins')

  FileUtils.mkdir_p("#{ENV['CIRCLE_TEST_REPORTS']}/cucumber")
  sh "cucumber --format json --out #{ENV['CIRCLE_TEST_REPORTS']}/cucumber/tests.cucumber"
end

task :clean do
  clean = Dir['**/*.js'].select{|f| f=~ /^(defaults|chrome|resource)\//} + Dir['tmp/*'].select{|f| File.file?(f) } + Dir['resource/transators/*.json']
  clean << 'resource/translators/latex_unicode_mapping.coffee'
  clean << '.depends.mf'
  clean.each{|f|
    File.unlink(f)
  }
end

task :dropbox => XPI do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(dropbox, XPI))
end

file 'resource/translators/unicode.xml' do |t|
  ZotPlus::RakeHelper.download('http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)
end

file 'resource/translators/xregexp-all-min.js' do |t|
  ZotPlus::RakeHelper.download('http://cdnjs.cloudflare.com/ajax/libs/xregexp/2.0.0/xregexp-all-min.js', t.name)
end

file 'resource/translators/json5.js' do |t|
  ZotPlus::RakeHelper.download('https://raw.githubusercontent.com/aseemk/json5/master/lib/json5.js', t.name)
end

file 'chrome/content/zotero-better-bibtex/jsencrypt.min.js' do |t|
  ZotPlus::RakeHelper.download('https://raw.githubusercontent.com/travist/jsencrypt/master/bin/jsencrypt.min.js', t.name)
end

file 'resource/translators/latex_unicode_mapping.coffee' => ['resource/translators/unicode.xml', 'Rakefile'] do |t|
  map = Nokogiri::XML(open(t.source))

  map.at('//charlist') << "
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
    nodes = map.xpath(".//latex[normalize-space(text())='#{ist}']")
    next unless nodes
    nodes.each{|node| node.content = soll }
  }

  mapping = {}
  map.xpath('//character[@dec and latex]').each{|char|
    id = char['dec'].to_s.split('-').collect{|i| Integer(i)}
    key = id.pack('U' * id.size)
    value = char.at('.//latex').inner_text
    mathmode = (char['mode'] == 'math')

    case key
      when '[', ']'
        value = "{#{key}}"
        mathmode = false
      # TODO: replace '}' and '{' with textbrace(left|right) once the bug mentioned in
      # http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754
      # is widely enough distributed
      when '_', '}', '{'
        value = "\\" + key
        mathmode = false
      when "\u00A0"
        value = ' '
        mathmode = false
    end

    next if key =~ /^[\x20-\x7E]$/ && ! %w{# $ % & ~ _ ^ { } [ ] > < \\}.include?(key)
    next if key == value && !mathmode

    value = "{\\#{$1}#{$2}}" if value =~ /^\\(["^`\.'~]){([^}]+)}$/
    value = "{\\#{$1} #{$2}}" if value =~ /^\\([cuHv]){([^}]+)}$/

    # need to figure something out for this. This has the form X<combining char>, which needs to be transformed to 
    # \combinecommand{X}
    #raise value if value =~ /LECO/

    mapping[key] = OpenStruct.new({latex: value, math: mathmode})
  }

  u2l = {
    unicode: OpenStruct.new({ math: [], map: {} }),
    ascii: OpenStruct.new({ math: [], map: {} })
  }

  l2u = { }

  mapping.each_pair{|key, repl|
    # need to figure something out for this. This has the form X<combining char>, which needs to be transformed to 
    # \combinecommand{X}
    #raise value if value =~ /LECO/

    latex = [repl.latex]
    case repl.latex
      when /^(\\[a-z][^\s]*)\s$/i, /^(\\[^a-z])\s$/i  # '\ss ', '\& ' => '{\\s}', '{\&}'
        latex << "{#{$1}}"
      when /^(\\[^a-z]){(.)}$/                       # '\"{a}' => '\"a'
        latex << "#{$1}#{$2}"
      when /^(\\[^a-z])(.)\s*$/                       # '\"a " => '\"{a}'
        latex << "#{$1}{#{$2}}"
      when /^{(\\[.]+)}$/                             # '{....}' '.... '
        latex << "#{$1} "
    end

    # prefered option is braces-over-traling-space because of miktex bug that doesn't ignore spaces after commands
    latex.sort!{|a, b|
      nsa = !(a =~ /\s$/)
      nsb = !(a =~ /\s$/)
      ba = a.gsub(/[^{]/, '')
      bb = b.gsub(/[^{]/, '')
      if nsa == nsb
        bb <=> ba
      elsif nsa
        -1
      elsif nsb
        1
      else
        a <=> b
      end
    }

    if key =~ /^[\x20-\x7E]$/ # an ascii character that needs translation? Probably a TeX special character
      u2l[:unicode].map[key] = latex[0]
      u2l[:unicode].math << key if repl.math
    end

    u2l[:ascii].map[key] = latex[0]
    u2l[:ascii].math << key if repl.math

    latex.each{|ltx|
      l2u[ltx] = key if ltx =~ /\\/
    }
  }

  l2u["\\url"] = '';
  l2u["\\href"] = '';

  cs = []
  cs << "LaTeX.toLaTeX = { unicode: Object.create(null), ascii: Object.create(null) }"
  [:unicode, :ascii].each{|map|
    cs << "LaTeX.toLaTeX.#{map}.math ="
    u2l[map].map.each_pair{|k, v|
    cs << "  #{k.inspect}: #{v.inspect}" if u2l[map].math.include?(k)
    }
    cs << "LaTeX.toLaTeX.#{map}.text ="
    u2l[map].map.each_pair{|k, v|
    cs << "  #{k.inspect}: #{v.inspect}" unless u2l[map].math.include?(k)
    }
  }

  cs << 'LaTeX.toUnicode ='
  l2u.each_pair{|k, v|
  cs << "  #{k.inspect}: #{v.inspect}"
  }

  cs << ''

  open(t.name, 'w'){|f| f.write(cs.join("\n")) }
end

task :markfailing do
  tests = false

  failing = {}
  Dir['features/*.feature'].each{|f| failing[f] = [] }
  IO.readlines('cucumber.log').each{|line|
    tests ||= line =~ /^Failing Scenarios:/
    next unless tests
    next unless line =~ /^cucumber /

    line.sub!(/^cucumber /, '')
    line.sub!(/\s?#.*/, '')
    line.strip!
    file, line = *line.split(':', 2)
    line = Integer(line)
    failing[file] << line
  }

  tags = {}
  failures = 0
  failing.each_pair{|file, lines|
    script = ''
    IO.readlines(file).each_with_index{|line, i|
      lineno = i + 1
      throw "untagged #{file}@#{lineno}: #{line}" if lines.include?(lineno) && !tags[lineno - 1]

      if line !~ /^@/ && line.strip != ''
        script += line
        next
      end

      tags[lineno] = line

      line.gsub!(/@failing[^\s]*/, '')
      line.sub!(/\s+/, ' ')
      line.strip!
      if lines.include?(lineno + 1)
        failures += 1
        line = "@failing @failing-#{failures} #{line}"
      end
      script += line + "\n"
    }

    open(file, 'w'){|f| f.write(script) }
  }
end

GR="node_modules/.bin/github-release"
task GR do
  tmp = 'tmp/github-release.tar.bz2'
  ZotPlus::RakeHelper.download('https://github.com/aktau/github-release/releases/download/v0.5.3/linux-amd64-github-release.tar.bz2', tmp)
  sh "tar xjf #{tmp} -C node_modules/.bin --strip-components 3"
end

task :deploy => [XPI, GR, UPDATE_RDF] do
  Dir['cucumber.*.status'].each{|status|
    result = open(status).read
    throw "#{status}: #{result}" unless result == 'success'
  }
  throw "GITHUB_TOKEN not set" unless ENV['GITHUB_TOKEN']
  tagged = `git rev-list #{RELEASE} | head -1`
  current = ENV['CIRCLE_SHA1'].to_s.strip
  puts "#{RELEASE}: tagged=#{tagged}, current=#{current}"
  if tagged == current
    puts "Deploying #{RELEASE} (#{ENV['CIRCLE_SHA1']})"
    sh "#{GR} release --user ZotPlus --repo zotero-better-bibtex --tag #{RELEASE} --name 'v#{RELEASE}'"
    #sh "#{GR} upload --user ZotPlus --repo zotero-better-bibtex --tag #{RELEASE} --name '#{XPI}' --file '#{XPI}'"
    open("www/_includes/#{EXTENSION}-version.html", 'w'){|f| f.write(RELEASE) }
    system "cd www; rake publish"
  else
    puts "Not a tagged release"
  end
end

file '.depends.mf' => SOURCES do |t|
  open(t.name, 'w'){|dmf|
    dependencies = {}

    t.prerequisites.each{|src|
      next unless File.extname(src) == '.coffee' || File.extname(src) == '.pegcoffee'
      js = File.join(File.dirname(src), File.basename(src, File.extname(src)) + '.js')

      dependencies[src] ||= []
      dependencies[src] << js

      yml = File.join(File.dirname(src), File.basename(src, File.extname(src)) + '.yml')
      if File.file?(yml)
        dependencies[yml] ||= []
        dependencies[yml] << js
      end

      expand(open(src), collect: true)[1].each{|dep|
        dependencies[dep] ||= []
        dependencies[dep] << js
      }
    }

    dependencies.each_pair{|dependency, dependants|
      dmf.write("#{dependants.uniq.sort.collect{|d| d.shellescape }.join(' ')} : #{dependency.shellescape}\n")
    }
  }
end
import '.depends.mf'
