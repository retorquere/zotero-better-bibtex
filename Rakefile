require 'aws-sdk'
require 'base64'
require 'csv'
require 'date'
require 'facets'
require 'fileutils'
require 'front_matter_parser'
require 'json'
require 'net/http'
require 'net/http/post/multipart'
require 'nokogiri'
require 'open3'
require 'openssl'
require 'os'
require 'pp'
require 'rake'
require 'rake/clean'
require 'rake/loaders/makefile'
require 'rake/xpi'
require 'rake/xpi/publish/github'
require 'rchardet'
require 'rest-client'
require 'rubygems/package'
require 'selenium-webdriver'
require 'shellwords'
require 'tempfile'
require 'time'
require 'typhoeus'
require 'uri'
require 'washbullet'
require 'yaml'
require 'zip'
require 'zlib'
require_relative 'lib/unicode_table'

#require 'github_changelog_generator'

def cleanly(f)
  begin
    yield
  rescue
    FileUtils.rm_f(f)
    raise
  end
end

def download(url, file)
  puts "Downloading #{url} to #{file}..."
  sh "curl -L #{url.shellescape} -o #{file.shellescape}"
end

#ABBREVS = YAML.load_file('resource/abbreviations/lists.yml')
#ABBREVS.each{|a|
#  if File.basename(a['path']) == 'WOS.json'
#    file a['path'] => 'Rakefile' do |t|
#      tmp = "tmp/WOS.html"
#      abbrevs = {}
#      (('A'..'Z').to_a + ['0-9']).each{|list|
#        ZotPlus::RakeHelper.download(a['url'].sub('<>', list), tmp)
#        doc = Nokogiri::HTML(open(tmp))
#
#        dt = nil
#        doc.xpath("//*[name()='dt' or name()='dd']").each{|node|
#          next unless %w{dt dd}.include?(node.name)
#          node = node.dup
#          node.children.each{|c| c.unlink unless c.name == 'text'}
#          text = node.inner_text.strip
#          if node.name == 'dt'
#            dt = (text == '' ? nil : text.downcase)
#          elsif dt
#            abbrevs[dt] = text
#          end
#        }
#      }
#      abbrevs = { default: { 'container-title' => abbrevs } }
#      open(t.name, 'w'){|f| f.write(JSON.pretty_generate(abbrevs)) }
#    end
#  else
#    file a['path'] => 'Rakefile' do |t|
#      tmp = "tmp/#{File.basename(t.name)}"
#      ZotPlus::RakeHelper.download(a['url'], tmp)
#
#      text = open(tmp).read
#      cd = CharDet.detect(text)
#      if !%w{ascii utf-8}.include?(cd['encoding'].downcase)
#        text = text.encode('utf-8', cd['encoding'])
#        open(tmp, 'w'){|f| f.write(text) }
#      end
#
#      abbrevs = {}
#      IO.readlines(tmp).each{|line|
#        line.strip!
#        next if line[0] == '#'
#        next unless line =~ /=/
#        line = line.split('=', 2).collect{|t| t.strip}
#        next if line.length != 2
#        journal, abbrev = *line
#        journal.downcase!
#        abbrev.sub(/\s*;.*/, '')
#        next if journal == '' || abbrev == ''
#
#        terms = journal.split(/(\[[^\]]+\])/).reject{|t| t.strip == ''}.collect{|t|
#          if t[0] == '[' && t[-1] == ']'
#            OpenStruct.new(term: t[1..-2].downcase)
#          else
#            OpenStruct.new(term: t.downcase, required: true)
#          end
#        }
#
#        (1..2**terms.length).collect{|permutation|
#          (0..terms.length-1).collect{|term|
#            terms[term].required || ((1 << term) & permutation) != 0 ?  terms[term].term : nil
#          }.compact.join(' ').strip
#        }.collect{|name|
#          name.gsub!(/[^a-z]+/, ' ')
#          name.gsub!(/\s+/, ' ')
#          name.strip
#        }.uniq.each{|journal|
#          abbrevs[journal] = abbrev
#        }
#      }
#      abbrevs = { default: { 'container-title' => abbrevs } }
#      open(t.name, 'w'){|f| f.write(JSON.pretty_generate(abbrevs)) }
#    end
#  end
#}

