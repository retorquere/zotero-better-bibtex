#!/usr/bin/env ruby

require 'nokogiri'
require 'open-uri'

def supported_z(v)
  return Gem::Version.new(v) < Gem::Version.new('4.0.28') ? 'unsupported' : 'supported'
end

Nokogiri::HTML(open('https://www.zotero.org/download/')).css('#client-downloads li a').each{|link|
	href = link['href']
  next unless href =~ /download\.zotero\.org/
  if href =~ /extension\/zotero-([\.0-9]+).xpi$/
    puts "Zotero extension: #{$1} (#{supported_z($1)})"
  elsif href =~ /Zotero-([\.0-9]+)_setup\.exe/
    puts "Zotero Windows: #{$1} (#{supported_z($1)})"
  elsif href =~ /Zotero-([\.0-9]+)\.dmg/
    puts "Zotero macOS: #{$1} (#{supported_z($1)})"
  elsif href =~ /Zotero-([\.0-9]+)_linux-i686\.tar/
    puts "Zotero Linux x32: #{$1} (#{supported_z($1)})"
  elsif href =~ /Zotero-([\.0-9]+)_linux-x86_64\.tar/
    puts "Zotero Linux x64: #{$1} (#{supported_z($1)})"
  else
    throw href
  end
}

def supported_j(v)
  v = v.sub(/beta[0-9]+/, '').sub('m', '.')
  return 'unsupported' if Gem::Version.new(v) < Gem::Version.new('4.0.29.12.95')
  return 'semi-supported' if Gem::Version.new(v) < Gem::Version.new('4.0.29.12.98')
  return 'semi-supported'
end
  
%w{zotero zotero-standalone-build}.each{|repo|
  Nokogiri::HTML(open("https://github.com/Juris-M/#{repo}/releases/latest")).css('ul.release-downloads li a').each{|link|
	  href = link['href']
    next unless href =~ /\/releases\/download\//

    if repo == 'zotero' && href =~ /jurism-v([\.0-9]+m[0-9]+)-fx.xpi/
      puts "Juris-M extension: #{$1} (#{supported_j($1)})"
    elsif repo == 'zotero-standalone-build' && href =~ /jurism-for-([a-z]+)-([a-z0-9]+)-([\.0-9]+m[0-9]+)(_setup)?\./
      platform = $1
      platform += " #{$2}" unless $2 == 'all'
      puts "Juris-M #{platform}: #{$3} (#{supported_j($3)})"
    else
      throw "#{repo}: #{href}"
    end
  }
}
