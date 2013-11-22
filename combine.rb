#!/usr/bin/env ruby

require 'bibtex'
require 'pp'
require 'pathname'
require 'yaml'
require 'trollop'
require 'tree'
require 'to_ascii_latex'

OPTS = Trollop::options do
    opt :no_attachments, "Discard all attachments"
    opt :orphans, "Find orphaned documents", :type => :string, :default => ''
    opt :ignore_unsupported, "Ignore entries unsupported by Zotero"
    opt :os, "'win' for backslashes in paths, 'lin' for front slashes", :type => :string, :default => 'lin'
    opt :keywords, "dump/verify keywords", :type => :string, :default => ''
end

DEFAULT = 'combined.bibtex'
TARGET = File.expand_path(File.directory?(ARGV[0]) ? File.join(ARGV[0], DEFAULT) : (ARGV[0] || DEFAULT))
ROOT = File.dirname(TARGET)
ORPHANS = OPTS[:orphans].split(',').collect{|ext| ext.strip}
KEYWORDS = []
EXTENSIONS = []

if OPTS[:keywords] && File.exists?(OPTS[:keywords])
  ACCEPTED_KEYWORDS = IO.readlines(OPTS[:keywords]).collect{|kw| kw.strip}
else
  ACCEPTED_KEYWORDS = nil
end
ERRORS = {}

raise "#{ROOT} is not a directory" unless File.directory?(ROOT)
raise "Don't use #{File.basename(TARGET)} for a target -- re-scanning would pick it up in the combine" if File.extname(TARGET).downcase == '.bib'
raise "Unknown --os #{OPTS[:os]}" unless %w{lin win}.include?(OPTS[:os])

class BibTeX::Comment
  def to_s(options = {})
    "@comment{#@content}\n"
  end
end

class Tree::TreeNode
  def to_bibtex_comment
    tbc = []

    if level == 0
      tbc << "jabref-meta: groupstree:\n0 AllEntriesGroup:"
    else
      tbc << (["#{level} ExplicitGroup:#{name}", '0'] + @content + ['']).collect{|x| x.gsub(';', "\\;")}.join(';')
    end

    tbc << @children.collect{|child| child.to_bibtex_comment}

    if level == 0
      return (tbc + ['']).flatten.collect{|x| x.gsub(';', "\\;") }.join(";\n").scan(/.{1,70}/).join("\n") + "\n"
    else
      return tbc
    end
  end

  def to_folder_assignment(parent = [])
    tfa = {}

    @content.each{|key| tfa[key] = parent + [name]}

    @children.each{|child|
      tfa.merge!(child.to_folder_assignment(parent + [name]))
    }

    tfa.keys.each{|k| tfa[k].shift if tfa[k][0] == '' }

    return tfa
  end
end