task :gather do
  found = (Dir['chrome/**/*.{coffee,pegjs}'].collect{|src|
    tgt = src.sub(/\.[^\.]+$/, '.js')
    tgt
  }.reject{|f|
    File.dirname(f) == 'chrome/content/zotero-better-bibtex/test'
  } + Dir['chrome/**/*.xul'].reject{|f|
    File.dirname(f) == 'chrome/content/zotero-better-bibtex/test'
  }+ Dir['chrome/{skin,locale}/**/*.*'] + Dir['resource/translators/*.yml'].reject{|yml| File.basename(yml) == 'unicode.yml'}.collect{|tr|
    [
      File.join(File.dirname(tr), File.basename(tr, File.extname(tr)) + '.translator'),
      File.join(File.dirname(tr), File.basename(tr, File.extname(tr)) + '.json')
    ]
  }.flatten + [
    'chrome/content/zotero-better-bibtex/fold-to-ascii.js',
    'chrome/content/zotero-better-bibtex/punycode.js',
    'chrome/content/zotero-better-bibtex/lokijs.js',
    'chrome/content/zotero-better-bibtex/csl-localedata.js',
    'chrome/content/zotero-better-bibtex/translators.js',
    'defaults/preferences/defaults.js',
    'resource/citeproc.js',
    'chrome.manifest',
    'install.rdf',
    'resource/reports/cacheActivity.txt',
  ]).sort.uniq

  expected = XPI.files.sort

  if expected == found
    STDERR.puts "All accounted for"
  else
    STDERR.puts "Intended for publishing, but no source:  #{expected - found}" if (expected - found).length > 0
    STDERR.puts "Not published: #{found - expected}" if (found - expected).length > 0
  end
end

#lambda {
#  js = "Zotero.BetterBibTeX.release = #{XPI.version.to_json};"
#  file = 'chrome/content/zotero-better-bibtex/release.js'
#  if !File.file?(file) || open(file).read.strip != js.strip
#    STDERR.puts "updating #{file} to #{js}" unless ENV['VERBOSE'] == 'false'
#    open(file, 'w') {|f| f.puts(js) }
#  end
#}.call

TIMESTAMP = DateTime.now.strftime('%Y-%m-%d %H:%M:%S')

CLEAN.include('{resource,chrome,defaults}/**/*.js')
CLEAN.include('{resource,chrome,defaults}/**/*.translator')
CLEAN.include('{resource,chrome,defaults}/**/*.js.map')
CLEAN.include('tmp/**/*')
CLEAN.include('resource/translators/*.json')
CLEAN.include('.depend.mf')
CLEAN.include('*.xpi')
CLEAN.include('*.log')
CLEAN.include('*.cache')
CLEAN.include('*.debug')
CLEAN.include('*.dbg')
CLEAN.include('*.tmp')

FileUtils.mkdir_p 'tmp'

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

DOWNLOADS = {
  'chrome/content/zotero-better-bibtex' => {
    #'test/chai.js'      => 'http://chaijs.com/chai.js',
    #'test/yadda.js'     => 'https://raw.githubusercontent.com/acuminous/yadda/master/dist/yadda-0.11.5.js',
    #'lokijs.js'         => 'https://raw.githubusercontent.com/techfort/LokiJS/master/src/lokijs.js',
  },
  'resource/translators' => {
    'unicode.xml'         => 'http://www.w3.org/Math/characters/unicode.xml',
    'org.js'              => 'https://raw.githubusercontent.com/mooz/org-js/master/org.js',
  },
}
DOWNLOADS.each_pair{|dir, files|
  files.each_pair{|file, url|
    file "#{dir}/#{file}" => 'Rakefile' do |t|
      download(url, t.name)
    end
  }
}

file 'chrome/content/zotero-better-bibtex/translators.js' => Dir['resource/translators/*.yml'] + ['Rakefile'] do |t|
  translators = Dir['resource/translators/*.yml'].collect{|header| header = YAML::load_file(header) }.select{|header| header.is_a?(Hash) && header['label'] }
  open(t.name, 'w') {|f|
    f.puts("Zotero.BetterBibTeX.Translators = #{JSON.pretty_generate(translators)};")
  }
end

file 'defaults/preferences/defaults.js' => ['defaults/preferences/defaults.yml', 'Rakefile'] do |t|
  prefs = YAML::load_file(t.source)
  open(t.name, 'w'){|f|
    prefs.each_pair{|k, v|
      k = "extensions.zotero.translators.better-bibtex.#{k}"
      f.puts("pref(#{k.to_json}, #{v.to_json});")
    }
    prefs.each_pair{|k, v|
      k = "extensions.zotero.translators.better-bibtex.#{k}"
      f.puts("pref(#{('services.sync.prefs.sync.' + k).to_json}, true);")
    }
  }
end

file 'resource/translators/preferences.js' => ['defaults/preferences/defaults.yml', 'Rakefile'] do |t|
  open(t.name, 'w'){|f|
    f.puts("Translator.preferences = #{JSON.pretty_generate(YAML::load_file(t.source))}")
  }
end

# someone thinks HTML-loaded javascripts are harmful. If that were true, you have bigger problems than this
# people.
file 'resource/reports/cacheActivity.txt' => 'resource/reports/cacheActivity.html' do |t|
  FileUtils.cp(t.source, t.name)
end

def graspe(t, from, to)
  system "./node_modules/.bin/grasp -i -e '#{from.gsub('"', "\\\"")}' --replace '#{to.gsub('"', "\\\"")}' #{t.name.shellescape}" || exit(1)
end
def grasp(t, from, to)
  system "./node_modules/.bin/grasp -i '#{from.gsub('"', "\\\"")}' --replace '#{to.gsub('"', "\\\"")}' #{t.name.shellescape}" || exit(1)
