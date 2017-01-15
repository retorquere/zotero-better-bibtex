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
  log = $Firefox.browser.manage.logs.get('browser')
  log = log.collect{|m| browserLogFormat(m) }
  log = log.join("\n")
  return log
end

class Hash
  # Replacing the to_yaml function so it'll serialize hashes sorted (by their keys)
  #
  # Original function is in /usr/lib/ruby/1.8/yaml/rubytypes.rb
  def to_yaml( opts = {} )
    YAML::quick_emit( object_id, opts ) do |out|
      out.map( taguri, to_yaml_style ) do |map|
        sort.each do |k, v|   # <-- here's my addition (the 'sort')
          map.add( k, v )
        end
      end
    end.gsub(/ !ruby\/object:Hash( {})?\n/, "\n")
  end
end
