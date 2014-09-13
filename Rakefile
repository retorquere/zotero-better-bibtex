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
require './lib/translator'

FileUtils.mkdir_p 'tmp'

UNICODE_MAPPING = "tmp/unicode.json"
UNICODE_MAPPING_JS = "resource/translators/unicode_mapping.js"
MD5 = {file: 'tmp/md5-0.0.0.js', url: 'http://crypto-js.googlecode.com/svn/tags/0.0.0/build/rollups/md5.js', version: '3.1.2'}
SWEET = "sjs --readable-names"
MACROS = 'sweet/macros.js'

class String
  def shellescape
    Shellwords.escape(self)
  end
end

SOURCES = [MD5[:file].sub('0.0.0', MD5[:version])] + Dir['resource/translators/*.tjs'] + Dir['./**/*.sjs'] + Dir['./**/*.pegjs']

require 'zotplus-rakehelper'

ZIPFILES = SOURCES.reject{|f| f=~ /^(test|tmp|resource\/(translators|abbreviations))\// || f =~ /\.(peg|s)js$/ }.collect{|f| f.sub(/\.tjs$/, '.js')}

rule '.js' => '.pegjs' do |t|
  sh "pegjs -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{t.source} #{t.name}"
end

rule '.js' => ['.sjs', MACROS] do |t|
  sh "#{SWEET} --module ./#{MACROS} --output #{t.name.shellescape} #{t.source.shellescape}"
end

def expand(f)
  src = f.read
  %w{" '}.each{|q|
    src.gsub!(/\/\/\s*@include\s*#{q}([^#{q}]+)#{q}/){
      puts "Including #{$1.inspect}"
      expand(open(File.join(File.dirname(f.path), $1)))
    }
  }
  return src
end

rule '.js' => ['.tjs', MACROS, UNICODE_MAPPING_JS, 'resource/translators/import.js', 'resource/translators/Parser.js', 'resource/translators/translator.js'] do |t|
  js = File.open(t.source, 'r').read

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

  js = js[start + length, js.length]

  timestamp = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')
  header['lastUpdated'] = timestamp
  constants = "./tmp/sweet/#{File.basename(t.name, File.extname(t.name))}/header.sjs"
  FileUtils.mkdir_p(File.dirname(constants))
  open(constants, 'w') {|f|
    f.write("
      macro TranslatorInfo {
        rule { $[.id] }         => { #{header['translatorID'].to_json} }
        rule { $[.label] }      => { #{header['label'].to_json} }
        rule { $[.timestamp] }  => { #{timestamp.to_json} }
        rule { $[.release] }    => { #{RELEASE.to_json} }
        rule { $[.unicode] }    => { #{(!(((header['displayOptions'] || {})['exportCharset'] || 'ascii').downcase =~ /ascii/)).to_json} }
      }
      export TranslatorInfo
    ")
  }

  expanded = "./tmp/sweet/#{File.basename(t.name, File.extname(t.name))}/expanded.sjs"
  #Tempfile.open('bundle') do |bundle|
  open(expanded, 'w') do |bundle|
    bundle.write(expand(OpenStruct.new(path: t.source, read: js.dup)))
    bundle.close
    sh "#{SWEET} --module ./#{MACROS} --module #{constants.shellescape} --output #{t.name.shellescape} #{expanded.shellescape}"
    src = JSON.pretty_generate(header) + "\n\n" + open(t.name).read
    open(t.name, 'w'){|f| f.write(src) }
  end

  FileUtils.cp(t.name, File.join('tmp', File.basename(t.name)))
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

  system "cucumber #{tag} | tee cucumber.log" or throw 'One or more tests failed'
end

task :dropbox => XPI do
  dropbox = File.expand_path('~/Dropbox')
  Dir["#{dropbox}/*.xpi"].each{|xpi| File.unlink(xpi)}
  FileUtils.cp(XPI, File.join(dropbox, XPI))
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

file MD5[:file].sub('0.0.0', MD5[:version]) do
  Dir[MD5[:file].sub('0.0.0', '*')].each{|f| File.unlink?(f) }
  ZotPlus::RakeHelper.download(MD5[:url].sub('0.0.0', MD5[:version]), MD5[:file].sub('0.0.0', MD5[:version]))
end

file UNICODE_MAPPING_JS => UNICODE_MAPPING do |t|
  mapping = JSON.parse(open(t.source).read)

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

file UNICODE_MAPPING => 'Rakefile' do |t|
  begin
    xml = File.join(File.dirname(t.name), File.basename(t.name, File.extname(t.name)) + '.xml')
    ZotPlus::RakeHelper.download('http://web.archive.org/web/20131109072541/http://www.w3.org/2003/entities/2007xml/unicode.xml', xml)

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

### UTILS

task :macros do
  output = 'tmp/sweet-macros-test.js'
  sh "#{SWEET} --module ./#{MACROS} --output #{output} #{File.join(File.dirname(MACROS), File.basename(MACROS, File.extname(MACROS)) + '-test.js')}"
  sh "jshint #{output}"
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

task :abbrevs do
  dbname = "tmp/abbreviations.sqlite"
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

  lists = Nokogiri::HTML(ZotPlus::RakeHelper.geturl('http://jabref.sourceforge.net/resources.php'))
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
    tgt = "tmp/abbreviations/#{id.to_s.rjust(2,'0')}-#{href.sub(/.*\//, '')}"
    ZotPlus::RakeHelper.download(href, tgt)
  }
  Dir["#tmp/abbreviations/*"].sort.each{|a|
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
