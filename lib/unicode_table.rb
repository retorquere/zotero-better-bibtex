#!/usr/bin/env ruby

require 'nokogiri'
require 'ostruct'
require 'open-uri'
require 'yaml'
require 'json'
require 'regexp_parser'
require 'progressbar'
require 'sqlite3'

class UnicodeConverter
  @@lowmask = ('1' * 10).to_i(2)
  @@cache = 'resource/translators/unicode.mapping'

  def self.cache
    return @@cache
  end

  def char(charcode)
    return "'\\\\'" if charcode == '\\'.ord

    return "'#{charcode.chr}'" if charcode >= 0x20 && charcode <= 0x7E

    return "'\\u#{charcode.to_s(16).upcase.rjust(4, '0')}'" if charcode < 0x10000

    codepoint = charcode - 0x10000
    codepoint = [(codepoint >> 10) + 0xD800, (@@lowmask & codepoint) + 0xDC00].collect{|n| n.to_s(16).upcase.rjust(4, '0')}
    return "'" + codepoint.collect{|cp| "\\u" + cp}.join('') + "'"
  end

  def save(target)
    target = File.expand_path(target)
    open((target), 'w'){|cs|
      cs.puts "LaTeX = {} unless LaTeX"
      cs.puts "LaTeX.toLaTeX = { unicode: {}, ascii: {} }"

      %w{unicode ascii}.each{|encoding|
        mappings = {'text' => {}, 'math' => {}}
        done = {}
        @chars.execute('SELECT charcode, latex, mode FROM mapping ORDER BY preference, mode, LENGTH(latex), latex, charcode'){|mapping|
          charcode, latex, mode = *mapping
          # an ascii character that needs translation? Probably a TeX special character
          if encoding == 'unicode'
            next unless (charcode >= 0x20 && charcode <= 0x7E) || charcode == 0x00A0 || latex == ' ' || charcode == ' '.ord
          end
          next if mappings['text'][charcode] || mappings['math'][charcode]
          mappings[mode][charcode] = "  #{char(charcode)}: #{latex.to_json}\n"
        }
        %w{math text}.each{|mode|
          mappings[mode] = mappings[mode].keys.sort.collect{|charcode| mappings[mode][charcode] }
          cs.puts "LaTeX.toLaTeX.#{encoding}.#{mode} =\n" + mappings[mode].join('')
        }
      }

      done = {}
      cs.puts "LaTeX.toUnicode ="
      @chars.execute('SELECT charcode, latex FROM mapping'){|mapping|
        charcode, latex = *mapping
        next if latex =~ /^[a-z]+$/i || latex.strip == ''
        next if charcode < 256 && latex == charcode.chr
        next if done[latex.strip]
        done[latex.strip] = true
        cs.puts "  #{latex.strip.to_json}: #{char(charcode)}"
      }
    }
  end

  def fixup
    [
      ["\\",    "\\backslash",    'math'],
      ['&',     "\\&",            'text'],
      [0x00A0,  '~',              'text'],
      [0x2003,  "\\quad",         'text'],
      [0x2004,  "\\;",            'text'],
      [0x2009,  "\\,",            'text'],
      [0x2009,  "\\,",            'text'],
      [0x200B,  "\\hspace{0pt}",  'text'],
      [0x205F,  "\\:",            'text'],
      [0xFFFD,  "\\dbend",        'text'],
      # TODO: replace '}' and '{' with textbrace(left|right) once the bug mentioned in
      # http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754
      # is widely enough distributed
      ['_',     "\\_",            'text'],
      ['}',     "\\}",            'text'],
      ['{',     "\\{",            'text'],
    ].each{|patch|
      patch[0] = patch[0].ord if patch[0].is_a?(String)
      @chars.execute("REPLACE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)", patch)
    }

    { "\\textdollar"        => "\\$",
      "\\textquotedblleft"  => "``",
      "\\textquotedblright" => "''",
      "\\textasciigrave"    => "`",
      "\\textquotesingle"   => "'",
      "\\space"             => ' '
    }.each_pair{|ist, soll|
      @chars.execute("""
        REPLACE INTO mapping (charcode, latex, mode)
        SELECT DISTINCT charcode, ?, 'text' FROM mapping WHERE rtrim(latex) IN (?, ?)""", [soll, ist, ist + '{}'])
    }
  end

  def expand
    @chars.execute('SELECT charcode, latex, mode FROM mapping').collect{|mapping| mapping}.each{|mapping|
      charcode, latex, mode = *mapping
      latex += '{}' if latex =~ /[0-9a-z]$/i
      latex.sub!(/ $/, '{}')

      @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, latex, mode])
      @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, latex.sub(/{}$/, ''), mode]) if latex =~ /{}$/

      case latex
        when /^(\\[a-z][^\s]*)\s$/i, /^(\\[^a-z])({}|\s)$/i  # '\ss ', '\& ' => '{\\s}', '{\&}'
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "{#{$1}}", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "#{$1} ", mode])
        when /^\\([^a-z]){(.)}$/                       # '\"{a}' => '\"a', '{\"a}'
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "\\#{$1}#{$2} ", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "{\\#{$1}#{$2}}", mode])
        when /^\\([^a-z])(.)({}|\s)*$/                       # '\"a " => '\"{a}', '{\"a}'
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "\\#{$1}{#{$2}}", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "{\\#{$1}#{$2}}", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "\\#{$1}#{$2}{}", mode])
        when /^{\\([^a-z])(.)}$/                        # '{\"a}'
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "\\#{$1}#{$2} ", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "\\#{$1}{#{$2}}", mode])
        when /^{(\^[0-9])}$/
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, $1, mode])
        when /^{(\\.+)}$/                             # '{....}' '.... '
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "#{$1} ", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "#{$1}{}", mode])
        when /^(\\.*)({}| )$/
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "{#{$1}}", mode])
          @chars.execute('INSERT OR IGNORE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)', [charcode, "#{$1} ", mode])
      end
    }

    # remove dups
    @chars.execute("DELETE FROM mapping WHERE latex <> trim(latex) AND trim(latex) in (SELECT latex FROM mapping)")
    @chars.execute('UPDATE mapping SET latex = trim(latex)')
  end

  def read(xml)
    pbar = nil
    mapping = nil
    open(xml,
      content_length_proc: lambda {|t|
        if t && t > 0
          pbar = ProgressBar.new(xml, t)
          pbar.file_transfer_mode
        end
      },
      progress_proc: lambda {|s|
        pbar.set s if pbar
    }) {|f|
      mapping = Nokogiri::XML(f)
    }

    chars = []

    to = {}
    from = {}
    mapping.xpath('//character').each{|char|
      latex = char.at('.//latex')
      next unless latex
      next if char['id'] =~ /-/

      chr = [char['dec'].to_s.to_i].pack('U')
      latex = latex.inner_text
      mode = (char['mode'] == 'math' ? 'math' : 'text')

      next if chr =~ /^[\x20-\x7E]$/ && ! %w{# $ % & ~ _ ^ { } [ ] > < \\}.include?(chr)
      next if chr == latex && mode == 'text'

      latex = "{\\#{$1}#{$2}}" if latex =~ /^\\(["^`\.'~]){([^}]+)}$/
      latex = "{\\#{$1} #{$2}}" if latex =~ /^\\([cuHv]){([^}]+)}$/

      @chars.execute("REPLACE INTO mapping (charcode, latex, mode) VALUES (?, ?, ?)", [char['id'].sub(/^u/i, '').to_i(16), latex, mode])
    }
  end

  def download(force=true)
    File.unlink(@@cache) if File.file?(@@cache) && force
    @chars = SQLite3::Database.new(@@cache)
    @chars.execute('PRAGMA synchronous = OFF')
    @chars.execute('PRAGMA journal_mode = MEMORY')
    @chars.results_as_hash

    @chars.create_function('pref', 1) do |func, latex|
      latex = latex.to_s
      [
        lambda{ latex !~ /\\/ || latex =~ /^\\[^a-zA-Z0-9]$/ || latex =~ /^\\[1-3]$/ },
        lambda{ latex =~ /^(\\[0-9a-zA-Z]+)+{}$/ },
        lambda{ latex =~ /^{.+}$/ },
        lambda{ latex =~ /}/ },
        lambda{ true }
      ].each_with_index{|test, i|
        next unless test.call
        func.result = i
        break
      }
    end

    if @chars.get_first_value("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='mapping'") != 1
      @chars.execute('CREATE TABLE mapping (charcode, latex, mode CHECK (mode IN ("text", "math")), preference DEFAULT 0, UNIQUE(charcode, latex))')
      @chars.transaction

      read('http://www.w3.org/2003/entities/2007xml/unicode.xml')
      read('http://www.w3.org/Math/characters/unicode.xml')

      self.fixup
      self.expand

      # prefered option is braces-over-traling-space because of miktex bug that doesn't ignore spaces after commands
      # https://github.com/retorquere/zotero-better-bibtex/issues/69
      @chars.execute('UPDATE mapping SET preference = pref(latex)')

      @chars.execute('UPDATE mapping SET preference = 1 WHERE charcode = 0x00B0 AND preference = 0')
      @chars.execute('REPLACE INTO mapping (charcode, latex, mode, preference) VALUES (?, ?, ?, ?)', [0x00B0, '^\\circ', 'math', 0])

      @chars.commit

      puts "#{@@cache} saved"
    end
  end

  def mapping(target)
    download(false)
    save(target)
  end

  def pegjs(source, target)
    download(false)
    save(target, source)
  end

  def patterns(source, target)
    download(false)

    patterns = {
      /^\\fontencoding\{[^\}]+\}\\selectfont\\char[0-9]+$/      => {terminated: false},
      /^\\acute\{\\ddot\{\\[a-z]+\}\}$/                         => {terminated: true},
      /^\\fontencoding\{[^\}]+\}\\selectfont\\char[0-9]+$/      => {terminated: false},
      /^\\cyrchar\{\\'\\[a-zA-Z]+\}$/                           => {terminated: true},
      /^\\u \\i$/                                               => {terminated: false},
      /^\\[~\^'`"]\\[ij]$/                                      => {terminated: false},
      /^\\=\{\\i\}$/                                            => {terminated: true},
      /^\\[Huvc] [a-zA-Z]$/                                     => {terminated: false},
      /^\\mathrm\{[^\}]+\}$/                                    => {terminated: true},
      /^\\[a-zA-Z]+\{\\?[0-9a-zA-Z]+\}(\{\\?[0-9a-zA-Z]+\})?$/  => {terminated: true},
      /^\\[a-z]+\\[a-zA-Z]+$/                                   => {terminated: false},
      /^\\[a-z]+\{[,\.a-z0-9]+\}$/                              => {terminated: true},
      /^\\[0-9a-zA-Z]+$/                                        => {terminated: false},
      /^\^[123] ?$/                                             => {terminated: true},
      /^\^\{[123]\}$/                                           => {terminated: true},
      /^\\[\.~\^'`"]\{[a-zA-Z]\}$/                              => {terminated: true},
      /^\\[=kr]\{[a-zA-Z]\}$/                                   => {terminated: true},
      /^\\[\.=][a-zA-Z]$/                                       => {terminated: false},
      /^\^\\circ$/                                              => {terminated: false},
      /^''+$/                                                   => {terminated: true},
      /^\\[~\^'`"][a-zA-Z] ?$/                                  => {terminated: true},
      /^\\[^a-zA-Z0-9]$/                                        => {terminated: true},
      /^\\ddot\{\\[a-z]+\}$/                                    => {terminated: true},
      /^~$/                                                     => {terminated: true},

      # unterminated
      /^\\sim\\joinrel\\leadsto$/                               => {terminated: false, exclude: true},
      /^\\mathchar\"2208$/                                      => {terminated: false, exclude: true},
      /^\\'\{\}[a-zA-Z]$/                                       => {terminated: false, exclude: true},
      /^_\\ast$/                                                => {terminated: false, exclude: true},
      /^'n$/                                                    => {terminated: false, exclude: true},
      /^\\int(\\!\\int)+$/                                      => {terminated: false, exclude: true},
      /^\\not\\kern-0.3em\\times$/                              => {terminated: false, exclude: true},
      # terminated
      /^\\Pisymbol\{[a-z0-9]+\}\{[0-9]+\}$/                     => {terminated: true, exclude: true},
      /^\{\/\}\\!\\!\{\/\}$/                                    => {terminated: true, exclude: true},
      /^\\stackrel\{\*\}\{=\}$/                                 => {terminated: true, exclude: true},
      /^<\\kern-0.58em\($/                                      => {terminated: true, exclude: true},
      /^\\fbox\{~~\}$/                                          => {terminated: true, exclude: true},
      /^\\not[<>]$/                                             => {terminated: true, exclude: true},
      /^\\ensuremath\{\\[a-zA-Z0-9]+\}$/                        => {terminated: true, exclude: true},
      /^[-`,\.]+$/                                              => {terminated: true, exclude: true},
      /^\\rule\{1em\}\{1pt\}$/                                  => {terminated: true, exclude: true},
      /^\\'\$\\alpha\$$/                                        => {terminated: true, exclude: true},
      /^\\mathrm\{\\ddot\{[A-Z]\}\}$/                           => {terminated: true, exclude: true},
      /^\\'\{\}\{[a-zA-Z]\}$/                                   => {terminated: true, exclude: true},
      /^'$/                                                     => {terminated: true, exclude: true},
      /^\\mathbin\{\{:\}\\!\\!\{-\}\\!\\!\{:\}\}$/              => {terminated: true, exclude: true},
      /^\\not =$/                                               => {terminated: true, exclude: true},
      /^=:$/                                                    => {terminated: true, exclude: true},
      /^:=$/                                                    => {terminated: true, exclude: true},
    }

    @chars.execute('SELECT DISTINCT charcode, latex FROM mapping').each{|mapping|
      charcode, latex = *mapping
      latex.strip!
      latex = latex[1..-2] if latex =~ /^\{.*\}$/
      latex.sub!(/{}$/, '')
      next if charcode < 256 && latex == charcode.chr
      next if latex =~ /^[a-z]+$/i || latex.strip == ''

      patterns.detect{|(p, s)|
        if p =~ latex
          s[:count] = s[:count].to_i + 1
          true
        else
          false
        end
      } || raise("No pattern for #{latex.inspect}")
    }

    open(target, 'w'){|t|
      t.puts(open(source).read)
      t.puts "lookup\n"
      prefix = nil

      patterns.each_with_index {|(re, state), i|
        next if state[:exclude] # || state[:count].to_i == 0
        #next unless p.max > 1
        if prefix.nil?
          prefix = "  ="
        else
          prefix = "  /"
        end
        rule = prefix
        rule += " text:(#{pegjs_re(re)})"
        rule = rule.ljust(70, ' ')

        rule += " terminator" unless state[:terminated]
        rule = rule.ljust(85, ' ')
        rule += " &{ return lookup(text, #{i}); }"
        rule = rule.ljust(110, ' ')
        rule += "{ return lookup(text); }"

        t.puts rule
      }
    }
  end

  def pegjs_re(re)
    pegjs = ''
    Regexp::Scanner.scan re  do |type, token, text, ts, te|
      #puts "type == #{type.inspect} && token == #{token.inspect} #  text: '#{text.inspect}' [#{ts.inspect}..#{te.inspect}]"

      if type == :anchor
        # pass
      elsif type == :escape && token == :interval_open #  text: '"\\{"' [32..34]
        pegjs += "\t\"{\"\t"
      elsif type == :escape && token == :interval_close #  text: '"\\}"' [49..51]
        pegjs += "\t\"}\"\t"
      elsif type == :escape || type == :literal
        pegjs += "\t\"" + text + "\"\t"
      elsif type == :set && token == :open #  text: '"["' [3..4]
        pegjs += '['
      elsif type == :set && token == :range #  text: '"a-z"' [4..7]
        pegjs += text
      elsif type == :set && token == :close #  text: '"]"' [10..11]
        pegjs += ']'
      elsif type == :set && token == :escape && text == "\\}"
        pegjs += '}'
      elsif type == :set && token == :escape
        pegjs += text
      elsif type == :set && token == :member
        pegjs += text
      elsif type == :quantifier
        pegjs += text + ' '
      elsif type == :set && token == :negate
        pegjs += text
      elsif type == :group
        pegjs += text
      else
        raise "re: #{re}, type: #{type.inspect}, token: #{token.inspect}, text: #{text.inspect} [#{ts.inspect}..#{te.inspect}]"
      end
    end

    pegjs.gsub!(/("[^"]+")\t\?/, "\n\\1? ")
    pegjs.gsub!(/"\t\t"/, '')
    pegjs.gsub!(/\t+/, ' ')
    pegjs.gsub!(/\n/, '')
    pegjs.gsub!(/ +/, ' ')
    pegjs.strip!
    return pegjs
  end
end

if __FILE__ == $0
  UnicodeConverter.new.patterns
end
