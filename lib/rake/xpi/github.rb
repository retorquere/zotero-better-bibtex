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
        raise "Github publishing not configured" unless @config.github && @config.github.user && @config.github.token
        token = ENV[@config.github.token]
        raise "Github publishing not configured" unless token
        STDERR.puts "Publishing #{self.versioned_xpi} to Github"

        github = Github.new({oauth_token: token})
        releases = github.repos.releases

        # create release and upload assets
        release = releases.create(@config.github.user, @config.github.repo, {
          tag_name: self.release,
          name: self.release,
          body: self.release,
          prerelease: !release_build?
        })

        releases.assets.upload(@config.github.user, @config.github.repo, release.id, self.xpi, {
          name: self.versioned_xpi,
          content_type: 'application/x-xpinstall'
        })

        if release_build?
          latest = 'latest'
          release = releases.list(@config.github.user, @config.github.repo).detect{|rel| rel.name == latest }
          raise "For publishing, there must be a released named #{latest.inspect}" unless release
          
          # Remove any existing assets
          github.repos.releases.assets.list(@config.github.user, @config.github.repo, release.id){ |asset|
            github.repos.releases.assets.delete(@config.github.user, @config.github.repo, asset.id)
          }

          update_rdf("https://github.com/#{@config.github.user}/#{@config.github.repo}/releases/download/#{latest}/#{self.versioned_xpi}"){|update|
            releases.assets.upload(@config.github.user, @config.github.repo, release.id, update, {
              name: 'update.rdf',
              content_type: 'application/rdf+xml'
            })
          }
        end
      end
    end
  end
end
