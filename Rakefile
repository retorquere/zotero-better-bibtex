require 'rake'
require 'os'
require 'rake/clean'
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
require 'selenium-webdriver'

NODEBIN="node_modules/.bin"
TIMESTAMP = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')

LINTED=[]
def expand(file, options={})
  #puts "expanding #{file.path.gsub(/^\.\//, '').inspect}"
  if File.extname(file.path) == '.coffee' && !LINTED.include?(file.path)
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
    elsif tbi == ':constants:'
      throw "No header information present" unless options[:header]
      result = []
      result << "Translator.translatorID    = #{options[:header]['translatorID'].to_json}"
      result << "Translator.label           = #{options[:header]['label'].to_json}"
      result << "Translator.timestamp       = #{options[:header]['lastUpdated'].to_json}"
      result << "Translator.release         = #{RELEASE.to_json}"
      Dir['resource/translators/*.yml'].sort.each{|yml|
        header = YAML.load_file(yml)
        result << "Translator.#{header['label'].gsub(/\s/, '')} = true" if header['translatorID'] == options[:header]['translatorID']
      }
      result = result.join("\n")
    else
      #puts "including #{tbi.inspect}"
      i = [File.join(File.dirname(file.path), tbi), File.join('include', tbi)].detect{|f| File.file?(f) }
      throw "#{tbi} not found in #{file.path}" unless i
      result = File.file?(i) ? expand(open(i), options.merge(namespace: namespace)) : ''
    end
    prefix + result
  }
  return src
end

ZIPFILES = [
  'chrome/content/zotero-better-bibtex/errorReport.js',
  'chrome/content/zotero-better-bibtex/errorReport.xul',
  'chrome/content/zotero-better-bibtex/exportOptions.js',
  'chrome/content/zotero-better-bibtex/exportOptions.xul',
  'chrome/content/zotero-better-bibtex/include.js',
  'chrome/content/zotero-better-bibtex/jsencrypt.min.js',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences_advanced.xul',
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

def makedepend
  scanning = ZIPFILES.dup
  scanned = []
  dependencies={}
  while scanning.length > 0
    target = scanning.pop
    scanned << target

    next if target == 'Rakefile'

    sources = []
    case File.extname(target)
      when '.js'
        %w{coffee pegcoffee}.each{|ext|
          src = File.join(File.dirname(target), File.basename(target, File.extname(target)) + ".#{ext}")
          sources << src if File.file?(src)
        }
        if File.file?(target)
          IO.readlines(target).each{|line|
            next unless line =~ /^require\s*\(?\s*'([^'\n]+)'/
            required = $1.strip
            if required == ':constants:'
              required = 'Rakefile'
            else
              required = File.join(File.dirname(target), required)
            end
            scanning << required unless (scanned + scanning).include?(required)
            sources << required
          }
        end

      when '.json'
        sources << File.join(File.dirname(target), File.basename(target, File.extname(target)) + '.yml')

      when '.coffee'
        if File.file?(target)
          IO.readlines(target).each{|line|
            next unless line =~ /^require\s*\(?\s*'([^'\n]+)'([^\n]*)/
            required = $1.strip
            if required == ':constants:'
              required = 'Rakefile'
            else
              required = File.join(File.dirname(target), required)
            end
            scanning << required unless (scanned + scanning).include?(required)
            sources << required
          }
        end

      when '.manifest', '.xul', '.rdf', '.dtd', '.properties', '.pem', '.svg', '.css', '.yml', '.pegcoffee'
      else throw "Unexpected extension for #{target}"
    end

    sources.each{|source|
      dependencies[source] ||= []
      dependencies[source] << target
      scanning << source unless (scanned + scanning).include?(source)
    }
  end

  begin
    done = true
    dependencies.each_pair{|dependency, dependants|
      dependants.each{|dep|
        if File.extname(dep) == '.coffee'
          done = false
          dependants.delete(dep)
          dependencies[dep].each{|d|
            dependants << d
          }
        end
      }
    }
  end until done

  open('.depend.mf', 'w'){|dmf|
    dependencies.each_pair{|dependency, dependants|
      dmf.write("#{dependants.uniq.sort.collect{|d| d.shellescape }.join(' ')} : #{dependency.shellescape}\n")
    }
  }
end
makedepend
import '.depend.mf'

Dir['**/*.js'].reject{|f| f =~ /^(node_modules|www)\//}.each{|f| CLEAN.include(f)}
CLEAN.include('tmp/**/*')
CLEAN.include('resource/translators/*.json')
CLEAN.include('.depend.mf')
CLEAN.include('resource/translators/latex_unicode_mapping.coffee')
CLEAN.include('*.xpi')
CLEAN.include('*.log')
CLEAN.include('*.cache')
CLEAN.include('*.debug')

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

  compile = "#{NODEBIN}/coffee -bcp #{tmp.shellescape}"
  output, status = Open3.capture2e(compile)
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

task :test, [:tag] => [XPI, :plugins] do |t, args|
  tag = "@#{args[:tag]}".sub(/^@@/, '@')

  if tag == '@'
    tag = "--tag ~@noci"
  elsif tag == '@all'
    tag = ''
  else
    tag = "--tags #{tag}"
  end

  puts "Tests running: #{tag}"

  if OS.mac?
    sh "script -q -t 1 cucumuber.log cucumber --strict --no-color #{tag}"
  else
    sh "script -ec 'cucumber --strict --no-color #{tag}' cucumber.log"
  end
end

task :share => XPI do
  folder = ['~/Google Drive/Public', '~/GoogleDrive/Public' ].collect{|p| File.expand_path(p) }.detect{|p| File.directory?(p) }
  raise "No share folder" unless folder
  Dir["#{folder}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(folder, XPI))
end

file 'resource/translators/unicode.xml' do |t|
  ZotPlus::RakeHelper.download('http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)
end

file 'chrome/content/zotero-better-bibtex/lokijs.js' => 'Rakefile' do |t|
  ZotPlus::RakeHelper.download('https://raw.githubusercontent.com/techfort/LokiJS/master/build/lokijs.min.js', t.name)

  #js = open(t.name).read
  #open(t.name, 'w'){|f|
    #f.puts("
      #Zotero.BetterBibTeX.cache.stringify = (function () {
        #module = {};
        #require = function() { throw new Error('this is not commonJS'); }
        ##{js}
        #return module.exports;
      #})();
    #")
  #}
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

task :jasmine do

  profiles = File.expand_path('test/fixtures/profiles/')
  FileUtils.mkdir_p(profiles)
  profile_dir = File.join(profiles, 'default')
  profile = Selenium::WebDriver::Firefox::Profile.new(profile_dir)

  (Dir['*.xpi'] + Dir['test/fixtures/plugins/*.xpi']).each{|xpi|
    profile.add_extension(xpi)
  }

  profile['extensions.zotero.showIn'] = 2
  profile['extensions.zotero.httpServer.enabled'] = true
  profile['dom.max_chrome_script_run_time'] = 6000
  profile['extensions.zotfile.useZoteroToRename'] = true
  profile['browser.download.dir'] = "/tmp/webdriver-downloads"
  profile['browser.download.folderList'] = 2
  profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
  profile['pdfjs.disabled'] = true
  driver = Selenium::WebDriver.for :firefox, :profile => profile

  driver.navigate.to('chrome://zotero/content/tab.xul')
  output = driver.execute_script('return Object.keys(Zotero);')
  #output = driver.execute_script('return consoleReporter.getLogsAsString();')
  driver.quit

  print output

  # Make sure to exit with code > 0 if there is a test failure
  #raise RuntimeError, 'Failure' unless status === 'success'
end
