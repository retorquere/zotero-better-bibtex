require 'rake'
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
require 'zotplus-rakehelper'

BRANCH=`git rev-parse --abbrev-ref HEAD`.strip
TMP="tmp/#{BRANCH}"
UNICODE_MAPPING = "#{TMP}/unicode.json"
EXTENSION = ZotPlus::RakeHelper.new([UNICODE_MAPPING])

TRANSLATORS = [
  {name: 'Better BibTeX'},
  {name: 'Better BibLaTeX', unicode: true},
  {name: 'LaTeX Citation'},
  {name: 'Pandoc Citation'},
  {name: 'Zotero TestCase'}
]

FileUtils.mkdir_p TMP

BIBTEX_GRAMMAR  = Dir["resource/**/*.pegjs"][0]
DICT            = 'chrome/content/zotero-better-bibtex/dict.js'

def stir(livescript)
  livescript = File.expand_path(livescript)
  stirred = ''
  IO.readlines(livescript).each{|line|
    if line =~ /^#include\s+(.*)/
      sweetener = File.join(File.dirname(cofee), $1.strip)
      stirred += stir(sweetener)
    else
      stirred += line
    end
  }
  stirred
end

task :default => EXTENSION.xpi do
end

rule '.js' => '.pegjs' do |t|
  sh "pegjs -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{t.source} #{t.name}"
end
rule '.js' => '.hx' do |t|
  sh "haxe -cp #{File.dirname(t.source)} #{t.source} -js #{t.name}"
  js = open(t.name).read
  js.sub!("\n})(typeof window != \"undefined\" ? window : exports);\n", "\n})(Zotero);\n")
  open(t.name, 'w'){|f| f.write(js)}
end

task :clean do
  FileUtils.rm_rf TMP
end

task :debugbridge do
  EXTENSION.get_debugbridge
end

task :test, [:tag] => [EXTENSION.xpi, :debugbridge] do |t, args|
  tag = "@#{args[:tag]}".sub(/^@@/, '@')

  if tag == '@'
    tag = ''
  else
    tag = "--tags #{tag}"
  end

  system "cucumber #{tag}" or throw 'One or more tests failed'
end

task :dropbox => EXTENSION.xpi do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(EXTENSION.xpi, File.join(dropbox, EXTENSION.xpi))
end

