#!/usr/bin/env ruby

require 'nokogiri'
require 'ostruct'
require 'open-uri'
require 'yaml'
require 'json'

class UnicodeConverter
  def initialize
    @chars = {}
    @lowmask = ('1' * 10).to_i(2)

    read('http://www.w3.org/2003/entities/2007xml/unicode.xml')
    read('http://www.w3.org/Math/characters/unicode.xml')
  end

  def char(charcode)
    return "'\\\\'" if charcode == '\\'.ord

    return "'#{charcode.chr}'" if charcode >= 0x20 && charcode <= 0x7E

    return "'\\u#{charcode.to_s(16).upcase.rjust(4, '0')}'" if charcode < 0x10000

    codepoint = charcode - 0x10000
    codepoint = [(codepoint >> 10) + 0xD800, (@lowmask & codepoint) + 0xDC00].collect{|n| n.to_s(16).upcase.rjust(4, '0')}
    return "'" + codepoint.collect{|cp| "\\u" + cp}.join('') + "'"
  end

  def save(target, source = nil)
    fixup
    expand

    target = File.expand_path(target)
    open((source.nil? ? target : '/dev/null'), 'w'){|cs|
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
          ltx.strip!
          ltx = ltx[1..-2] if ltx =~ /^\{.*\}$/
          ltx.sub!(/\{\}$/, '')
          next if charcode < 256 && ltx == charcode.chr
          next if done[ltx]
          done[ltx] = true
          # check
          #puts ltx if ltx[0] != '\\' || ltx =~ /\{/
          cs.puts "  #{ltx.strip.to_json}: #{char(charcode)}"

          if ltx =~ /[a-z0-9]$/
            unterminated << ltx.to_json
          else
            terminated << ltx.to_json
          end
        }
      }

      terminated = terminated.join("\n  / ")
      unterminated = unterminated.join("\n  / ")

      if source
        puts "Patching #{target}"
        open(target, 'w'){|pegjs|
          pegjs.puts open(source).read + "\n\n"
          pegjs.puts "latex = terminated:latex_terminated / (unterminated:latex_unterminated ![a-z0-9]) { return terminated || unterminated }"
          pegjs.puts ""
          pegjs.puts "latex_terminated\n  = #{terminated}\n\n"
          pegjs.puts ""
          pegjs.puts "latex_unterminated\n  = #{unterminated}\n\n"
        }
      end
    }
  end

  def fixup
    @chars['&'.ord] = OpenStruct.new({latex: "\\&", math: false})
    @chars[0xFFFD] = OpenStruct.new({latex: "\\dbend", math: false})
    @chars[0x00A0] = OpenStruct.new({latex: '~', math: false})
    @chars["\\".ord] = OpenStruct.new({latex: "\\backslash", math: true})
    @chars[0x200B] = OpenStruct.new({latex: "\\mbox{}", math: false})

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
      latex = [@chars[charcode].latex]

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
end

if __FILE__ == $0
  UnicodeConverter.new.save(File.join(File.dirname(__FILE__), '..', 'resource', 'translators', 'latex_unicode_mapping.coffee'))
end
