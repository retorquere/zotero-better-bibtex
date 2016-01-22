#!/usr/bin/env ruby

require 'erb'

BIBLIOGRAPHY=open(ARGV[0]).read
CITEKEYS=IO.readlines(ARGV[0]).collect{|line|
  if line.strip =~ /^@.*{(.*),$/
    $1
  else
    nil
  end
}.compact

if File.extname(ARGV[0]) == '.biblatex'
  CITATIONS=CITEKEYS.collect{|key| "\\citet{#{key}}"}.join("\n\n")
  TEMPLATE="""
    \\documentclass{article}
    \\usepackage{filecontents}
    %\\usepackage[utf8]{inputenc}
    %\\usepackage{textcomp}
    \\usepackage[backend=biber,style=authoryear-icomp,natbib=true,url=false,doi=true,eprint=false]{biblatex}
    \\begin{filecontents*}{\\jobname.bib}
    <%= BIBLIOGRAPHY %>
    \\end{filecontents*}
    \\addbibresource{\\jobname}
    \\begin{document}
    <%= CITATIONS %>

    \\printbibliography
    \\end{document}
  """
else
  CITATIONS=CITEKEYS.collect{|key| "\\cite{#{key}}"}.join("\n\n")
  TEMPLATE="""
    \\documentclass{article}
    \\usepackage{filecontents}
    \\usepackage{url}
    \\begin{filecontents*}{\\jobname.bib}
    <%= BIBLIOGRAPHY %>
    \\end{filecontents*}
    \\begin{document}
    <%= CITATIONS %>

    \\bibliographystyle{alpha}
    \\bibliography{\jobname}
    \\end{document}
  """
end

open('mwe.tex', 'w') {|mwe|
  mwe.puts(ERB.new(TEMPLATE).result())
}
