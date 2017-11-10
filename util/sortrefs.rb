#!/usr/bin/env ruby

refs = []

IO.readlines(ARGV[0]).each{|line|
  if line =~ /^@[a-z]+{(.+),$/
    puts $1
    refs << { citekey: $1, ref: '' }
  end

  refs[-1][:ref] += line
}

puts refs.sort_by{|ref| ref[:citekey] }.collect{|ref| ref[:ref] }.join('')
