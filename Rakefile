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
require './lib/translator'

FileUtils.mkdir_p 'tmp'


TRANSLATORS = [
  {name: 'Better BibTeX'},
  {name: 'Better BibLaTeX', unicode: true},
  {name: 'LaTeX Citation'},
  {name: 'Pandoc Citation'},
  {name: 'Zotero TestCase'}
]

UNICODE_MAPPING = "tmp/unicode.json"
SOURCES = [UNICODE_MAPPING]

require 'zotplus-rakehelper'

ZIPFILES = SOURCES.reject{|f| f=~ /^(test|tmp|resource\/(translators|abbreviations))\// || f =~ /\.pegjs$/ } + TRANSLATORS.collect{|translator|
  translator[:source] = "resource/translators/#{translator[:name]}.js"
  {translator[:source] => Translator.new(translator)}
}

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

rule '.js' => '.pegjs' do |t|
  sh "pegjs -e BetterBibTeX#{File.basename(t.source, File.extname(t.source))} #{t.source} #{t.name}"
end
rule '.js' => '.hx' do |t|
  sh "haxe -cp #{File.dirname(t.source)} #{t.source} -js #{t.name}"
  js = open(t.name).read
  js.sub!("\n})(typeof window != \"undefined\" ? window : exports);\n", "\n})(Zotero);\n")
  open(t.name, 'w'){|f| f.write(js)}
end

task :test, [:tag] => [XPI, :debugbridge] do |t, args|
  tag = "@#{args[:tag]}".sub(/^@@/, '@')

  if tag == '@'
    tag = ''
  else
    tag = "--tags #{tag}"
  end

  system "cucumber #{tag}" or throw 'One or more tests failed'
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
