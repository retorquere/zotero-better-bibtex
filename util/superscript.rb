#!/usr/bin/env ruby

require 'open-uri'
require 'json'

superscripts = []
open('http://unicode.org/reports/tr30/datafiles/SuperscriptFolding.txt').readlines.each{|line|
  next unless line =~ /^[0-9A-F]{4};/
  line = line.split
  next unless line[2] == '#'

  line[0].sub!(/;/, '')

  next if line[0] > '3192'
  case line[0]
    when '00AA', '00BA', '06E5', '06E6'
      next
  end

  if line[1] >= '0020' && line[1] <= '007E'
    chr = line[1].to_i(16).chr
    chr = chr.to_json unless chr =~ /[a-z0-9]/i
  else
    chr = "'\\u" + line[1] + "'"
  end

  superscripts << "    #{chr}: '\\u#{line[0]}'"
  superscripts << "    \"-\": '\\u#{line[0]}'" if chr == "'\\u2212'"
}

puts superscripts.sort.join("\n")
