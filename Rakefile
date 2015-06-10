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
require 'washbullet'
require 'rake/loaders/makefile'
require 'selenium-webdriver'
require 'rchardet'

NODEBIN="node_modules/.bin"
TIMESTAMP = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')

ABBREVS = YAML.load_file('resource/abbreviations/lists.yml')
ABBREVS.each{|a|
  if File.basename(a['path']) == 'WOS.json'
    file a['path'] => 'Rakefile' do |t|
      tmp = "tmp/WOS.html"
      abbrevs = {}
      (('A'..'Z').to_a + ['0-9']).each{|list|
        ZotPlus::RakeHelper.download(a['url'].sub('<>', list), tmp)
        doc = Nokogiri::HTML(open(tmp))

        dt = nil
        doc.xpath("//*[name()='dt' or name()='dd']").each{|node|
          next unless %w{dt dd}.include?(node.name)
          node = node.dup
          node.children.each{|c| c.unlink unless c.name == 'text'}
          text = node.inner_text.strip
          if node.name == 'dt'
            dt = (text == '' ? nil : text.downcase)
          elsif dt
            abbrevs[dt] = text
          end
        }
      }
      abbrevs = { default: { 'container-title' => abbrevs } }
      open(t.name, 'w'){|f| f.write(JSON.pretty_generate(abbrevs)) }
    end
  else
    file a['path'] => 'Rakefile' do |t|
      tmp = "tmp/#{File.basename(t.name)}"
      ZotPlus::RakeHelper.download(a['url'], tmp)

      text = open(tmp).read
      cd = CharDet.detect(text)
      if !%w{ascii utf-8}.include?(cd['encoding'].downcase)
        text = text.encode('utf-8', cd['encoding'])
        open(tmp, 'w'){|f| f.write(text) }
      end
        
      abbrevs = {}
      IO.readlines(tmp).each{|line|
        line.strip!
        next if line[0] == '#'
        next unless line =~ /=/
        line = line.split('=', 2).collect{|t| t.strip}
        next if line.length != 2
        journal, abbrev = *line
        journal.downcase!
        abbrev.sub(/\s*;.*/, '')
        next if journal == '' || abbrev == ''

        terms = journal.split(/(\[[^\]]+\])/).reject{|t| t.strip == ''}.collect{|t|
          if t[0] == '[' && t[-1] == ']'
            OpenStruct.new(term: t[1..-2].downcase)
          else
            OpenStruct.new(term: t.downcase, required: true)
          end
        }

        (1..2**terms.length).collect{|permutation|
          (0..terms.length-1).collect{|term|
            terms[term].required || ((1 << term) & permutation) != 0 ?  terms[term].term : nil
          }.compact.join(' ').strip
        }.collect{|name|
          name.gsub!(/[^a-z]+/, ' ')
          name.gsub!(/\s+/, ' ')
          name.strip
        }.uniq.each{|journal|
          abbrevs[journal] = abbrev
        }
      }
      abbrevs = { default: { 'container-title' => abbrevs } }
      open(t.name, 'w'){|f| f.write(JSON.pretty_generate(abbrevs)) }
    end
  end
}
ZIPFILES = [
  'chrome.manifest',
  'chrome/content/zotero-better-bibtex/BetterBibTeXFormatter.js',
  'chrome/content/zotero-better-bibtex/cache.js',
  'chrome/content/zotero-better-bibtex/citekeyformatter.js',
  'chrome/content/zotero-better-bibtex/debug-bridge.js',
  'chrome/content/zotero-better-bibtex/errorReport.js',
  'chrome/content/zotero-better-bibtex/errorReport.xul',
  'chrome/content/zotero-better-bibtex/exportOptions.js',
  'chrome/content/zotero-better-bibtex/exportOptions.xul',
  'chrome/content/zotero-better-bibtex/include.js',
  'chrome/content/zotero-better-bibtex/itemPane.js',
  'chrome/content/zotero-better-bibtex/itemPane.xul',
  'chrome/content/zotero-better-bibtex/jsencrypt.min.js',
  'chrome/content/zotero-better-bibtex/keymanager.js',
  'chrome/content/zotero-better-bibtex/lokijs.js',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.js',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/schomd.js',
  'chrome/content/zotero-better-bibtex/serialized.js',
  'chrome/content/zotero-better-bibtex/web-endpoints.js',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.js',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'defaults/preferences/defaults.js',
  'install.rdf',
  'resource/error-reporting.pub.pem',
  'resource/translators/Better BibLaTeX.header.js',
  'resource/translators/Better BibLaTeX.js',
  'resource/translators/Better BibLaTeX.json',
  'resource/translators/Better BibTeX.header.js',
  'resource/translators/Better BibTeX.js',
  'resource/translators/Better BibTeX.json',
  'resource/translators/BetterBibTeXBraceBalancer.js',
  'resource/translators/BetterBibTeXParser.js',
  'resource/translators/BetterBibTeXParserSupport.js',
  'resource/translators/BibTeXAuxScanner.header.js',
  'resource/translators/BibTeXAuxScanner.js',
  'resource/translators/BibTeXAuxScanner.json',
  'resource/translators/LaTeX Citation.header.js',
  'resource/translators/LaTeX Citation.js',
  'resource/translators/LaTeX Citation.json',
  'resource/translators/Pandoc Citation.header.js',
  'resource/translators/Pandoc Citation.js',
  'resource/translators/Pandoc Citation.json',
  'resource/translators/Zotero TestCase.header.js',
  'resource/translators/Zotero TestCase.js',
  'resource/translators/Zotero TestCase.json',
  'resource/translators/json5.js',
  'resource/translators/latex_unicode_mapping.js',
  'resource/translators/translator.js',
  'resource/translators/unicode_translator.js',
  'resource/translators/xregexp-all-min.js',
] + Dir['chrome/skin/**/*.*'] # + ABBREVS.collect{|a| a['path']}


