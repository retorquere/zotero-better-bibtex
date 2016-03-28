#require 'aws-sdk'
#require 'fileutils'
#require 'front_matter_parser'
#require 'jwt'
#require 'nokogiri'
#require 'open-uri'
#require 'ostruct'
#require 'rake'
#require 'recursive-open-struct'
#require 'rest-client'
#require 'rickshaw'
#require 'securerandom'
#require 'socket'
#require 'tempfile'
#require 'uri'
#require 'yaml'
#require 'zip'

module Rake
  module XPI
    class Config
      def publish
        raise "Bintray publishing not configured" unless @config.bintray && @config.bintray.secret
        STDERR.puts "Publishing #{self.versioned_xpi} to Bintray"
        #RestClient.log = 'stdout'

        secret = ENV[@config.bintray.secret]

        client = RestClient::Resource.new('https://api.bintray.com', @config.bintray.user, secret)
        content = client['content'][@config.bintray.user][@config.bintray.repo]

        begin
          client['packages'][@config.bintray.user][@config.bintray.repo][@config.bintray.package]['versions']['latest'].delete
        rescue RestClient::ResourceNotFound
          # that's OK
        end

        content[@config.bintray.package][self.version][self.versioned_xpi].put(File.new(self.xpi), {
          content_type: 'application/x-xpinstall',
          x_bintray_package: @config.bintray.package,
          x_bintray_version: self.version,
          x_bintray_publish: '1'
        })

        if release_build?
          update_rdf("https://bintray.com/artifact/download/#{@config.bintray.user}/#{@config.bintray.repo}/#{@config.bintray.package}/#{self.version}/#{self.versioned_xpi}"){|update|
            content[@config.repo.package]['update.rdf'].put(File.new(update), {
              content_type: 'application/rdf+xml',
              x_bintray_package: @config.repo.package,
              x_bintray_version: 'latest',
              x_bintray_publish: '1',
              x_bintray_override: '1'
            })
          }
        end
      end
    end
  end
end
