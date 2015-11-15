#!/usr/bin/env ruby

require 'open-uri'
require 'json'

def codepoint(charcode)
  lowmask = ('1' * 10).to_i(2)
  return [charcode] if charcode < 0x10000

  codepoint = charcode - 0x10000
  #puts codepoint.inspect
  #puts codepoint >> 10
  high = (codepoint >> 10) + 0xD800
  low = (lowmask & codepoint) + 0xDC00
  return [high, low]
end

#IO.readlines(open('http://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt')).each{|line|
charclass = {'Lu' => [], 'L' => [], 'N' => []}

open(File.join(File.dirname(__FILE__), 'charclass.coffee'), 'w'){|f|
  f.puts "CharClass ="
  IO.readlines(open(File.join(File.dirname(__FILE__), 'UnicodeData.txt'))).each{|line|
    line.strip!
    data = line.split(';')
    next if data[1] =~ /,/
    cp = data[0].to_i(16)
    c = data[2]

    if c == 'Lu'
      cc = 'Lu'
    elsif c[0] == 'L'
      cc = 'L'
    elsif c[0] == 'N'
      cc = 'N'
    else
      next
    end

    charclass[cc] << codepoint(cp)

    chr = codepoint(cp).collect{|n| "\\u" + n.to_s(16).rjust(4, '0') }.join('')

    f.puts "  '#{chr}': '#{cc}'"
    charclass[cc] << [cp]
  }
}

exit

lookup = {}

charclass.each_pair{|cc, cps|
  cps.each{|cp|
    if cp.length == 1
      lookup[cp[0]] = cc
    else
      lookup[cp[0]] ||= {}
      lookup[cp[0]][cp[1]] = cc
    end
  }
}

#puts lookup.to_json
x = {3 => 'x'}
puts x.to_json