Dir['**/*.js'].reject{|f| f =~ /^(node_modules|www)\//}.each{|f| CLEAN.include(f)}
CLEAN.include('tmp/**/*')
CLEAN.include('resource/*/*.json')
CLEAN.include('resource/*/*.js.map')
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

def saveAbbrevs(abbrevs, file, jurisdiction='default')
  abbrevs.keys.each{|journal|
    if journal == abbrevs[journal]
      abbrevs.delete(journal)
#    else
#      dc = journal.downcase.gsub(/[^a-z]+/, ' ').gsub(/\s+/, ' ').strip # maybe not...
#      if dc != journal
#        abbrevs[dc] = abbrevs[journal]
#        abbrevs.delete(journal)
#      end
    end
  }
  json = {}
  json[jurisdiction] = { 'container-title' => abbrevs }
  open(file, 'w'){|f| f.write(JSON.pretty_generate(json)) }
end

file 'resource/abbreviations/CAplus.json' => 'Rakefile' do |t|
  abbrevs = {}
  doc = Nokogiri::HTML(open('http://www.cas.org/content/references/corejournals'))
  doc.at('//table').xpath('.//tr').each_with_index{|abb, i|
    next if i == 0
    abb = abb.xpath('.//td').collect{|t| t.inner_text.strip}
    next unless abb.length > 1
    next if abb[0] == '' || abb[1] == ''
    abbrevs[abb[0]] = abb[1]
  }
  saveAbbrevs(abbrevs, t.name)
end

file 'resource/abbreviations/J_Entrez.json' => 'Rakefile' do |t|
  record = {}
  abbrevs = {}
  IO.readlines(open('ftp://ftp.ncbi.nih.gov/pubmed/J_Entrez.txt')).each{|line|
    line.strip!
    if line =~ /^-+$/
      abbrevs[record['JournalTitle']] = record['MedAbbr'] if record['JournalTitle'] && record['MedAbbr']
      abbrevs[record['JournalTitle']] = record['IsoAbbr'] if record['JournalTitle'] && record['IsoAbbr']
      record = {}
      next
    end
    line = line.split(':', 2).collect{|t| t.strip}
    next if line.length != 2
    next if line[0] == '' || line[1] == ''
    record[line[0]] = line[1]
  }
  abbrevs[record['JournalTitle']] = record['MedAbbr'] if record['JournalTitle'] && record['MedAbbr']
  abbrevs[record['JournalTitle']] = record['IsoAbbr'] if record['JournalTitle'] && record['IsoAbbr']
  saveAbbrevs(abbrevs, t.name)
end

file 'resource/abbreviations/Science_and_Engineering.json' => 'Rakefile' do |t|
  abbrevs = {}
  jsonp = open('http://journal-abbreviations.library.ubc.ca/dump.php').read
  jsonp.sub!(/^\(/, '')
  jsonp.sub!(/\);/, '')
  doc = Nokogiri::HTML(JSON.parse(jsonp)['html'])
  doc.at('//table').xpath('.//tr').each{|tr|
    tds = tr.xpath('.//td')
    next if tds.length != 2
    journal, abbr = *(tds.collect{|t| t.inner_text.strip})
    next if journal == '' || abbr == ''
    abbrevs[journal] = abbr
  }
  saveAbbrevs(abbrevs, t.name)
end

file 'resource/abbreviations/BioScience.json' => 'Rakefile' do |t|
  abbrevs = {}
  %w{a-b c-g h-j k-q r-z}.each{|list|
    doc = Nokogiri::HTML(open("http://guides.lib.berkeley.edu/bioscience-journal-abbreviations/#{list}"))
    doc.xpath('//table').each{|table|
      table.xpath('.//tr').each_with_index{|tr, i|
        next if i == 0
        tds = tr.xpath('.//td')
        next if tds.length != 2
        journal, abbr = *(tds.collect{|t| t.inner_text.strip})
        next if journal == '' || abbr == ''
        abbrevs[journal] = abbr
      }
    }
  }
  saveAbbrevs(abbrevs, t.name)
  abbrevs = { default: { 'container-title' => abbrevs } }
end

rule '.json' => '.yml' do |t|
  open(t.name, 'w'){|f|
    header = YAML::load_file(t.source)
    header['lastUpdated'] = TIMESTAMP if t.source =~ /\/translators\//
    f.write(JSON.pretty_generate(header))
  }
end

rule( /\.header\.js$/ => [ proc {|task_name| task_name.sub(/\.header\.js$/, '.yml') } ]) do |t|
  header = YAML.load_file(t.source)
  open(t.name, 'w'){|f|
    f.write("
      Translator.header = #{header.to_json};
      Translator.release = #{RELEASE.to_json};
      Translator.#{header['label'].gsub(/\s/, '')} = true;
    ")
  }
end

rule '.js' => '.pegjs' do |t|
  sh "#{NODEBIN}/pegjs -e #{File.basename(t.source, File.extname(t.source))} #{t.source.shellescape} #{t.name.shellescape}"
end

rule '.js' => '.coffee' do |t|
  sh "#{NODEBIN}/coffeelint #{t.source.shellescape}"
  sh "#{NODEBIN}/coffee -bc #{t.source.shellescape}"
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

  ok = true
  begin
    rerun = File.file?('tmp/cucumber.rerun') && open('tmp/cucumber.rerun').read.strip != ''
    if rerun
      rerun = '@tmp/cucumber.rerun'
    else
      rerun = "--format pretty --format rerun --out tmp/cucumber.rerun"
    end

    begin
      if OS.mac?
        sh "script -q -t 1 cucumber.run cucumber --strict #{tag}"
      else
        sh "script -ec 'cucumber --require features #{rerun} --strict #{tag}' cucumber.run"
      end
    ensure
      sh "sed -re 's/\\x1b[^m]*m//g' cucumber.run | col -b > cucumber.log"
      sh "rm -f cucumber.run"
    end
  rescue => e
    ok = false
    raise e
  ensure
    if File.file?('.pushbullet') || ENV['PUSHBULLET_ACCESS_TOKEN'].to_s.strip != ''
      access_token = ENV['PUSHBULLET_ACCESS_TOKEN'].to_s.strip
      if access_token == ''
        creds = YAML.load_file('.pushbullet')
        access_token = creds['access_token']
      end

      title = ["Cucumber tests #{tag}".strip]
      title << 'at Circle' if ENV['CI'] == 'true'
      title << "have finished"
      title << (ok ? 'green' : 'red')
      client = Washbullet::Client.new(access_token)
      title = title.join(' ')
      body = title
      client.push_note({receiver: :email, identifier: client.me.body['email'], params: { title: title, body: body }})
    end
  end
end

task :share => XPI do
  folder = ['~/Google Drive/Public', '~/GoogleDrive/Public' ].collect{|p| File.expand_path(p) }.detect{|p| File.directory?(p) }
  raise "No share folder" unless folder
  Dir["#{folder}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(folder, XPI))
end

file 'resource/translators/org.js' do |t|
  ZotPlus::RakeHelper.download('https://raw.githubusercontent.com/mooz/org-js/master/org.js', t.name)
end

file 'resource/translators/unicode.xml' do |t|
  ZotPlus::RakeHelper.download('http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)
end

file 'chrome/content/zotero-better-bibtex/lokijs.js' => 'Rakefile' do |t|
  ZotPlus::RakeHelper.download('https://raw.githubusercontent.com/techfort/LokiJS/master/build/lokijs.min.js', t.name)
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
  cs << "LaTeX = {} unless LaTeX"
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
