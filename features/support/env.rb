require 'selenium-webdriver'
require 'pp'

require 'net/http'
require 'addressable/uri'
require 'json'
require 'shellwords'
require 'open-uri'
require 'nokogiri'

class JSONRPCError < StandardError
end

class JSONRPCClient
  def initialize(url)
    @address    = Addressable::URI.parse(url)
  end

  def request(method, params=nil)
    result = {}
    params ||= []
    h = {"Content-Type" => "application/json"}
    Net::HTTP.start(@address.host, @address.port, :read_timeout => (15 * 60)) do |connection| # 15 minute read timeout for bulk export
      body = connection.post(@address.path, {:method => method.to_s, :params => params}.to_json, h).body
      begin
        result = JSON.parse(body)
      rescue
        throw "Unexpected #{body.inspect} when requesting #{method}(#{params.join(',')})"
      end
    end
    if error = result["error"]
      raise JSONRPCError, error["message"]
    end
    #puts "#{method}(#{params.inspect}) => #{result.inspect}"
    result
  end

  def getAll
    all = request('getAll')['result']
    #all = all.sort{|a, b| Integer(a['id']) <=> Integer(b['id']) }
    all.each{|item|
      item.each_pair{|k, v|
        item.delete(k) if v == [] || v == '' || v.nil?
      }
    }
    return all
  end

  def method_missing(method, *args, &block)
    res = request(method.to_s, args)
    return res['result']
  end
end

def browserLogFormat(m)
  rjust = 'WARNING'.length
  indent = ' ' * (rjust + ': '.length)

  level = m.level.rjust(rjust, ' ')
  msg = m.message.strip.gsub("\n", "\n" + indent)

  "#{level}: #{msg}"
end

def browserLog
  log = BROWSER.manage.logs.get('browser')
  log = log.collect{|m| browserLogFormat(m) }
  log = log.join("\n")
  return log
end

class Array
  def normalize!
    self.each{|e|
      e.normalize! if e.respond_to?('normalize!')
    }
    #self.sort! if self.size > 0 && (self[0].is_a?(String) || self[0].is_a?(Integer))
  end
end
class Hash
  def normalize!
    self.keys.sort{|a, b| a != b ? a <=> b : self[a] <=> self[b]}.each{|k|
      self[k].normalize!  if self[k].respond_to?('normalize!')
      self[k] = self.delete(k)
      self.delete(k) if self[k] == [] || self[k] == '' || self[k] == {}
    }
  end
end

def resolvexpi(source)
  if source =~ /update\.rdf$/
    update_rdf = Nokogiri::XML(open(source).read)
    update_rdf.remove_namespaces!
    url = update_rdf.at('//updateLink').inner_text
  elsif source =~ /^https:\/\/addons\.mozilla\.org\//
    page = open(source).read
    page = Nokogiri::HTML(page)
    url = page.at_css('p.install-button').at_css('a')['href']

    url = URI.join(source, url ).to_s if url !~ /^http/

    return resolvexpi(url) if url =~ /\/contribute\/roadblock\//

    # AMO uses redirects, so I can't write the file to the final name just yet
    final_uri = nil
    open(url) do |h|
      final_uri = h.base_uri
    end
    url = final_uri.to_s
  elsif source =~ /^file:/ || source =~ /\.xpi(\?|$)/
    url = source
  else
    throw "Unsupported XPI source #{source}"
  end

  return OpenStruct.new(url: url, xpi: url.sub(/.*\//, '').sub(/\?.*$/, ''))
end

def getxpis(sources, dir)
  FileUtils.mkdir_p(dir)
  installed = Dir["#{dir}/*.xpi"].collect{|f| File.basename(f) }

  sources = sources.collect{|s| resolvexpi(s) }

  (installed - sources.collect{|s| s.xpi}).each{|xpi|
    puts "Removing #{xpi}"
    File.unlink("#{dir}/#{xpi}")
  }
  sources.reject{|s| installed.include?(s.xpi) && s.url !~ /^file:/ }.each{|s|
    if s.url =~ /^file:/
      puts "Copying #{s.xpi}"
      path = s.url.sub(/^file:/, '')
      FileUtils.cp(path, "#{dir}/#{s.xpi}")
    else
      puts "Downloading #{s.xpi}"
      download(s.url, "#{dir}/#{s.xpi}")
    end
  }
end

