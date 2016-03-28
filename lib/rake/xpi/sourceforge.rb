require 'net/sftp'
require 'nokogiri'
require 'shellwords'

module Rake
  module XPI
    class Config
      include Rake::DSL

      def publish
        raise "Sourceforge publishing not configured" unless @config.sourceforge && @config.sourceforge.project && @config.sourceforge.user && @config.sourceforge.key

        STDERR.puts "Publishing #{self.versioned_xpi} to sourceforge"

        builds = 'builds'
        download = "http://downloads.sourceforge.net/project/#{@config.sourceforge.project}/#{self.release_build? ? self.release : builds}/#{self.versioned_xpi}"
        latest = nil
        # assumes ssh keys set up properly
        Net::SFTP.start('frs.sourceforge.net', @config.sourceforge.user) do |sftp|
          root = "/home/frs/project/#{@config.sourceforge.project}"

          mkdir = lambda do |dir|
            dir = "#{root}/#{dir}" unless dir =~ /^\//
            begin
              sftp.mkdir!(dir)
            rescue => e
              STDERR.puts "#{dir} exists: #{e}"
            end
          end

          if self.release_build?
            mkdir.call('update')
            update_rdf(download){|update|
              sftp.upload!(update, "#{root}/update/update.rdf")
            }
            latest = self.release
          else
            begin
              latest = Nokogiri::XML(sftp.download!("#{root}/update/update.rdf")).at('//em:version').inner_text
            rescue => e
              STDERR.puts "no existing release (#{e})"
            end
          end

          # create builds dir
          mkdir.call(builds)

          # create release dir
          dir = "#{root}/#{self.release_build? ? self.release : builds}"
          begin
            sftp.mkdir!(dir)
          rescue
          end
          # put the XPI there
          sftp.upload!(File.absolute_path(xpi), "#{dir}/#{self.versioned_xpi}")

          # remove builds older than a week
          cutoff = (Time.now - (7*24*60*60)).to_i
          old = []
          sftp.dir.foreach("#{root}/#{builds}") do |file|
            old << file.longname if file.attributes.mtime < cutoff
          end
          old.each{|file|
            sftp.remove(file)
          }
        end

        if latest
          # https://sourceforge.net/p/forge/documentation/Using%20the%20Release%20API/
          RestClient.put(
            "https://sourceforge.net/projects/#{@config.sourceforge.project}/files/#{latest}/#{self.versioned_xpi(latest)}",
            "default=windows&default=mac&default=linux&default=bsd&default=solaris&default=others&api_key=#{ENV[@config.sourceforge.key]}",
            {accept: :json}
          )
        end

        return download
      end
    end
  end
end
