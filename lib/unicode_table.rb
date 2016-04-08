#!/usr/bin/env ruby

require 'nokogiri'
require 'ostruct'
require 'open-uri'
require 'yaml'
require 'json'

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

  def save(target, source = nil)
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

          if ltx =~ /[a-z0-9]$/i
            unterminated << ltx
          else
            terminated << ltx
          end
        }
      }

      if source
        puts "Unterminated: #{unterminated.collect{|ltx| ltx.length}.uniq.sort}"
        puts "Terminated: #{terminated.collect{|ltx| ltx.length}.uniq.sort}"
        terminated = terminated.collect{|ltx| ltx.to_json}.join("\n  / ")
        unterminated = unterminated.collect{|ltx| ltx.to_json}.join("\n  / ")

        puts "Patching #{target} from #{source} (#{IO.readlines(source).length} lines)"
        open(target, 'w'){|pegjs|
          pegjs.puts open(source).read + "\n\n"
          pegjs.puts "latex_terminated\n  = #{terminated}\n\n"
          pegjs.puts ""
          pegjs.puts "latex_unterminated\n  = #{unterminated}\n\n"
        }
      end
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
    @chars[0x200B] = OpenStruct.new({latex: "\\mbox{}", math: false})
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
      /^\\fontencoding{[^}]+}\\selectfont\\char[0-9]+$/,
      /^\\[a-z]+\\[a-zA-Z]+$/,
      /^\\fontencoding{[^}]+}\\selectfont\\char[0-9]+$/,
      /^\\[a-z]+\\[a-zA-Z]+$/,
      /^\\[0-9a-zA-Z]+$/,
      /^\\u \\i$/,
      /^\\[~\^'`"]\\[ij]$/,
      /^\\[Huvc] [a-zA-Z]$/,
      /^\\[\.=][a-zA-Z]$/,
      /^\\[~\^'`"][a-zA-Z]$/,
      /^\^[123]$/,

      nil,

      /^\\sim\\joinrel\\leadsto$/,
      /^\\mathchar\"2208$/,
      /^\\'{}[a-zA-Z]$/,
      /^_\\ast$/,
      /^'n$/,
      /^\\int(\\!\\int)+$/,
      /^\\not\\kern-0.3em\\times$/
    ]
    terminated = [
      /^\\acute{\\ddot{\\[a-z]+}}$/,
      /^\\[a-zA-Z]+{\\?[0-9a-zA-Z]+}({\\?[0-9a-zA-Z]+})?$/,
      /^\\cyrchar{\\'\\[a-zA-Z]+}$/,
      /^\\[a-z]+{[,\.a-z0-9]+}$/,
      /^\\mathrm{[^}]+}$/,
      /^\\={\\i}$/,
      /^\\[=kr]{[a-zA-Z]}$/,
      /^''+$/,
      /^\\[^a-zA-Z0-9]$/,
      /^~$/,
      /^\\ddot{\\[a-z]+}$/,
      /^\\Pisymbol{[a-z0-9]+}{[0-9]+}$/,

      nil,

      /^{\/}\\!\\!{\/}$/,
      /^\\stackrel{\*}{=}$/,
      /^<\\kern-0.58em\($/,
      /^\\fbox{~~}$/,
      /^\\not[<>]$/,
      /^\\ensuremath{\\[a-zA-Z0-9]+}$/,
      /^[-`,\.]+$/,
      /^\\rule{1em}{1pt}$/,
      /^\\'\$\\alpha\$$/,
      /^\\mathrm{\\ddot{[A-Z]}}$/,
      /^\\'{}{[a-zA-Z]}$/,
      /^'$/,
      /^\\mathbin{{:}\\!\\!{-}\\!\\!{:}}$/,
      /^\\not =$/,
      /^=:$/,
      /^:=$/,
    ]

    unterminated = unterminated.collect{|p| p ? OpenStruct.new({re: p, terminated: false, max: 0}) : nil }
    terminated = terminated.collect{|p| p ? OpenStruct.new({re: p, terminated: true, max: 0}) : nil }

    @chars.each_pair{|charcode, latex|
      latex.latex.each{|ltx|
        next if ltx =~ /^[a-z]+$/i || ltx.strip == ''
        ltx.strip!
        ltx = ltx[1..-2] if ltx =~ /^\{.*\}$/
        ltx.sub!(/\{\}$/, '')
        next if charcode < 256 && ltx == charcode.chr

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
  patterns.sort_by{|p| p.max}.reverse.each{|p|
    #next unless p.max > 1
    re = p.re.to_s
    re.sub!(/^\(\?-mix:\^/, '')
    re.sub!(/\$\)$/, '')

    rule = "  / text:(\"#{re}\")"
    rule = rule.ljust(60, ' ')

    rule += " ![a-z0-9]" unless p.terminated
    rule = rule.ljust(72, ' ')
    rule += " &{ return LaTeX.toUnicode[text]; }"
    rule = rule.ljust(110, ' ')
    rule += "{ return LaTeX.toUnicode[text]; }"

    puts re
    #puts rule
  }
  end
end

if __FILE__ == $0
  UnicodeConverter.new.patterns
end
