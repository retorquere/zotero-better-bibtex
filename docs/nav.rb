#!/usr/bin/env ruby

require 'yaml'

nav = YAML::load_file('_data/nav.yml')

$pages = Dir['*.md'].collect{|md| File.basename(md, File.extname(md)) }.reject{|md| md == 'sponsorship' }

def verify(pages)
  pages.each{|page|
    if page['url']
      id = page['url'].gsub('/', '')
      id = 'index' if id == ''
      if $pages.include?(id)
        $pages = $pages - [id]
      else
        throw "#{id} does not exist"
      end
    end

    verify(page['pages']) if page['pages']
  }
end

verify(YAML::load_file('_data/nav.yml'))

$pages.each{|page|
  throw "#{page} is not in navigation"
}
