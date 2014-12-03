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

LINTED=[]
def expand(file, options={})
  dependencies = []

  #puts "expanding #{file.path.gsub(/^\.\//, '').inspect}"
  if File.extname(file.path) == '.coffee' && !options[:collect] && !LINTED.include?(file.path)
    sh "coffeelint #{file.path.shellescape}"
    LINTED << file.path
  end

  src = file.read
  src.gsub!(/(^|\n)require\s*\(?\s*'([^'\n]+)'[^\n]*/) {
    all = $&
    prefix = $1
    tbi = $2.strip

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
        result << "Translator.id              = #{options[:header]['translatorID'].to_json}"
        result << "Translator.label           = #{options[:header]['label'].to_json}"
        result << "Translator.timestamp       = #{options[:header]['lastUpdated'].to_json}"
        result << "Translator.release         = #{RELEASE.to_json}"
        result << "Translator.unicode_default = #{(!(((options[:header]['displayOptions'] || {})['exportCharset'] || 'ascii').downcase =~ /ascii/)).to_json}"
        result = result.join("\n")
      end
    else
      #puts "including #{tbi.inspect}"
      tbi = File.join(File.dirname(file.path), tbi)
      dependencies << tbi
      result = File.file?(tbi) || !options[:collect] ? expand(open(tbi), options) : ''
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
  'chrome.manifest',
  'chrome/content/zotero-better-bibtex/include.js',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.js',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.js',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'chrome/skin/default/zotero-better-bibtex/overlay.css',
  'chrome/skin/default/zotero-better-bibtex/prefs.png',
  'defaults/preferences/defaults.js',
  'install.rdf',
  'resource/translators/Better BibLaTeX.js',
  'resource/translators/Better BibTeX.js',
  'resource/translators/LaTeX Citation.js',
  'resource/translators/Pandoc Citation.js',
  'resource/translators/Zotero TestCase.js',
]

SOURCES = [
  #'chrome/content/zotero-better-bibtex/auto-export.coffee',
  'chrome/content/zotero-better-bibtex/Formatter.pegcoffee',
  'chrome/content/zotero-better-bibtex/include.coffee',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.coffee',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.coffee',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'chrome.manifest',
  'chrome/skin/default/zotero-better-bibtex/overlay.css',
  'chrome/skin/default/zotero-better-bibtex/prefs.png',
  'defaults/preferences/defaults.coffee',
  'install.rdf',
  'Rakefile',
  'resource/translators/Better BibLaTeX.coffee',
  'resource/translators/Better BibTeX.coffee',
  'resource/translators/LaTeX Citation.coffee',
  'resource/translators/mathchar.pegcoffee',
  'resource/translators/Pandoc Citation.coffee',
  'resource/translators/Parser.pegcoffee',
  'resource/translators/Unicode2LaTeX.pegcoffee',
  'resource/translators/unicode_translator.coffee',
  'resource/translators/translator.coffee',
  'resource/translators/Zotero TestCase.coffee',
  'tmp/unicode.xml',
  'update.rdf',
]

FileUtils.mkdir_p 'tmp'

class String
  def shellescape
    Shellwords.escape(self)
  end
end

require 'zotplus-rakehelper'

rule '.js' => '.pegcoffee' do |t|
  name = "tmp/#{File.basename(t.name)}"
  source = "tmp/#{File.basename(t.source)}"
  open(source, 'w'){|f| f.write(expand(open(t.source))) }
  sh "pegjs --plugin pegjs-coffee-plugin -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{source} #{name}"
  FileUtils.mv(name, t.name)
end

rule '.js' => '.coffee' do |t|
  header = t.source.sub(/\.coffee$/, '.yml')
  if File.file?(header)
    header = YAML.load_file(header)
    header['lastUpdated'] = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
  else
    header = nil
  end

  tmp = "tmp/#{File.basename(t.source)}"
  open(tmp, 'w'){|f| f.write(expand(open(t.source), header: header)) }
  puts "Compiling #{t.source}"
  output, status = Open3.capture2e("coffee -bpc #{tmp.shellescape}")
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
    header = header ? JSON.pretty_generate(header) + "\n" : ''
    target.write(header + output)
  }
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

  tag = "@#{args[:tag]}".sub(/^@@/, '@')

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

task :clean do
  clean = Dir['**/*.js'].select{|f| f=~ /^(defaults|chrome|resource)\//} + Dir['tmp/*'].select{|f| File.file?(f) }
  clean.each{|f|
    File.unlink(f)
  }
end

task :dropbox => XPI do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(dropbox, XPI))
end

file 'tmp/unicode.xml' do |t|
  ZotPlus::RakeHelper.download('http://web.archive.org/web/20131109072541/http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)
end

file 'resource/translators/latex_unicode_mapping.coffee' => ['tmp/unicode.xml', 'Rakefile'] do |t|
  unicode_mapper(t.source, t.name)
end
file 'resource/translators/mathchar.pegcoffee' => ['tmp/unicode.xml', 'Rakefile'] do |t|
  unicode_mapper(t.source, t.name)
end

def unicode_mapper(source, tgt)
  map = Nokogiri::XML(open(source))

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
      when '_', '}', '{'
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

  if File.extname(tgt) == '.coffee'
    ls = []
    ls << 'LaTeX.toLaTeX ='
    u2l[:ascii].map.each_pair{|k, v|
    ls << "  #{k.inspect}: #{v.inspect}"
    }
    ls << 'LaTeX.toUnicode ='
    l2u.each_pair{|k, v|
    ls << "  #{k.inspect}: #{v.inspect}"
    }

  elsif File.extname(tgt) == '.pegcoffee'
    ls = []
    ls << 'mathchar'
    ls << "  = & { @unicode  } char:[#{u2l[:unicode].math.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('')}] { return char }"
    ls << "  / & { !@unicode } char:[#{u2l[:ascii].math.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('')}] { return char }"
    ls << ''
    ls << 'textchar'
    ls << "  = & { @unicode  } char:[#{u2l[:unicode].map.keys.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('')}] { return char }"
    ls << "  / & { !@unicode } char:[#{u2l[:ascii].map.keys.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('')}] { return char }"
  end

  ls << ''
  open(tgt, 'w'){|f| f.write(ls.join("\n")) }
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

      if line !~ /^@/
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


