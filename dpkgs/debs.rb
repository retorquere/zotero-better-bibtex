#!/usr/bin/env ruby

require 'shellwords'

STDOUT.sync = true

debs = File.expand_path(File.dirname(__FILE__))

IO.readlines(File.join(debs, 'debs.txt')).each{|download|
  pkg, ver = *download.split
  deb = "#{debs}/#{pkg}_#{ver}_amd64.deb"
  if File.file?(deb)
    puts "#{deb} exists"
    next
  end

  url = `apt-get download --print-uris #{pkg}`.strip
  if url =~ /'(.*?)'/
    cmd = "wget -nv #{$1.shellescape} -O #{deb}"
    #puts cmd
    system cmd
  else
    puts "No url for #{pkg}"
  end
}