class CombinedBib
  def initialize(root)
    @root = root
    @combined = BibTeX::Bibliography.new
    @bibid = {}
    @collections = Tree::TreeNode.new("", [])
    @keys = []
  end

  def addcollection(collection, path)
    raise "Unicode in  #{path.inspect}" if path.delete("^\u{0000}-\u{007F}") != path
    path.split('/').each{|coll|
      coll.gsub!(';', '') # JabRef quoted-char handling is incredible fragile
      if collection[coll]
        collection = collection[coll]
      else
        collection = collection << Tree::TreeNode.new(coll, [])
      end
    }
    return collection
  end

  def addbib(bib)
    @combined << BibTeX::Comment.new(bib)
    @bibfile = bib.gsub(/\\/, '/').gsub(/\/+/, '/')
    @bibid[@bibfile] = @bibid.size
    @currentbib = @bibid[@bibfile]

    if Dir[File.join(File.dirname(@bibfile), '*.bib')].size == 1
      collection = File.dirname(@bibfile)
    elsif File.basename(@bibfile, File.extname(@bibfile)).downcase == File.basename(File.dirname(@bibfile)).downcase
      collection = File.dirname(@bibfile)
    else
      collection = @bibfile.gsub(/\.bib$/i, '')
    end

    collection = Pathname.new(collection).relative_path_from(Pathname.new(@root)).to_s
    @collection = (collection == '.' ? @collections : addcollection(@collections, collection))

    puts bib
    BibTeX.open(bib).each{|entry|
      @entry = entry
      if entry.is_a?(BibTeX::Comment)
        processcomment(entry)
      else
        addentry(entry)
      end
    }
    @bibfile = nil
  end

  def addentry(entry)
    raise "#{@bibfile}: Zotero bibtex import does not support entry type @#{entry.type}{#{entry.key}" unless OPTS[:ignore_unsupported] || %w{book inbook incollection article patent phdthesis
                                                                                                                                             unpublished inproceedings conference techreport
                                                                                                                                             booklet manual mastersthesis misc proceedings}.include?(entry.type.to_s)

    entry.key = uniq(entry.key)

    if entry.respond_to?('file')
      entry.file = entry.file.to_s.gsub(/\\;/, "\t").split(';').collect{|file| file.gsub(/\t/, ';')}.collect{|file|
        file = file.split(':', -1)
        raise "#{entry.key} @#{@bibfile}: #{file.inspect}" unless file.size == 3

        file = cleanpath(file[1], @bibfile)
        @linked[file] = true

        attachment(file)
      }.join(';')

      entry.file = '' if OPTS[:no_attachments]
    end

    if entry.respond_to?('url') && entry.url.to_s.strip != '' && entry.url.to_s.strip !~ /:\/\// && !OPTS[:no_attachments]
      file = cleanpath(entry.url.to_s.strip, @bibfile)
      @linked[file] = true
      entry.file = ((entry.respond_to?('file') ? entry.file.to_s : '') + ';' + attachment(file)).gsub(/^;/, '')
      entry.url = ''
    end

    if entry.respond_to?('keyword')
      entry.keywords = ((entry.respond_to?('keywords') ? entry.keywords : '') + ', ' + entry.keyword.to_s).gsub(/^,\s*/, '')
      entry.keyword = ''
    end

    if entry.respond_to?('keywords')
      entry.keywords = entry.keywords.to_s.gsub(/[\r\n]/, ' ').split(/[,;]/).collect{|kw| kw.strip}.uniq.join(',')
      entry.keywords = entry.keywords.to_s.split.uniq.join(',') if entry.keywords.to_s =~ /\s/ && entry.keywords.to_s !~ /,/
      keywords = entry.keywords.to_s.split(/,/)
      KEYWORDS << keywords
      error(cleanpath(@bibfile, @root), "@#{entry.key}: non-whitelisted keywords #{(keywords - ACCEPTED_KEYWORDS).inspect}") if ACCEPTED_KEYWORDS && (keywords - ACCEPTED_KEYWORDS).size != 0
    end

    entry.author = entry.author.to_s.to_latex if entry.author
    entry.pages = entry.pages.to_s.to_latex if entry.pages

    @collection.content << entry.key
    @combined << entry
  end

  def error(key, msg)
    raise msg unless key
    ERRORS[key] ||= []
    ERRORS[key] << msg
    ERRORS[key].uniq!
  end

  def uniq(key)
    key
    #"#{key}@#{@currentbib}" #.gsub(/[^a-z0-9]/i){|ch| "-#{ch.ord}-"}
  end

  def jabrefSplit(str, sep)
    res = []
    str = str.split(//)
    while str.size > 0
      res = [''] if res.empty?

      if str[0,1] == sep
        str.shift
        res << ''
      else
        str.shift if str[0,1] == '\\'
        res[-1] << str.shift
      end
    end
    return res
  end

  def processcomment(comment)
    return if comment.content =~ /^jabref-meta: selector_[a-z]+:$/ || comment.content == 'jabref-meta: groupsversion:3;'

    raise "Unexpected comment entry #{comment.content}" unless comment.content =~ /^jabref-meta: groupstree:/

    postfix = []

    content = comment.content.gsub(/[\r\n]/, '').gsub(/^jabref-meta: groupstree:/, '')

    jabrefSplit(content, ';').each{|record|
      record = jabrefSplit(record, ';')
      next if record.size < 2

      id = record.shift
      intersection = record.shift
      record = record.reject{|key| key == ''}

      m = id.match(/^([0-9]) (.*?):(.*)/)
      level = Integer(m[1])
      type = m[2]
      name = m[3]
      next if level == 0 # level 0 is uninteresting
      raise "Unexpected type #{type}" unless type == 'ExplicitGroup'
      raise "Unexpected intersection" unless intersection == '0'

      postfix = postfix[0, level - 1] + [name]
      collection = addcollection(@collection, postfix.join('/'))

      record.each{|key|
        collection.content << uniq(key)
      }
    }
  end

  def scan
    @linked = {}
    @orphans = []
    Dir["#{@root}/**/*.bib"].sort.each{|bib|
      addbib(bib)
    }

    if ORPHANS.size > 0
      Dir["#{@root}/**/*.{#{ORPHANS.join(',')}}"].sort.each{|orphan|
        path = cleanpath(orphan, @root)
        @orphans << path unless @linked[path]
      }
    end
    @orphans = nil if @orphans.empty?
  end
  attr_reader :orphans

  def cleanpath(path, relto)
    relto = File.dirname(relto) if File.file?(relto)

    path = path.gsub(/\\;/, ';')
    path = path.gsub(/\\/, '/').gsub(/\/+/, '/')
    path = File.join(relto, path) if path !~ /^\//
    error(@bibfile || 'orphans', "path #{path} with ';'; zotero import will fail") if path =~ /;/
    error(@bibfile, "#{@entry.key} has non-existent path #{path}") unless File.exists?(path) || OPTS[:no_attachments]
    path = Pathname.new(path).relative_path_from(Pathname.new(@root)).to_s

    raise "Unicode in  #{path.inspect}" if path.delete("^\u{0000}-\u{007F}") != path
    return path
  end

  def attachment(file)
    error(@bibfile, "Zotero bibtex import fails on files with ':' or ';' in the name; cannot accept #{file.inspect}") if file =~ /[:;]/
    path = file.gsub(';', "\\;")
    path.gsub!(/\//, "\\\\\\") if OPTS[:os] == 'win'

    filetype = case File.extname(file).downcase
      when '.pdf' then 'PDF'
      when /^\.docx?$/ then 'Word'
      when /^\.pptx?$/ then 'PowerPoint'
      when '.epub', '.mobi' then 'ePUB'
      else raise "Unexpected file type for #{file}"
    end
    EXTENSIONS << File.extname(file).downcase

    return ":#{path}:#{filetype}"
  end

  def save(combined, orphan_bib = nil)
    if @orphans
      @orphans.each_with_index{|article, i|
        collection = File.dirname(article)
        collection = (collection == '.' ? @collections : addcollection(@collections, collection))

        misc = BibTeX::Entry.new
        misc.type = :misc
        misc.key = 'orphan_' + File.basename(article, File.extname(article)).downcase.gsub(' ', '_').gsub(/[^-_a-z0-9]/, '') + "_#{i}"
        misc.title, misc.keywords = *(File.basename(article, File.extname(article)).gsub('_', '-').split('#', 2))
        misc.keywords = (misc.keywords.gsub('#', ',') + ' orphaned').strip
        misc.file = attachment(article) unless OPTS[:no_attachments]

        @combined << misc
        collection.content << misc.key
      }
    end

    @combined << BibTeX::Comment.new('jabref-meta: groupsversion:3;')
    @combined << BibTeX::Comment.new(@collections.to_bibtex_comment)
    @combined.save_to(combined)

    File.open(combined + '.yaml', 'wb'){|f|
      f.write(@collections.to_folder_assignment.to_yaml)
    }
  end
end

puts "Scanning #{ROOT} to create #{TARGET}"

bib = CombinedBib.new(ROOT)
bib.scan

if ERRORS.size > 0
  ERRORS.keys.sort.each{|k|
    puts "#{k}"
    ERRORS[k].each{|err| puts "  #{err}"}
  }
  exit
end

bib.save(TARGET, File.join(File.dirname(TARGET), File.basename(TARGET, File.extname(TARGET)) + '_orphans' + File.extname(TARGET)))

#KEYWORDS.uniq.sort.each{|kw| puts kw } if OPTS[:keywords]
#pp EXTENSIONS.uniq.sort
