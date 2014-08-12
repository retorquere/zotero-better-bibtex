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

EXTENSION_ID = Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
EXTENSION = EXTENSION_ID.gsub(/@.*/, '')
RELEASE = Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text

BRANCH=`git rev-parse --abbrev-ref HEAD`.strip
TMP="tmp/#{BRANCH}"

TRANSLATORS = [
  {name: 'Better BibTeX'},
  {name: 'Better BibLaTeX', unicode: true},
  {name: 'LaTeX Citation'},
  {name: 'Pandoc Citation'},
  {name: 'Zotero TestCase'}
]

FileUtils.mkdir_p TMP

UNICODE_MAPPING = "#{TMP}/unicode.json"
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

SOURCES = %w{chrome test/import test/export resource defaults chrome.manifest install.rdf bootstrap.js}
            .collect{|f| File.directory?(f) ?  Dir["#{f}/**/*"] : f}.flatten
            .select{|f| File.file?(f)}
            .collect{|f| f.sub(/\.pegjs$/, '.js')}
            .reject{|f| f =~ /[~]$/ || f =~ /\.swp$/} + [UNICODE_MAPPING]

XPI = "zotero-#{EXTENSION}-#{RELEASE}#{BRANCH == 'master' ? '' : '-' + BRANCH}.xpi"

task :default => XPI do
end

rule '.js' => '.pegjs' do |t|
  sh "pegjs -e #{File.basename(t.name, File.extname(t.name))} #{t.source} #{t.name}"
end

task :clean do
  FileUtils.rm_rf TMP
end

task :debugbridge do
  update = Nokogiri::XML(geturl('https://github.com/ZotPlus/zotero-debug-bridge/raw/master/update.rdf')).at('//em:updateLink').inner_text
  debug_bridge = Dir['tmp/zotero-debug-bridge-*.xpi']
  debug_bridge.each{|f| File.unlink(f)} if debug_bridge.size != 1 || update.sub(/.*\//, '') != File.basename(debug_bridge[0])
  download(update, "tmp/#{update.sub(/.*\//, '')}") unless File.file?("tmp/#{update.sub(/.*\//, '')}")
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

file XPI => SOURCES do |t|
  Dir['*.xpi'].each{|xpi| File.unlink(xpi)}

  begin
    puts "Creating #{t.name}"
    Zip::File.open(t.name, 'w') do |zipfile|
      t.prerequisites.reject{|f| f=~ /^(test|tmp|resource\/(translators|abbreviations))\// }.each{|file|
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
end

file 'update.rdf' => [XPI, 'install.rdf'] do |t|
  update_rdf = Nokogiri::XML(File.open(t.name))
  update_rdf.at('//em:version').content = RELEASE
  update_rdf.at('//RDF:Description')['about'] = "urn:mozilla:extension:#{EXTENSION_ID}"
  update_rdf.xpath('//em:updateLink').each{|link| link.content = "https://raw.github.com/ZotPlus/zotero-#{EXTENSION}/#{BRANCH}/#{XPI}" }
  update_rdf.xpath('//em:updateInfoURL').each{|link| link.content = "https://github.com/ZotPlus/zotero-#{EXTENSION}" }
  File.open('update.rdf','wb') {|f| update_rdf.write_xml_to f}
end

task :publish => ['README.md', XPI, 'update.rdf'] do
  sh "git add #{XPI}"
  sh "git commit -am #{RELEASE}"
  sh "git tag #{RELEASE}"
  sh "git push"
  sh "cd wiki; git commit -am 'release'; git push"
end

file 'README.md' => ['wiki/Home.md', 'install.rdf', 'Rakefile'] do |t|
  puts 'Updating README.md'

  home = nil
  [t.prerequisites[0], 'wiki/Support-Request-Guidelines.md'].each{|patch|
    next unless File.exists?(patch)
    puts "Patching #{patch}"
    readme = File.open(patch).read
    readme.gsub!(/\(http[^)]+\.xpi\)/, "(https://github.com/ZotPlus/zotero-#{EXTENSION}/raw/#{BRANCH}/#{XPI})")
    readme.gsub!(/\*\*[0-9]+\.[0-9]+\.[0-9]+\*\*/, "**#{RELEASE}**")
    readme.gsub!(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/, DateTime.now.strftime('%Y-%m-%d %H:%M'))
    home = readme if patch =~ /Home\.md$/
    File.open(patch, 'w'){|f| f.write(readme) }
  }

  if home
    puts "Patching #{t.name}"
    home.gsub!(/\[\[[^\]]+\]\]/) {|link|
      link.gsub!(/^\[\[|\]\]$/, '')
      text = link.gsub(/\|.*/, '')
      link.gsub!(/.*\|/, '')
      link.gsub!(/\s/, '-')
      link = "https://github.com/ZotPlus/zotero-better-bibtex/wiki/#{link}"
      "[#{text}](#{link})"
    }
    File.open(t.name, 'w'){|f| f.write(home)}
  end
end

task :newtest, :translator, :type do |t, args|
  translator = args[:translator]
  type = args[:type]

  TRANSLATORS.each{|t|
    id = t[:name].gsub(/[^A-Z]/, '').downcase
    translator = t[:name] if translator.downcase == id
  }
  type = 'export' if type == 'e'
  type = 'import' if type == 'i'

  case type
    when 'export', 'import'
      inputext = (type == 'export' ? 'json' : 'bib')
      template = []
      tests = Dir["test/#{type}/*.#{inputext}"].collect{|input|
        if File.basename(input) =~ /^#{translator}\.([0-9]+)\.#{inputext}$/
          Integer($1.gsub(/^0+/, ''))
        else
          nil
        end
      }.compact

      lasttest = Dir["test/#{type}/*.#{inputext}"].collect{|input|
        if File.basename(input) =~ /([0-9]+)\.#{inputext}$/
          Integer($1.gsub(/^0+/, ''))
        else
          nil
        end
      }.compact

      throw "No #{type.inspect} tests for #{translator.inspect}" if tests.empty?
      template = tests.max.to_s.rjust(3, '0')
      newtest = (lasttest.max + 1).to_s.rjust(3, '0')

      Dir["test/#{type}/#{translator}.#{template}.*"].each{|src|
        tgt = src.sub(template, newtest)
        FileUtils.cp(src, tgt)
      }
    else
      raise "Unexpected type #{type.inspect}"
  end
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
  install_rdf.at('//em:updateURL').content = "https://raw.github.com/ZotPlus/zotero-#{EXTENSION}/#{BRANCH}/update.rdf"
  File.open('install.rdf','wb') {|f| install_rdf.write_xml_to f}
  puts `git add install.rdf`
  puts "Release set to #{release}. Please publish."
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
    @_release = RELEASE
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
    download('http://web.archive.org/web/20131109072541/http://www.w3.org/2003/entities/2007xml/unicode.xml', xml)

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

def geturl(url)
  response = Typhoeus.get(url, {followlocation: true})
  raise "Request failed" unless response.success?
  return response.body
end

def download(url, file)
  puts "Downloading #{url} to #{file}"
  target = File.open(file, 'wb')
  request = Typhoeus::Request.new(url, {followlocation: true})
  request.on_headers do |response|
    raise "Request failed: #{response.code.to_s}" unless response.code == 200 # response.success?
  end
  request.on_body do |chunk|
    target.write(chunk)
  end
  request.on_complete do |response|
    target.close
    throw "download failed" unless response.success?
  end
  request.run
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
    download(href, tgt)
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
