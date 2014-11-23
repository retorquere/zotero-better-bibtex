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

def expand(file, options={})
  dependencies = []

  puts "expanding #{file.path.gsub(/^\.\//, '').inspect}"
  src = file.read
  src.gsub!(/(^|\n)require\s+'([^'\n]+)'[^\n]*/) {
    all = $0
    tbi = $2.strip
    puts "including #{tbi.inspect}"

    if tbi =~ /^js:/
      result = all
      dependencies << tbi.sub(/^js:/)
    else
      if tbi == ':constants:'
        throw "No header information present" unless options[:header]
        result = []
        result << "Translator.id        = #{header['translatorID'].to_json}"
        result << "Translator.label     = #{header['label'].to_json}"
        result << "Translator.timestamp = #{header['lastUpdated'].to_json}"
        result << "Translator.release   = #{RELEASE.to_json}"
        result << "Translator.unicode   = #{(!(((header['displayOptions'] || {})['exportCharset'] || 'ascii').downcase =~ /ascii/)).to_json}"
        result = result.join("\n")
      else
        tbi = File.join(File.dirname(file.path), tbi)
        dependencies << tbi
        result = expand(open(tbi), options)
        if result.is_a?(Array)
          dependencies << result[1]
          result = result[0]
        end
      end
    end
    result
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
  #'chrome/content/zotero-better-bibtex/auto-export.ls',
  'chrome/content/zotero-better-bibtex/Formatter.pegjs',
  'chrome/content/zotero-better-bibtex/include.ls',
  'chrome/content/zotero-better-bibtex/overlay.xul',
  'chrome/content/zotero-better-bibtex/preferences.ls',
  'chrome/content/zotero-better-bibtex/preferences.xul',
  'chrome/content/zotero-better-bibtex/zotero-better-bibtex.ls',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.dtd',
  'chrome/locale/en-US/zotero-better-bibtex/zotero-better-bibtex.properties',
  'chrome.manifest',
  'chrome/skin/default/zotero-better-bibtex/overlay.css',
  'chrome/skin/default/zotero-better-bibtex/prefs.png',
  'defaults/preferences/defaults.ls',
  'install.rdf',
  'Rakefile',
  'resource/translators/Better BibLaTeX.ls',
  'resource/translators/Better BibTeX.ls',
  'resource/translators/import.ls',
  'resource/translators/LaTeX Citation.ls',
  'resource/translators/Pandoc Citation.ls',
  'resource/translators/Parser.pegjs',
  'resource/translators/translator.ls',
  'resource/translators/unicode_mapping.ls',
  'resource/translators/Zotero TestCase.ls',
  'tmp/unicode.xml',
  'unicode.xsl',
  'update.rdf',
]

file '.depends.mf' => ZIPFILES do |t|
  open(t.name, 'w'){|d|
    t.prerequisites.each{|js|
      next unless File.extname(js) == '.js'
      ls = js.sub(/\.js$/, '.ls')
      yml = js.sub(/\.js$/, '.yml')
      dependencies = expand(open(ls), collect: true)[1]
      dependencies.unshift(ls)
      dependencies.unshift(yml) if File.file?(yml)
      d.write("#{js.shellescape}: #{dependencies.collect{|d| d.shellescape }.join(' ')}\n")
    }
  }
end

import '.depends.mf'

FileUtils.mkdir_p 'tmp'

class String
  def shellescape
    Shellwords.escape(self)
  end
end

require 'zotplus-rakehelper'

rule '.js' => '.pegjs' do |t|
  sh "pegjs -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{t.source} #{t.name}"
end

rule '.js' => '.ls' do |t|
  header = t.source.sub(/\.ls$/, '.yml')
  if File.file?(header)
    header = YAML.load_file(header)
    header['lastUpdated'] = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
  else
    header = nil
  end

  output, status = Open3.capture2e("lsc -bpc", stdin_data: expand(open(t.source), header: header))
  raise output if status.exitstatus != 0

  # include javascript generated from pegjs
  output.gsub!(/(^|\n)require\s+'js:([^'\n]+)'[^\n]*/) {
    tbi = $2.strip
    puts "Importing javascript: #{tbi}"
    tbi = File.join(File.dirname(t.source), tbi)
    open(tbi).read
  }

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

task :dropbox => XPI do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(dropbox, XPI))
end

file 'tmp/unicode.xml' do |t|
  ZotPlus::RakeHelper.download('http://web.archive.org/web/20131109072541/http://www.w3.org/2003/entities/2007xml/unicode.xml', t.name)
end

file 'resource/translators/unicode_mapping.ls' => 'tmp/unicode.xml' do |t|
  mapping = Nokogiri::XML(open(t.source))

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

  mapped = {}
  mapping.xpath('//character[@dec and latex]').each{|char|
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

    mapped[key] = {latex: value, math: mathmode}
  }

  # TODO
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

    latex = [repl['latex']]
    case repl['latex']
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
      u2l[:unicode][:map][key] = latex[0]
      u2l[:unicode][:math] << key if repl['math']
    end

    u2l[:ascii][:map][key] = latex[0]
    u2l[:ascii][:math] << key if repl['math']

    latex.each{|ltx|
      l2u[ltx] = key if ltx =~ /\\/
    }
  }

  [:ascii, :unicode].each{|map|
    u2l[map][:math] = '/(' + u2l[map][:math].collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('|') + ')/g'
    u2l[map][:text] = '/' + u2l[map][:map].keys.collect{|key| key.gsub(/([\\\^\$\.\|\?\*\+\(\)\[\]\{\}])/, '\\\\\1') }.join('|') + '/g'
  }

  open(t.name, 'w'){|f|
    f.write("
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
    ")
  }
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
