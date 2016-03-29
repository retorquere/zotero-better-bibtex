require 'github_api'
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
      def get_stable_release(tag, prerelease)
        release = @releases.list(@config.github.user, @config.github.repo).detect{|rel| rel.tag_name == tag }
        return release if release

        sha = `git rev-list --max-parents=0 HEAD`.split(/\n/).collect{|sha| sha.strip}.first
        release = @releases.create(@config.github.user, @config.github.repo, {
          tag_name: tag,
          target_commitish: sha,
          name: tag,
          body: tag,
          prerelease: prerelease
        })
      end

      def publish
        raise "Github publishing not configured" unless @config.github && @config.github.user && @config.github.token
        token = ENV[@config.github.token]
        raise "Github publishing not configured" unless token

        @github = Github.new({oauth_token: token})
        @releases = @github.repos.releases

        release = nil
        if release_build?
          # create release and upload assets
          release = @releases.create(@config.github.user, @config.github.repo, {
            tag_name: self.release,
            name: self.release,
            body: self.release
          })
        else
          release = get_stable_release('builds', true)
        end

        @releases.assets.upload(@config.github.user, @config.github.repo, release.id, self.xpi, {
          name: self.versioned_xpi,
          content_type: 'application/x-xpinstall'
        })

        download = "https://github.com/#{@config.github.user}/#{@config.github.repo}/releases/download/#{release.name}/#{self.versioned_xpi}"
        if release_build?
          release = get_stable_release('update.rdf', false)
          # Remove any existing assets
          @github.repos.releases.assets.list(@config.github.user, @config.github.repo, release.id){ |asset|
            @github.repos.releases.assets.delete(@config.github.user, @config.github.repo, asset.id)
          }

          update_rdf(download){|update|
            @releases.assets.upload(@config.github.user, @config.github.repo, release.id, update, {
              name: 'update.rdf',
              content_type: 'application/rdf+xml'
            })
          }
        end

        return download
      end
    end
  end
end