end
file 'resource/translators/titlecaser.js' => ['resource/translators/titlecaser-citeproc-js.js', 'Rakefile'] do |t|
  cleanly(t.name) do
    js = ''
    download('https://raw.githubusercontent.com/Juris-M/citeproc-js/master/src/load.js', t.name)
    js += open(t.name).read
    download('https://raw.githubusercontent.com/Juris-M/citeproc-js/master/src/formatters.js', t.name)
    js += open(t.name).read

    open(t.name, 'w'){|f|
      # f.puts("if (typeof Translator === 'undefined') { var Translator = {}; }")
      f.puts(js)
    }

    graspe(t, 'var CSL_IS_NODEJS = __;', '')
    graspe(t, 'var CSL_NODEJS = __;', '')
    graspe(t, 'exports.CSL = __;', '')
    graspe(t, 'load(__);', '')
    graspe(t, 'if (__) { }', '')
    graspe(t, 'var CSL = $x', 'Translator.TitleCaser = {{x}}; Translator.TitleCaser.Output = {}')

    %w{lowercase uppercase sentence serializeItemAsRdf serializeItemAsRdfA}.each{|trash|
      graspe(t, "CSL.Output.Formatters.#{trash} = __", '')
    }
    graspe(t, "CSL.Output.Formatters[__] = __", '')

    graspe(t, 'CSL.Output.Formatters', 'Translator.TitleCaser.Output.Formatters')
    graspe(t, 'CSL.TERMINAL_PUNCTUATION_REGEXP', 'Translator.TitleCaser.TERMINAL_PUNCTUATION_REGEXP')
    graspe(t, 'CSL.TERMINAL_PUNCTUATION', 'Translator.TitleCaser.TERMINAL_PUNCTUATION')
    graspe(t, 'CSL.TAG_ESCAPE', 'Translator.TitleCaser.TAG_ESCAPE')

    %w{ AFTER
        ALL_ROMANESQUE_REGEXP
        ALWAYS
        AREAS
        ASCENDING
        ASSUME_ALL_ITEMS_REGISTERED
        AbbreviationSegments
        BEFORE
        CITE_FIELDS
        COLLAPSE_VALUES
        CONDITION_LEVEL_BOTTOM
        CONDITION_LEVEL_TOP
        CREATORS
        DATE_PARTS
        DATE_PARTS_ALL
        DATE_PARTS_INTERNAL
        DATE_VARIABLES
        DECORABLE_NAME_PARTS
        DESCENDING
        DISAMBIGUATE_OPTIONS
        DISPLAY_CLASSES
        END
        ENDSWITH_ROMANESQUE_REGEXP
        ERROR_NO_RENDERED_FORM
        FINISH
        FORMAT_KEY_SEQUENCE
        GENDERS
        GIVENNAME_DISAMBIGUATION_RULES
        INSTITUTION_KEYS
        LANGS
        LANG_BASES
        LITERAL
        LOCATOR_LABELS_MAP
        LOCATOR_LABELS_REGEXP
        LOOSE
        LangPrefsMap
        MARK_TRAILING_NAMES
        MINIMAL_NAME_FIELDS
        MODULE_MACROS
        MODULE_TYPES
        MULTI_FIELDS
        NAME_ATTRIBUTES
        NAME_INITIAL_REGEXP
        NAME_PARTS
        NAME_VARIABLES
        NONE
        NOTE_FIELDS_REGEXP
        NOTE_FIELD_REGEXP
        NUMBER_REGEXP
        NUMERIC
        NUMERIC_VARIABLES
        NestedBraces
        ONLY_FIRST
        ONLY_LAST
        PARALLEL_COLLAPSING_MID_VARSET
        PARALLEL_MATCH_VARS
        PARALLEL_TYPES
        PLAIN_HYPHEN_REGEX
        PLURAL
        POSITION
        POSITION_FIRST
        POSITION_IBID
        POSITION_IBID_WITH_LOCATOR
        POSITION_SUBSEQUENT
        POSITION_TEST_VARS
        PREFIX_PUNCTUATION
        PREVIEW
        ROMANESQUE_NOT_REGEXP
        ROMANESQUE_REGEXP
        ROMAN_NUMERALS
        SEEN
        SINGLETON
        SINGULAR
        START
        STARTSWITH_ROMANESQUE_REGEXP
        STATUTE_SUBDIV_GROUPED_REGEX
        STATUTE_SUBDIV_PLAIN_REGEX
        STATUTE_SUBDIV_STRINGS
        STATUTE_SUBDIV_STRINGS_REVERSE
        STRICT
        SUCCESSOR
        SUCCESSOR_OF_SUCCESSOR
        SUFFIX_CHARS
        SUFFIX_PUNCTUATION
        SUPERSCRIPTS
        SUPERSCRIPTS_REGEXP
        SUPPRESS
        SWAPPING_PUNCTUATION
        TAG_USEALL
        TOLERANT
        UPDATE_GROUP_CONTEXT_CONDITION
        VIETNAMESE_NAMES
        VIETNAMESE_SPECIALS
        checkNestedBrace
        locale
        locale_dates
        locale_opts
        normalizeLocaleStr
        parseLocator
        parseNoteFieldHacks
    }.each{|trash|
      grasp(t, "prop[key=##{trash}]", "_#{trash}: null")
    }
    %w{getSafeEscape CLOSURES demoteNoiseWords}.each{|trash|
      graspe(t, "CSL.#{trash} = __;", '')
    }

    File.rewrite(t.name){|js|
      empty = 0
      StringIO.new(js).readlines.reject{|line|
        line.strip =~ /^[a-zA-Z_]+: null,$/ || line =~ /^\/\/ jslint OK/
      }.reject{|line|
        if line.strip == ''
          empty += 1
        else
          empty = 0
        end
        empty > 1
      }.join('') + "\n" + open(t.source).read
    }
  end
