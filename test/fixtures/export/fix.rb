Dir['*.bib*tex'].each{|bib|
  tex = ''
  IO.readlines(bib).each{|line|
    next if line =~ /timestamp = {/
    tex += line
  }
  open(bib, 'w'){|f| f.write(tex) }
}
