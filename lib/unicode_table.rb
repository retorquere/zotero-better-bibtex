#!/usr/bin/env ruby

require 'nokogiri'
require 'ostruct'
require 'open-uri'
require 'yaml'

class UnicodeConverter
  def initialize
    @chars = {}
    @lowmask = ('1' * 10).to_i(2)

    read('http://www.w3.org/2003/entities/2007xml/unicode.xml')
    read('http://www.w3.org/Math/characters/unicode.xml')
  end

  def save(cs)
    fixup
    expand

    cs = File.expand_path(cs)
    open(cs, 'w'){|f|
      f.puts "LaTeX = {} unless LaTeX"
      f.puts "LaTeX.toLaTeX = { unicode: Object.create(null), ascii: Object.create(null) }"

      unicode = {math: '', text: ''}
      done = {}
      @chars.each_pair{|char, latex|
        next unless char =~ /^[\x20-\x7E]$/ # an ascii character that needs translation? Probably a TeX special character
        char = "\\\\" if char == '\\'
        next if done[char]
        done[char] = true
        unicode[latex.math ? :math : :text] << "  '#{char}': #{latex.latex[0].inspect}\n"
      }
      f.puts "LaTeX.toLaTeX.unicode.math ="
      f.puts unicode[:math]
      f.puts "LaTeX.toLaTeX.unicode.text ="
      f.puts unicode[:text]

      ascii = {math: '', text: ''}
      done = {}
      @chars.each_pair{|char, latex|
        if char == '\\'
          char = "'\\\\'"
        elsif char =~ /^[\x20-\x7E]$/
          char = "'#{char}'"
        else
          char = latex.char
        end
        next if done[char]
        done[char] = true
        ascii[latex.math ? :math : :text] << "  #{char}: #{latex.latex[0].inspect}\n"
      }
      f.puts "LaTeX.toLaTeX.ascii.math ="
      f.puts ascii[:math]
      f.puts "LaTeX.toLaTeX.ascii.text ="
      f.puts ascii[:text]

      done = {}
      f.puts "LaTeX.toUnicode ="
      @chars.each_pair{|char, latex|
        if char == '\\'
          char = "'\\\\'"
        elsif char =~ /^[\x20-\x7E]$/
          char = "'#{char}'"
        else
          char = latex.char
        end
        latex.latex.each{|ltx|
          next if ltx =~ /^[a-z]+$/i || ltx.strip == ''
          next if ltx == char.sub(/^'/, '').sub(/'$/, '')
          next if done[ltx]
          done[ltx] = true
          f.puts "  #{ltx.inspect}: #{char}"
        }
      }
    }
  end

  def fixup
    @chars['&'.inspect] = OpenStruct.new({latex: "\\&", char: "'&'", math: false})
    @chars['\uFFFD'] = OpenStruct.new({latex: "\\dbend", char: "'\\uFFFD'", math: false})
    @chars["\\"] = OpenStruct.new({latex: "\\backslash", char: "'\\\\'", math: true})

    # biber doesn't like it when I escape closing square brackets #245.1, so only opening bracket
    @chars['['] = OpenStruct.new({latex: '{[}', char: "'['", math: false})

    # TODO: replace '}' and '{' with textbrace(left|right) once the bug mentioned in
    # http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754
    # is widely enough distributed
    ['_', '}', '{'].each{|char|
      @chars[char] = OpenStruct.new({latex: "\\" + char, char: "'#{char}'", math: false})
    }
    @chars['\u00A0'] = OpenStruct.new({latex: ' ', char: "'\\u00A0'", math: false})

    @chars.keys.each{|char|
      { "\\textdollar"        => "\\$",
        "\\textquotedblleft"  => "``",
        "\\textquotedblright" => "''",
        "\\textasciigrave"    => "`",
        "\\textquotesingle"   => "'",
        "\\space"             => ' '
      }.each_pair{|ist, soll|
        @chars[char].latex = soll if @chars[char].latex == ist
      }

      @chars[char].latex = ' ' if @chars[char].latex == '~'
    }
  end

  def expand
    @chars.keys.each{|char|
      latex = [@chars[char].latex]

      case latex[0]
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
      @chars[char].latex = latex
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

      id = char['id']
      if id =~ /^u0/i
        id = [id.upcase.sub(/^u0/i, '')]
      else
        cp = id.sub(/^u/i, '').to_i(16) - 0x10000
        id = [(cp >> 10) + 0xD800, (@lowmask & cp) + 0xDC00].collect{|n| n.to_s(16)}
      end
      id = "'" + id.collect{|cp| "\\u" + cp}.join('') + "'"

      @chars[chr] = OpenStruct.new({latex: latex , char: id, math: math})
    }
  end

#  u2l = {
#    unicode: OpenStruct.new({ math: [], map: {} }),
#    ascii: OpenStruct.new({ math: [], map: {} })
#  }
#
#  l2u = { }
#
#  mapping.each_pair{|key, repl|
#    # need to figure something out for this. This has the form X<combining char>, which needs to be transformed to
#    # \combinecommand{X}
#    #raise value if value =~ /LECO/
#
#    if key =~ /^[\x20-\x7E]$/ # an ascii character that needs translation? Probably a TeX special character
#      u2l[:unicode].map[key] = latex[0]
#      u2l[:unicode].math << key if repl.math
#    end
#
#    u2l[:ascii].map[key] = latex[0]
#    u2l[:ascii].math << key if repl.math
#
#    latex.each{|ltx|
#      l2u[ltx] = key if ltx =~ /\\/
#    }
#  }
#
#  l2u["\\url"] = '';
#  l2u["\\href"] = '';
end

if __FILE__ == $0
  UnicodeConverter.new.save(File.join(File.dirname(__FILE__), '..', 'resource', 'translators', 'latex_unicode_mapping.coffee'))
end