file EXTENSION.xpi => EXTENSION.sources + ['update.rdf', 'install.rdf'] do |t|
  #Dir['*.xpi'].each{|xpi| File.unlink(xpi)}

  files = t.prerequisites.reject{|f| f=~ /^(test|tmp|resource\/(translators|abbreviations))\// }

  TRANSLATORS.each{|translator|
    translator[:source] = "resource/translators/#{translator[:name]}.js"
    files << {translator[:source] => Translator.new(translator).to_s}
  }

  EXTENSION.build(files)
end

file 'update.rdf' => ['install.rdf'] do |t|
  EXTENSION.make_update_rdf
end

task :publish => ['README.md', EXTENSION.xpi, 'update.rdf'] do
  EXTENSION.publish
end

file 'README.md' => ["www/#{EXTENSION.extension}/index.md", 'install.rdf', 'Rakefile'] do |t|
  EXTENSION.make_readme
end

task :bump, :what do |t, args|
  EXTENSION.bump((args[:what] || 'patch').intern)
end

#### GENERATED FILES

class Hash
 
  def deep_diff(b)
    a = self
    (a.keys | b.keys).inject({}) do |diff, k|
      if (a[k] || []) != (b[k] || []) && (a[k] || '') != (b[k] || '')
        if a[k].respond_to?(:deep_diff) && b[k].respond_to?(:deep_diff)
          diff[k] = a[k].deep_diff(b[k])
        elsif a[k].is_a?(Array) && b[k].is_a?(Array)
          extra = a[k] - b[k]
          missing = b[k] - a[k]
          if extra.empty? && missing.empty?
            diff[k] = {order: a[k]}
          else
            diff[k] = {missing: missing, extra: extra}
          end
        else
          diff[k] = [a[k], b[k]]
        end
      end
      diff
    end
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
    @_release = EXTENSION.release
    get_testcases
  end
  attr_reader :_id, :_label, :_timestamp, :_release, :_unicode, :_unicode_mapping, :_bibtex_parser, :_dict, :_testcases

  def self.dict
    @@dict ||= File.open(DICT).read
  end

  def self.parser
    @@parser ||= File.open(BIBTEX_GRAMMAR.sub(/\.pegjs$/, '.js')).read
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

    File.open(File.join(TMP, File.basename(@source)), 'w'){|f| f.write(js) }

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

file UNICODE_MAPPING => 'Rakefile' do |t|
  begin
    xml = File.join(File.dirname(t.name), File.basename(t.name, File.extname(t.name)) + '.xml')
    EXTENSION.download('http://web.archive.org/web/20131109072541/http://www.w3.org/2003/entities/2007xml/unicode.xml', xml)

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

task :parser do
  File.open(File.expand_path('~/Dropbox/parser.pegjs'), 'w'){|f|
    f.write("{\nvar LaTeX = {toUnicode: {}};\n")
    f.write(File.open('chrome/content/zotero-better-bibtex/dict.js').read + "\n")
    IO.readlines('resource/translators/BibTeXParser.pegjs').each_with_index{|line, no|
      next if no == 0
      f.write(line)
    }
  }
end

task :abbrevs do
  dbname = "#{TMP}/abbreviations.sqlite"
  File.unlink(dbname) if File.file?(dbname)
  db = SQLite3::Database.new(dbname)
  db.execute('PRAGMA temp_store=MEMORY;')
  db.execute('PRAGMA journal_mode=MEMORY;')
  db.execute('PRAGMA synchronous = OFF;')

  db.execute('create table journalAbbreviationLists (id primary key, name unique, precedence not null)')
  db.execute('create table journalAbbreviations (list not null, full not null, abbrev not null, primary key(list, full))');

  # more candidates:
  # http://journal-abbreviations.library.ubc.ca/dump.php
  # http://www.ncbi.nlm.nih.gov/books/NBK3827/table/pubmedhelp.pubmedhelptable45/
  # http://www.cas.org/content/references/corejournals
  # http://www.efm.leeds.ac.uk/~mark/ISIabbr/
  # http://www.csa.com/factsheets/supplements/ipa.php

  lists = Nokogiri::HTML(geturl('http://jabref.sourceforge.net/resources.php'))
  main = lists.at_css('div#main')
  main.children.each{|child|
    break if child.name == 'h3' && child['id'] == 'availablelists'
    child.unlink
  }
  main.at_css('ul').css('li').each_with_index{|li, id|
    link = li.at_css('a')
    title = link.inner_text
    href = link['href']

    db.execute('insert into journalAbbreviationLists (id, name, precedence) values (?, ?, ?)', id, title, id)

    href = "http://jabref.sourceforge.net/#{href}" unless href =~ /https?:\/\//
    tgt = "#{TMP}/abbreviations/#{id.to_s.rjust(2,'0')}-#{href.sub(/.*\//, '')}"
    EXTENSION.download(href, tgt)
  }
  Dir["#{TMP}/abbreviations/*"].sort.each{|a|
    puts "importing #{a}"
    id = File.basename(a).sub(/-.*/, '').gsub(/^0+/, '')
    id = '0' if id == ''
    id = Integer(id)

    IO.readlines(a).each{|line|
      begin
        next if line =~ /^#/
        next unless line =~ /=/
        full, abbr = *(line.split('=', 2).collect{|v| v.strip})
        abbr.sub!(/;.*/, '')
        next if full.downcase == abbr.downcase
        db.execute('insert or ignore into journalAbbreviations (list, full, abbrev) values (?, ?, ?)', id, full.downcase, abbr)
      rescue ArgumentError
      end
    }
  }
  puts "#{db.get_first_value('select count(*) from journalAbbreviations')} abbreviations"
  db.close

  File.open('resource/abbreviations.sql', 'w'){|f|
    StringIO.new(`sqlite3 #{dbname} .dump`).readlines.each{|line|
      next unless line =~ /^(CREATE|INSERT)/
      line.sub!(/^CREATE TABLE /, 'CREATE TABLE betterbibtex.')
      line.sub!(/^INSERT INTO "([^"]+)"/, "INSERT INTO betterbibtex.\\1")
      f.write(line)
    }
  }
end

def format(m)
  rjust = 'WARNING'.length
  indent = ' ' * (rjust + ': '.length)

  level = m.level.rjust(rjust, ' ')
  msg = m.message.strip.gsub("\n", "\n" + indent)

  "#{level}: #{msg}"
end