end

file 'resource/citeproc.js' => 'Rakefile' do |t|
  cleanly(t.name) do
    download('https://raw.githubusercontent.com/Juris-M/citeproc-js/master/citeproc.js', t.name)
    sh "#{NODEBIN}/grasp -i -e 'thedate[DATE_PARTS_ALL[i]]' --replace 'thedate[CSL.DATE_PARTS_ALL[i]]' #{t.name.shellescape}"
    sh "#{NODEBIN}/grasp -i -e 'if (!Array.indexOf) { _$ }' --replace '' #{t.name.shellescape}"
    File.rewrite(t.name){|src|
      patched = StringIO.new(src).readlines.collect{|line|
        if line.strip == 'if (!m1split[i-1].match(/[:\\?\\!]\\s*$/)) {'
          line.sub(/if.*{/, 'if (i > 0 && !m1split[i-1].match(/[:\\?\\!]\\s*$/)) {')
        else
          line
        end
      }.join('')
      open('https://raw.githubusercontent.com/zotero/zotero/4.0/chrome/content/zotero/xpcom/citeproc-prereqs.js').read + patched + "\nvar EXPORTED_SYMBOLS = ['CSL'];\n"
    }
    sh "#{NODEBIN}/grasp -i -e 'xmldata.open($a, $b, $c);' --replace 'xmldata.dontopen({{a}}, {{b}}, {{c}});' #{t.name.shellescape}"
    sh "#{NODEBIN}/grasp -i -e 'doc.createElement' --replace 'doc.dontcreateElement' #{t.name.shellescape}"
  end
end

file 'resource/translators/xregexp-all.js' => 'Rakefile' do |t|
  cleanly(t.name) do
    download('http://cdnjs.cloudflare.com/ajax/libs/xregexp/2.0.0/xregexp-all.js', t.name)
    # strip out setNatives because someone doesn't like it
    sh "#{NODEBIN}/grasp -i 'func-dec! #setNatives' --replace 'function setNatives(on) { if (on) { throw new Error(\"setNatives not supported in Firefox extension\"); } }' #{t.name}"
  end
end

file 'resource/translators/json5.js' => 'Rakefile' do |t|
  download('https://raw.githubusercontent.com/aseemk/json5/master/lib/json5.js', t.name)
end

file 'chrome/content/zotero-better-bibtex/test/tests.js' => ['Rakefile'] + Dir['resource/tests/*.feature'] do |t|
  features = t.sources.collect{|f| f.split('/')}.select{|f| f[0] == 'resource'}.collect{|f|
    f[0] = 'resource://zotero-better-bibtex'
    f.join('/')
  }
  open(t.name, 'w'){|f|
    f.write("Zotero.BetterBibTeX.Test.features = #{features.to_json};")
  }
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

    %w{translatorID label priority}.each{|field|
      raise "Missing #{field} in #{t.source}" unless header[field]
    }

    #if !header['translatorType'] || ((header['translatorType'] & 1) == 0 && (header['translatorType'] & 2) == 0) # not import or export
    #  raise "Invalid translator type #{header['translatorType']} in #{t.source}"
    #end

    f.write(JSON.pretty_generate(header))
  }
end

def browserify(code, target)
  puts "\nbrowserify #{target}"
  prefix, code = code.split("\n", 2)
  code, prefix = prefix, code unless code
  prefix = prefix ? prefix + "\n" : ''
  Tempfile.create(['browserify', '.js'], File.dirname(target)) do |caller|
    Tempfile.create(['browserify', '.js'], File.dirname(target)) do |output|
      open(caller.path, 'w'){|f| f.puts code }
      sh "#{NODEBIN}/browserify #{caller.path.shellescape} > #{output.path.shellescape}"
      open(target, 'w') {|f|
        f.write(prefix)
        f.write(open(output.path).read)
      }
    end
  end
end

