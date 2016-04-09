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
      unterminated = []
      terminated = []
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

  def patterns
    download(false)
    patterns = {}

    unterminated = [
      /^\\fontencoding\{[^\}]+\}\\selectfont\\char[0-9]+$/,
      /^\\[a-z]+\\[a-zA-Z]+$/,
      /^\\fontencoding\{[^\}]+\}\\selectfont\\char[0-9]+$/,
      /^\\[a-z]+\\[a-zA-Z]+$/,
      /^\\[0-9a-zA-Z]+$/,
      /^\\u \\i$/,
      /^\\[~\^'`"]\\[ij]$/,
      /^\\[Huvc] [a-zA-Z]$/,
      /^\\[\.=][a-zA-Z]$/,
      /^\\[~\^'`"][a-zA-Z]$/,
      /^\^[123]$/,
      /^\^\\circ$/,

      nil,

      /^\\sim\\joinrel\\leadsto$/,
      /^\\mathchar\"2208$/,
      /^\\'\{\}[a-zA-Z]$/,
      /^_\\ast$/,
      /^'n$/,
      /^\\int(\\!\\int)+$/,
      /^\\not\\kern-0.3em\\times$/
    ]
    terminated = [
      /^\\[\.~\^'`"]\{[a-zA-Z]\}$/,
      /^\\acute\{\\ddot\{\\[a-z]+\}\}$/,
      /^\\[a-zA-Z]+\{\\?[0-9a-zA-Z]+\}(\{\\?[0-9a-zA-Z]+\})?$/,
      /^\\cyrchar\{\\'\\[a-zA-Z]+\}$/,
      /^\\[a-z]+\{[,\.a-z0-9]+\}$/,
      /^\\mathrm\{[^\}]+\}$/,
      /^\\=\{\\i\}$/,
      /^\\[=kr]\{[a-zA-Z]\}$/,
      /^''+$/,
      /^\\[^a-zA-Z0-9]$/,
      /^~$/,
      /^\\ddot\{\\[a-z]+\}$/,

      nil,

      /^\\Pisymbol\{[a-z0-9]+\}\{[0-9]+\}$/,
      /^\{\/\}\\!\\!\{\/\}$/,
      /^\\stackrel\{\*\}\{=\}$/,
      /^<\\kern-0.58em\($/,
      /^\\fbox\{~~\}$/,
      /^\\not[<>]$/,
      /^\\ensuremath\{\\[a-zA-Z0-9]+\}$/,
      /^[-`,\.]+$/,
      /^\\rule\{1em\}\{1pt\}$/,
      /^\\'\$\\alpha\$$/,
      /^\\mathrm\{\\ddot\{[A-Z]\}\}$/,
      /^\\'\{\}\{[a-zA-Z]\}$/,
      /^'$/,
      /^\\mathbin\{\{:\}\\!\\!\{-\}\\!\\!\{:\}\}$/,
      /^\\not =$/,
      /^=:$/,
      /^:=$/,
    ]

    unterminated = unterminated.collect{|p| p ? OpenStruct.new({re: p, terminated: false, max: 0}) : nil }
    terminated = terminated.collect{|p| p ? OpenStruct.new({re: p, terminated: true, max: 0}) : nil }

    @chars.each_pair{|charcode, latex|
      latex.latex.each{|ltx|
        ltx.strip!
        ltx = ltx[1..-2] if ltx =~ /^\{.*\}$/
        ltx.sub!(/{}$/, '')
        next if charcode < 256 && ltx == charcode.chr
        next if ltx =~ /^[a-z]+$/i || ltx.strip == ''

        if ltx =~ /[a-z0-9]$/i # unterminated
          pattern = unterminated.detect{|p| p && ltx =~ p.re }
          raise "No pattern for #{ltx.inspect}" unless pattern
          pattern.max = [pattern.max, ltx.length].max

        else # terminated
          pattern = terminated.detect{|p| p && ltx =~ p.re }
          raise "No pattern for #{ltx.inspect}" unless pattern
          pattern.max = [pattern.max, ltx.length].max
        end
      }
    }

    patterns = unterminated[0,unterminated.index(nil)] + terminated[0,terminated.index(nil)]
    patterns.sort_by{|p| p.max}.reverse.each_with_index{|p, i|
      #next unless p.max > 1
      rule = "  / text:(#{pegjs_re(p.re)})"
      rule = rule.ljust(70, ' ')

      rule += " terminator" unless p.terminated
      rule = rule.ljust(85, ' ')
      rule += " &{ return lookup(text, '#{i}'); }"
      rule = rule.ljust(110, ' ')
      rule += "{ return lookup(text); }"

      puts rule
    }
  end

  def pegjs_re(re)
    pegjs = ''
    Regexp::Scanner.scan re  do |type, token, text, ts, te|
      #puts "type == #{type.inspect} && token == #{token.inspect} #  text: '#{text.inspect}' [#{ts.inspect}..#{te.inspect}]"

      if type == :anchor
        # pass
      elsif type == :escape && token == :interval_open #  text: '"\\{"' [32..34]
        text = "\t\"{\"\t"
      elsif type == :escape && token == :interval_close #  text: '"\\}"' [49..51]
        text = "\t\"}\"\t"
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
        pegjs += '}'
      elsif type == :set && token == :member
        pegjs += text
      elsif type == :quantifier
        pegjs += text + ' '
      elsif type == :set && token == :negate
        pegjs += text
      elsif type == :group
        pegjs += text
      else
        raise "type: #{type.inspect}, token: #{token.inspect}, text: #{text.inspect} [#{ts.inspect}..#{te.inspect}]"
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
