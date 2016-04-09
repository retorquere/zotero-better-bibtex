#!/usr/bin/env ruby

require 'nokogiri'
require 'ostruct'
require 'open-uri'
require 'yaml'
require 'json'
require 'regexp_parser'

class UnicodeConverter
  @@lowmask = ('1' * 10).to_i(2)
  @@cache = 'resource/translators/unicode.yml'

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

      unicode = {math: '', text: ''}
      done = {}
      @chars.sort.map{|charcode, latex|
        next unless (latex.force || charcode >= 0x20 && charcode <= 0x7E) || charcode == 0x00A0 || latex.latex == ' ' || charcode == ' '.ord # an ascii character that needs translation? Probably a TeX special character
        next if done[charcode]
        done[charcode] = true
        unicode[latex.math ? :math : :text] << "  #{char(charcode)}: #{latex.latex[0].to_json}\n"
      }
      cs.puts "LaTeX.toLaTeX.unicode.math ="
      cs.puts unicode[:math]
      cs.puts "LaTeX.toLaTeX.unicode.text ="
      cs.puts unicode[:text]

      ascii = {math: '', text: ''}
      done = {}
      @chars.sort.map{|charcode, latex|
        next if done[charcode]
        done[charcode] = true
        ascii[latex.math ? :math : :text] << "  #{char(charcode)}: #{latex.latex[0].to_json}\n"
      }
      cs.puts "LaTeX.toLaTeX.ascii.math ="
      cs.puts ascii[:math]
      cs.puts "LaTeX.toLaTeX.ascii.text ="
      cs.puts ascii[:text]

      done = {}
      cs.puts "LaTeX.toUnicode ="
      @chars.sort.map{|charcode, latex|
        latex.latex.each{|ltx|
          next if ltx =~ /^[a-z]+$/i || ltx.strip == ''
          next if charcode < 256 && ltx == charcode.chr
          next if done[ltx]
          done[ltx] = true
          cs.puts "  #{ltx.strip.to_json}: #{char(charcode)}"
        }
      }
    }
  end

  def fixup
    @chars["\\".ord] = OpenStruct.new({latex: "\\backslash", math: true})
    @chars['&'.ord] = OpenStruct.new({latex: "\\&", math: false})
    @chars[0x00A0] = OpenStruct.new({latex: '~', math: false})
    @chars[0x2003] = OpenStruct.new({latex: "\\quad", math: false})
    @chars[0x2004] = OpenStruct.new({latex: "\\;", math: false})
    @chars[0x2009] = OpenStruct.new({latex: "\\,", math: false})
    @chars[0x2009] = OpenStruct.new({latex: "\\,", math: false})
    @chars[0x200B] = OpenStruct.new({latex: "\\hspace{0pt}", math: false})
    @chars[0x205F] = OpenStruct.new({latex: "\\:", math: false})
    @chars[0xFFFD] = OpenStruct.new({latex: "\\dbend", math: false})

    # biber doesn't like it when I escape closing square brackets #245.1, so only opening bracket
    #@chars['['.ord] = OpenStruct.new({latex: '{[}', math: false})

    # TODO: replace '}' and '{' with textbrace(left|right) once the bug mentioned in
    # http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754
    # is widely enough distributed
    ['_', '}', '{'].each{|char|
      @chars[char.ord] = OpenStruct.new({latex: "\\" + char, math: false})
    }

    @chars.keys.each{|charcode|
      { "\\textdollar"        => "\\$",
        "\\textquotedblleft"  => "``",
        "\\textquotedblright" => "''",
        "\\textasciigrave"    => "`",
        "\\textquotesingle"   => "'",
        "\\space"             => ' '
      }.each_pair{|ist, soll|
        @chars[charcode].latex = soll if @chars[charcode].latex == ist
      }

      if @chars[charcode].latex == ' ' # || @chars[charcode].latex == '~'
        @chars[charcode].latex = ' '
        @chars[charcode].math = false
      end
    }
  end

  def expand
    @chars.keys.each{|charcode|
      base = @chars[charcode].latex
      base += '{}' if base =~ /[0-9a-z]$/i
      base.sub!(/ $/, '{}')

      latex = [base]
      latex << base.sub(/{}$/, ' ') if base =~ /{}$/

      case base
        when /^(\\[a-z][^\s]*)\s$/i, /^(\\[^a-z])\s$/i  # '\ss ', '\& ' => '{\\s}', '{\&}'
          latex << "{#{$1}}"
        when /^\\([^a-z]){(.)}$/                       # '\"{a}' => '\"a', '{\"a}'
          latex << "\\#{$1}#{$2} "
          latex << "{\\#{$1}#{$2}}"
        when /^\\([^a-z])(.)\s*$/                       # '\"a " => '\"{a}', '{\"a}'
          latex << "\\#{$1}{#{$2}}"
          latex << "{\\#{$1}#{$2}}"
        when /^{\\([^a-z])(.)}$/                        # '{\"a}'
          latex << "\\#{$1}#{$2} "
          latex << "\\#{$1}{#{$2}}"
        when /^{(\^[0-9])}$/
          latex << $1
        when /^{(\\[.]+)}$/                             # '{....}' '.... '
          latex << "#{$1} "
      end

      latex = latex.collect{|ltx| ltx.strip}.uniq

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

      if charcode == 0x00B0
        @chars[charcode].math = true
        latex.unshift('^\\circ')
        latex.uniq!
      end
      @chars[charcode].latex = latex
    }
  end

  def read(xml)
    puts xml
    mapping = Nokogiri::XML(open(xml))

    chars = []

    to = {}
    from = {}
    mapping.xpath('//character').each{|char|
      latex = char.at('.//latex')
      next unless latex
      next if char['id'] =~ /-/

      chr = [char['dec'].to_s.to_i].pack('U')
      latex = latex.inner_text
      math = (char['mode'] == 'math')

      next if chr =~ /^[\x20-\x7E]$/ && ! %w{# $ % & ~ _ ^ { } [ ] > < \\}.include?(chr)
      next if chr == latex && !math

      latex = "{\\#{$1}#{$2}}" if latex =~ /^\\(["^`\.'~]){([^}]+)}$/
      latex = "{\\#{$1} #{$2}}" if latex =~ /^\\([cuHv]){([^}]+)}$/

      @chars[char['id'].sub(/^u/i, '').to_i(16)] = OpenStruct.new({latex: latex , math: math})
    }
  end

  def download(force=true)
    if !force && File.file?(@@cache)
      @chars = YAML::load_file(@@cache)
    else
      @chars = {}

      read('http://www.w3.org/2003/entities/2007xml/unicode.xml')
      read('http://www.w3.org/Math/characters/unicode.xml')

      self.fixup
      self.expand

      open(@@cache, 'w'){|f| f.write(@chars.to_yaml) }
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

    @chars.each_pair{|charcode, latex|
      latex.latex.each{|ltx|
        ltx.strip!
        ltx = ltx[1..-2] if ltx =~ /^\{.*\}$/
        ltx.sub!(/{}$/, '')
        next if charcode < 256 && ltx == charcode.chr
        next if ltx =~ /^[a-z]+$/i || ltx.strip == ''

        patterns.detect{|(p, s)|
          if p =~ ltx
            s[:count] = s[:count].to_i + 1
            true
          else
            false
          end
        } || raise("No pattern for #{ltx.inspect}")
      }
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