def utf16literal(str)
  str = str.split(//).collect{|c|
    o = c.ord
    if o >= 0x20 && o <= 0x7E
      c
    elsif o > 0xFFFF
      h = ((o - 0x10000) / 0x400).floor + 0xD800
      l - ((o - 0x10000) % 0x400) + oxDC00
      "\\u#{h.to_s(16).rjust(4, '0')}\\u#{l.to_s(16).rjust(4, '0')}"
    else
      "\\u#{o.to_s(16).rjust(4, '0')}"
    end
  }.join('')
  return "'" + str + "'"
end

# Keep this as coffeescript rather than JS so Travis doesn't have to check out the csl-locales repo (sort of a cache)
file 'chrome/content/zotero-better-bibtex/csl-localedata.coffee' => ['Rakefile'] + Dir['csl-locales/*.xml'] + Dir['csl-locales/*.json'] do |t|
  cleanly(t.name) do
    open(t.name, 'w'){|f|
      f.puts('Zotero.BetterBibTeX.Locales = { months: {}, dateorder: {}}')

      locales = JSON.parse(open('csl-locales/locales.json').read)
      locales['primary-dialects']['en'] = 'en-GB'
      short = locales['primary-dialects'].invert

      locales['language-names'].keys.sort.each{|full|
        names = ["'#{full.downcase}'"]
        names << "'#{short[full].downcase}'" if short[full]
        if full == 'en-US'
          names << "'american'"
        else
          locales['language-names'][full].each{|name|
            names << utf16literal(name.downcase)
            names << utf16literal(name.sub(/\s\(.*/, '').downcase)
          }
        end
        names.uniq!
        names = names.collect{|name| "Zotero.BetterBibTeX.Locales.dateorder[#{name}]" }.join(' = ')

        locale = Nokogiri::XML(open("csl-locales/locales-#{full}.xml"))
        locale.remove_namespaces!
        order = locale.xpath('//date[@form="numeric"]/date-part').collect{|d| d['name'][0]}.join('')
        f.puts("#{names} = #{order.inspect}")

        months = 1.upto(12).collect{|month| locale.at("//term[@name='month-#{month.to_s.rjust(2, '0')}' and not(@form)]").inner_text.downcase }
        seasons = 1.upto(4).collect{|season| locale.at("//term[@name='season-#{season.to_s.rjust(2, '0')}']").inner_text.downcase }

        months = '[' + (months + seasons).collect{|name| utf16literal(name) }.join(', ') + ']'

        f.puts("Zotero.BetterBibTeX.Locales.months[#{full.inspect}] = #{months}")
      }
    }
  end
end

file 'resource/translators/yaml.js' => 'Rakefile' do |t|
  browserify("var YAML;\nYAML = require('js-yaml');", t.name)
end

file 'resource/translators/marked.js' => 'Rakefile' do |t|
  browserify("var LaTeX; if (!LaTeX) { LaTeX = {}; };\nLaTeX.marked=require('marked');", t.name)
end

file 'resource/translators/acorn.js' => 'Rakefile' do |t|
  browserify("acorn = require('../../node_modules/acorn/dist/acorn_csp');", t.name)
end

file 'chrome/content/zotero-better-bibtex/lokijs.js' => 'Rakefile' do |t|
  browserify("Zotero.LokiJS = require('lokijs');", t.name)
end

file 'chrome/content/zotero-better-bibtex/vardump.js' => 'Rakefile' do |t|
  browserify("Zotero.BetterBibTeX.varDump = require('util').inspect;", t.name)
end

file 'chrome/content/zotero-better-bibtex/fold-to-ascii.js' => 'Rakefile' do |t|
  browserify("Zotero.BetterBibTeX.removeDiacritics = require('fold-to-ascii').fold;", t.name)
end

file 'chrome/content/zotero-better-bibtex/punycode.js' => 'Rakefile' do |t|
  browserify("Zotero.BetterBibTeX.punycode = require('punycode');", t.name)
end

Dir['resource/translators/*.yml'].each{|metadata|
  translator = File.basename(metadata, File.extname(metadata))

  sources = ['json5', 'translator', 'preferences', "#{translator}.header"]
  header = YAML::load_file(metadata)
  dependencies = header['BetterBibTeX']['dependencies'] if header['BetterBibTeX']
  dependencies ||= []
  sources += dependencies
  sources += [translator]

  sources = sources.collect{|src| "resource/translators/#{src}.js"}

  file "resource/translators/#{translator}.translator" => sources + ['Rakefile'] do |t|
    header.delete('BetterBibTeX')
    header['lastUpdated'] = TIMESTAMP
    FileUtils.mkdir_p(File.dirname(t.name))
    open(t.name, 'w'){|f|
      f.puts(JSON.pretty_generate(header))
      sources.each{|src|
        f.puts("\n// SOURCE: #{src}")
        f.puts(open(src).read)
      }
    }
  end
}

rule( /\.header\.js$/ => [ proc {|task_name| [task_name.sub(/\.header\.js$/, '.yml'), 'Rakefile', 'install.rdf'] } ]) do |t|
  header = YAML.load_file(t.source)
  open(t.name, 'w'){|f|
    f.write("
      Translator.header = #{header.to_json};
      Translator.release = #{XPI.version.to_json};
      Translator.#{header['label'].gsub(/[^a-z]/i, '')} = true;
    ")
  }
end

task :amo => XPI.xpi do
  amo = XPI.xpi.sub(/\.xpi$/, '-amo.xpi')

  Zip::File.open(amo, 'w') do |tgt|
    Zip::File.open(XPI.xpi) do |src|
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

task :test, [:tag] => [XPI.xpi] + Dir['test/fixtures/*/*.coffee'].collect{|js| js.sub(/\.coffee$/, '.js')} do |t, args|
  #sh "bundle list"
  #sh "npm list"

  if ENV['JURIS_M'] == 'true'
    XPI.test.xpis.download.reject!{|update| update == 'https://www.zotero.org/download/update.rdf'}
    XPI.test.xpis.download << 'https://juris-m.github.io/zotero/update.rdf'
  end
  XPI.getxpis

  features = 'resource/tests'

  tag = ''

  if ENV['CIRCLE_TESTS']
    tag = ENV['CIRCLE_TESTS']

  elsif args[:tag] =~ /^([a-z]):([0-9]+)$/
    features = Dir["resource/tests/#{$1}*.feature"][0] + ":#{$2}"

  else
    tag = "@#{args[:tag]}".sub(/^@@/, '@')

    if tag == '@'
      tag = "--tag ~@noci"
    elsif tag == '@all'
      tag = ''
    else
      tag = "--tag #{tag}"
    end
  end

  output = "--format pretty"
  if ENV['CIRCLE_TEST_REPORTS']
    FileUtils.mkdir_p(File.expand_path(ENV['CIRCLE_TEST_REPORTS'] + '/cucumber'))
    output += " --format json --out " + "#{ENV['CIRCLE_TEST_REPORTS']}/cucumber/tests.cucumber".shellescape
  end
  cucumber = "cucumber #{output} --require features --strict #{tag} #{features}"
  puts "Tests running: JURIS_M=#{ENV['JURIS_M'] || 'false'} #{cucumber}"
  if ENV['CI'] == 'true'
    sh cucumber
  else
    begin
      if OS.mac?
        sh "script -q -t 1 cucumber.run #{cucumber}"
      else
        sh "script -ec '#{cucumber}' cucumber.run"
      end
    ensure
      sh "sed -re 's/\\x1b[^m]*m//g' cucumber.run | col -b > cucumber.log"
      sh "rm -f cucumber.run"
    end
  end
end

task :debug => XPI.xpi do
  xpi = Dir['*.xpi'][0]
  dxpi = xpi.sub(/\.xpi$/, '-' + (0...8).map { (65 + rand(26)).chr }.join + '.xpi')
  FileUtils.mv(xpi, dxpi)
  puts dxpi
end

task :share => XPI.xpi do |t|
  raise "I can only share debug builds" unless ENV['DEBUGBUILD'] == "true"

  url = URI.parse('http://tempsend.com/send')
  File.open(t.source) do |data|
    req = Net::HTTP::Post::Multipart.new(url.path,
      'file' => UploadIO.new(data, 'application/x-xpinstall', File.basename(t.name)),
      'expire' => '604800'
    )
    res = Net::HTTP.start(url.host, url.port) do |http|
      http.request(req)
    end
    puts "http://tempsend.com#{res['location']}"
  end
end

file UnicodeConverter.cache => 'lib/unicode_table.rb' do |t|
  puts "#{t.name} outdated"
  UnicodeConverter.new.download
end

file 'resource/translators/latex_unicode_mapping.coffee' => UnicodeConverter.cache do |t|
  puts "#{t.name} outdated"
  cleanly(t.name) do
    UnicodeConverter.new.mapping(t.name)
  end
end
file 'resource/translators/BetterBibTeXParser.pegjs' => [ 'resource/translators/BetterBibTeXParser.grammar', UnicodeConverter.cache ] do |t|
  puts "#{t.name} outdated"
  cleanly(t.name) do
    UnicodeConverter.new.patterns(t.source, t.name)
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

task :logs, [:id] do |t, args|
  if args[:id].to_s !~ /^[A-Z0-9]+-[A-Z0-9]+$/
    sh "aws s3 ls s3://zotplus-964ec2b7-379e-49a4-9c8a-edcb20db343f"
  else
    sh "aws s3 cp s3://zotplus-964ec2b7-379e-49a4-9c8a-edcb20db343f/#{args[:id]}-errorlog.txt tmp/#{args[:id]}-errorlog.txt"
    open("tmp/#{args[:id]}-errorlog-trimmed.txt", 'w'){|trimmed|
      skipnext = false
      IO.readlines("tmp/#{args[:id]}-errorlog.txt").each{|line|
        if line =~ /^\(5\)/
          skipnext = true
        else
          trimmed.write(line) unless skipnext && line.strip == ''
          skipnext = false
        end
      }
    }
    begin
      sh "aws s3 cp s3://zotplus-964ec2b7-379e-49a4-9c8a-edcb20db343f/#{args[:id]}-references.json tmp/#{args[:id]}-references.json"
    rescue
    end
  end
end

task :csltests do
  source = 'test/fixtures/export/(non-)dropping particle handling #313.json'
  testcase = JSON.parse(open(source).read)
  testcase['items'] = testcase['items'].reject{|item| (item['tags'] || []).include?('imported') }

  root = 'https://bitbucket.org/bdarcus/citeproc-test/src/tip/processor-tests/humans/'
  seen = testcase['items'].first['creators'].dup
  Tempfile.create('tests') do |tmp|
    download(root, tmp.path)
    tests = Nokogiri::HTML(open(tmp.path))
    n = tests.css('td.filename a').length
    tests.css('td.filename a').each_with_index{|test, i|
      link = URI.join(root, test['href']).to_s.sub(/\?.*/, '').sub('/src/', '/raw/')

      if open(link).read =~ />>=+ INPUT =+>>(.*)<<=+ INPUT =+<</im
        test = JSON.parse($1)
        creators = []
        test.each{|ref|
          %w{author editor container-author composer director interviewer recipient reviewed-author collection-editor %translator}.each{|creator|
            creators << ref[creator] || []
          }
        }
        creators.flatten!
        creators.compact!
        creators = creators.select{|creator|
          (creator.keys & %w{literal dropping-particle non-dropping-particle suffix}).length != 0 || creator['family'] =~ /[^\p{Alnum}]/i
        }.collect{|creator|
          if creator['literal']
            cr = {
              lastName: creator['literal'],
              fieldMode: 1
            }
          else
            cr = {
              creatorType: 'author',
              lastName: [creator['dropping-particle'], creator['non-dropping-particle'], creator['family']].compact.join(' ').strip,
              firstName: [creator['given'], creator['suffix']].compact.join(', '),
            }
            cr.delete(:firstName) if cr[:firstName] == ''
            throw link if cr[:firstName] && creator['isInstitution'] == 'true'
            cr[:fieldMode] = 1 if creator['isInstitution'] == 'true'
          end

          cr[:firstName] =  "François Hédelin, abbé d'" if cr[:firstName] =~ /^François Hédelin/

          cr
        }
        creators = creators.uniq - seen

        seen << creators
        seen.flatten!
        seen.uniq!
      else
        creators = []
      end

      if creators.length > 0
        citekey = link.sub(/.*\//, '').sub(/\..*/, '')
        testcase['items'] << {
          itemType: 'journalArticle',
          title: citekey,
          creators: creators,
          extra: "bibtex: #{citekey}",
          tags: ['imported']
        }
      end
      puts "#{i+1}/#{n}: #{creators.length} creators, #{testcase['items'].length} references"
    }
    open(source, 'w'){|f| f.write(JSON.pretty_generate(testcase)) }
  end
end

#file 'www/better-bibtex/scripting.md' => ['resource/translators/reference.coffee'] do |t|
file 'wiki/Scripting.md' => ['resource/translators/reference.coffee'] do |t|
  sh "markdox --output #{t.name.shellescape} #{t.sources.collect{|s| s.shellescape}.join(' ')}"
  #index = open(t.name).read
  #index = "---\ntitle: Scripting\n---\n" + index
  #open(t.name, 'w'){|f| f.write(index) }
end

task :install => XPI.xpi do
  if OS.mac?
    sh "open #{XPI.xpi}"
  else
    sh "xdg-open #{XPI.xpi}"
  end
end

task :logs2s3 do
  logs = Dir['*.debug'] + Dir['*.log']
  logs = [] if ENV['CI'] == 'true' && ENV['LOGS2S3'] != 'true'
  logs = [] if (ENV['TRAVIS_PULL_REQUEST'] || 'false') != 'false'

  logs = logs.reject{|log| File.zero?(log) }

  if logs.size == 0
    puts "Logs 2 S3: Nothing to do"
  else
    prefix = [ENV['TRAVIS_BRANCH'], ENV['TRAVIS_JOB_NUMBER']].select{|x| x}.join('-')
    prefix += '-' if prefix != ''

    form = JSON.parse(open('https://zotplus.github.io/s3.json').read)
    url = URI.parse(form['action'])
    path = url.path
    path = '/' if path == ''
    params = form['fields']

    logs += Dir['resource/translators/install/*.js']

    logs.each{|log|
      puts "Logs 2 S3: #{log}"
      params[form['filefield']] = UploadIO.new(File.expand_path(log), 'text/plain', "#{prefix}#{log}")
      req = Net::HTTP::Post::Multipart.new(path, params)
      http = Net::HTTP.new(url.host, url.port)
      http.use_ssl = true if url.scheme == 'https'
      res = http.start do |http|
        http.request(req)
      end
    }
  end
end

task :doc do
  preferences = {}
  defaults = {}

  YAML::load_file('defaults/preferences/defaults.yml').each_pair{|pref, default|
    preferences["extensions.zotero.translators.better-bibtex.#{pref}"] = 'Hidden'
    defaults["extensions.zotero.translators.better-bibtex.#{pref}"] = default
  }

  settings = Nokogiri::XML(open('chrome/content/zotero-better-bibtex/preferences.xul'))
  settings.remove_namespaces!

  panels = [
    'Citation keys',
    'Export',
    'Journal abbreviations',
    'Automatic export',
    'Advanced'
  ]
  settings.xpath('//tabpanel').each_with_index{|panel, panelnr|
    panel.xpath('.//*[@preference]').each{|pref|
      name = settings.at("//preference[@id='#{pref['preference']}']")['name']
      preferences[name] = panels[panelnr]
    }
  }

  documented = {}

  section = nil
  IO.readlines('wiki/Configuration.md').each{|line|
    line.strip!
    if line =~ /^## /
      section = line.sub(/^##/, '').strip
      next
    end

    if line =~ /^<!-- (.*) -->/
      pref = $1.strip
      documented[pref] = section
    end
  }

  documented.keys.each{|pref|
    if !preferences[pref]
      puts "Documented obsolete preference #{documented[pref]} / #{pref}"
    elsif preferences[pref] != documented[pref]
      puts "#{pref} documented in #{documented[pref]} but visible in #{preferences[pref]}"
    end
  }
  preferences.keys.each{|pref|
    if !documented[pref]
      heading = "## #{pref.sub(/.*\./, '')} <!-- #{pref} -->"
      puts "Undocumented preference #{preferences[pref]} / #{heading} (#{defaults[pref]})"
    end
  }
end

task :s3form do
  user = OpenStruct.new({
    key: XPI.errorreports.key,
    secret: XPI.errorreports.secret,
    username: XPI.errorreports.username
  })
  user.each_pair{|k, v|
    raise "S3: #{k} not configured" unless v.to_s.strip != '' && ENV[v].to_s.strip != ''
    user[k] = ENV[v]
  }

  s3 = Aws::S3::Resource.new(region: XPI.errorreports.region, credentials: Aws::Credentials.new(user.key, user.secret))
  bucket = s3.bucket(XPI.errorreports.bucket)
  obj = bucket.object('KeyName')
  expires = Time.now + (6*24*60*60) # 6 days from now
  post = bucket.presigned_post({
    signature_expiration: expires,
    acl: 'private',
    key: '${filename}',
    success_action_status: '204'
  })

  form = {
    action: post.url.to_s,
    filefield: 'file',
    fields: post.fields
  }
  Tempfile.create('error-report.json') do |tmp|
    tmp.puts(JSON.pretty_generate(form))
    tmp.close
    XPI.add_asset(:'update.rdf', false, 'error-report.json', tmp.path, 'application/json')
  end

  builder = Nokogiri::HTML::Builder.new do |doc|
    doc.html {
      doc.head {
        doc.meta_(charset: 'utf-8')
        doc.title { doc.text 'Upload' }
      }
      doc.body {
        doc.h2 { doc.text "valid until #{expires}" }
        doc.form(action: form[:action], method: 'POST', enctype: "multipart/form-data") {
          form[:fields].each_pair{|name, value|
            doc.input(type: 'hidden', name: name, value: value)
          }
          doc.input(type: 'file', name: 'file')
          doc.input(type: 'submit', value: 'Save')
        }
      }
    }
  end
  Tempfile.create('error-report.html') do |tmp|
    tmp.puts(builder.to_html)
    tmp.close
    XPI.add_asset(:'update.rdf', false, 'error-report.html', tmp.path, 'text/html')
  end
end

task :site do
  sh "git clone git@github.com:retorquere/zotero-better-bibtex.wiki.git wiki" unless File.directory?('wiki')
  sh "cd wiki && git pull"

  relink = lambda{|line|
    line.gsub(/\[(.*?)\]\(https:\/\/github.com\/retorquere\/zotero-better-bibtex\/wiki\/(.*?)\)/){|match|
      label = $1
      link = $2
      if link.gsub('-', ' ') == label
        "[[#{label}]]"
      else
        "[[#{label}|#{link}]]"
      end
    }
  }
  open('wiki/Support.md', 'w'){|support|
    written = false
    support.puts("<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/CONTRIBUTING.md. EDITS WILL BE OVERWRITTEN -->\n\n")
    IO.readlines('CONTRIBUTING.md').each{|line|
      if (line =~ /^#/ || line.strip == '' || line =~ /^<!--/) && !written
        next
      else
        written = true
        support.write(relink.call(line))
      end
    }
  }
  open('wiki/Home.md', 'w') {|home|
    home.puts("<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->\n\n")
    IO.readlines('README.md').each{|line|
      next if line =~ /^<!--/
      home.write(relink.call(line))
    }
  }

  sh "cd wiki && git add Home.md Support.md"
  sh "cd wiki && git commit -m 'Home + Support' || true"
  sh "cd wiki && git push"
end
