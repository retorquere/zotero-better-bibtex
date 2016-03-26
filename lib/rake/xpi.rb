require 'fileutils'
require 'front_matter_parser'
require 'github_api'
require 'jwt'
require 'nokogiri'
require 'open-uri'
require 'ostruct'
require 'rake'
require 'recursive-open-struct'
require 'rest-client'
require 'rickshaw'
require 'securerandom'
require 'tempfile'
require 'uri'
require 'yaml'
require 'zip'
require 'socket'

module Rake
  module XPI
    class Config
      include Rake::DSL

      def initialize()
        @config = RecursiveOpenStruct.new(YAML::load_file('xpi.yml'), recurse_over_arrays: true)
        @timestamp = Time.now.to_i.to_s

        @config.to_h.keys.each{|key|
          next if key.to_s == 'xpi'
          self.class.send(:define_method, key) { @config[key] }
        }
      end

      def xpi
        return File.basename(@config.xpi, File.extname(@config.xpi)) + '-' + self.version + '.xpi'
      end

      def bump(level=nil)
        r = release.split('.').collect{|n| Integer(n)}
        r = case (level || 'patch').intern
            when :major then [r[0] + 1, 0, 0]
            when :minor then [r[0], r[1] + 1, 0]
            when :patch then [r[0], r[1], r[2] + 1]
            else raise "Unexpected release increase #{level.inspect}"
            end
        self.release = r.collect{|n| n.to_s}.join('.')
      end

      def id
        return Nokogiri::XML(File.open('install.rdf')).at('//em:id').inner_text
      end
      def release
        return Nokogiri::XML(File.open('install.rdf')).at('//em:version').inner_text
      end
      def release=(rel)
        doc = Nokogiri::XML(File.open('install.rdf'))
        doc.at('//em:version').inner_text = rel
        if XPI.bintray
          doc.at('//em:updateURL').content = "https://bintray.com/artifact/download/#{XPI.bintray.organization}/#{XPI.bintray.repo}/#{XPI.bintray.package}/update.rdf"
        elsif XPI.github
          doc.at('//em:updateURL').content = "https://github.com/#{XPI.github.user}/#{XPI.github.repo}/releases/download/update.rdf/update.rdf"
        end
        open('install.rdf', 'w'){|f| f.write(doc.to_xml)}
      end

      def version
        if ENV['RELEASE'] == 'true'
          return release
        elsif ENV['TRAVIS_BUILD_NUMBER']
          return release + "-travis-#{ENV['TRAVIS_BUILD_NUMBER']}"
        elsif ENV['CIRCLE_BUILD_NUM']
          return release + "-circle-#{ENV['CIRCLE_BUILD_NUM']}"
        else
          return release + "-#{Socket.gethostname}-#{@timestamp}"
        end
      end

      def update_rdf(link)
        _id = self.id
        _release = self.release
        _changelog = self.changelog

        update = Nokogiri::XML::Builder.new { |xml|
          xml.RDF('xmlns:RDF'=>'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'xmlns:em' =>
          'http://www.mozilla.org/2004/em-rdf#') {
            xml.parent.namespace = xml.parent.namespace_definitions.find{|ns|ns.prefix=='RDF'}
            xml['RDF'].Description(about: "urn:mozilla:extension:#{_id}") {
              xml['em'].updates {
                xml['RDF'].Seq {
                  xml['RDF'].li {
                    xml['RDF'].Description {
                      xml['em'].version { xml.text _release }

                      Nokogiri::XML(open('install.rdf')).xpath('//em:targetApplication/xmlns:Description').each{|target|
                        xml['em'].targetApplication {
                          xml['RDF'].Description {
                            xml['em'].id { xml.text target.at('./em:id').inner_text }
                            xml['em'].minVersion { xml.text target.at('./em:minVersion').inner_text }
                            xml['em'].maxVersion { xml.text target.at('./em:maxVersion').inner_text }
                            xml['em'].updateLink { xml.text link }
                            xml['em'].updateInfoURL { xml.text _changelog }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        STDERR.puts update.to_xml

        Tempfile.create('update_rdf') do |tmp|
          tmp.write(update.to_xml)
          tmp.close
          yield tmp.path
        end
      end

      def download(url, file)
        puts "Downloading #{url} to #{file}..."
        sh "curl -L #{url.shellescape} -o #{file.shellescape}"
      end

      def release_message
        return "release: #{self.xpi} #{self.release}"
      end

      def publish
        commitmsg = `git log -n 1 --pretty=oneline`.strip
        commit = %w{CIRCLE_SHA1 TRAVIS_COMMIT}.collect{|key| ENV[key]}.compact.first
        commit ||= 'local'

        releasemsg = "#{commit} #{release_message}"

        STDERR.puts "#{self.version}"
        STDERR.puts "  committed = #{commitmsg}"
        STDERR.puts "  release   = #{releasemsg}"

        deploy = (commitmsg == releasemsg) && self.version == self.release && ENV['RELEASE'] == 'true'
        deploy = true

        if @config.bintray && @config.bintray.user && @config.bintray.secret
          secret = ENV[@config.bintray.secret]
          if secret
            STDERR.puts "Deploying #{self.release} (#{commit}) to Bintray"
            client = RestClient::Resource.new('https://api.bintray.com', @config.bintray.user, secret)
            content = client['content'][@config.bintray.user][@config.bintray.repo]

            content[@config.bintray.package][self.version][self.xpi].put(File.new(self.xpi),
              content_type: 'application/x-xpinstall',
              x_bintray_package: @config.bintray.package,
              x_bintray_version: self.version,
              x_bintray_publish: '1'
            )

            if deploy
              update_rdf("https://bintray.com/artifact/download/#{@config.bintray.organization}/#{@config.bintray.repo}/#{@config.bintray.package}/#{self.version}/#{self.xpi}"){|update|
                content[@config.bintray.package]['update.rdf'].put(File.new(update),
                  content_type: 'application/rdf+xml',
                  x_bintray_package: @config.bintray.package,
                  x_bintray_version: self.version,
                  x_bintray_publish: '1'
                )
              }
              #client['file_metadata'][@config.bintray.user][@config.bintray.repo][@config.bintray.package][self.version][self.xpi].put('{ "list_in_downloads":true }')
            end
          end

        elsif @config.github && @config.github.user && @config.github.token
          token = ENV[@config.github.token]
          if deploy && token
            STDERR.puts "Deploying #{self.release} (#{commit}) to Github"
            github = Github.new({oauth_token: token})

            # create release and upload assets
            release = github.repos.releases.create(@config.github.user, @config.github.repo, {
              tag_name: self.release,
              name: self.release,
              body: self.release
            })

            github.repos.releases.assets.upload(@config.github.user, @config.github.repo, release.id, self.xpi, {
              name: self.xpi,
              content_type: 'application/x-xpinstall'
            })

            # point update.rdf to the right place
            release = github.repos.releases.list(@config.github.user, @config.github.repo).detect{|rel| rel.name == 'update.rdf' }

            ## Remove any existing assets
            github.repos.releases.assets.list(@config.github.user, @config.github.repo, release.id){ |asset|
              github.repos.releases.assets.delete(@config.github.user, @config.github.repo, asset.id)
            }

            update_rdf("https://github.com/#{@config.github.user}/#{@config.github.repo}/releases/download/#{self.release}/#{self.xpi}"){|update|
              # add update.rdf
              github.repos.releases.assets.upload(@config.github.user, @config.github.repo, release.id, update, {
                name: 'update.rdf',
                content_type: 'application/rdf+xml'
              })
            }
          end
        end
      end

      def sign
        return if ENV['SIGN'] == 'false'
        return unless @config.amo && @config.amo.issuer && @config.amo.secret
        issuer = ENV[@config.amo.issuer]
        secret = ENV[@config.amo.secret]
        return unless issuer && secret

        token = lambda {
          payload = {
            jti: SecureRandom.base64,
            iss: issuer,
            iat: Time.now.utc.to_i,
            exp: Time.now.utc.to_i + 60,
          }
          return JWT.encode(payload, secret, 'HS256')
        }

        duration = lambda{|secs|
          secs = secs.to_i
          mins  = secs / 60
          hours = mins / 60
          days  = hours / 24

          if days > 0
            "#{days} days and #{hours % 24} hours"
          elsif hours > 0
            "#{hours} hours and #{mins % 60} minutes"
          elsif mins > 0
            "#{mins} minutes and #{secs % 60} seconds"
          elsif secs >= 0
            "#{secs} seconds"
          end
        }

        url = "https://addons.mozilla.org/api/v3/addons/#{self.id}/versions/#{self.version}/"

        wait = nil
        begin
          puts "Submit #{self.xpi} to #{url} for signing"
          RestClient.put(url, {upload: File.new(self.xpi)}, { 'Authorization' => "JWT #{token.call}", 'Content-Type' => 'multipart/form-data' })
          wait = Time.now.to_i
          sleep 10
        rescue RestClient::Conflict
          puts "#{self.xpi} already signed"
          wait = Time.now.to_i
        end

        status = {}
        (1..100).each{|attempt|
          status = JSON.parse(RestClient.get(url, { 'Authorization' => "JWT #{token.call}"} ).to_s)
          files = (status['files'] || []).length
          signed = (files > 0 ? status['files'][0]['signed'] : false)
          puts "attempt #{attempt} after #{duration.call(Time.now.to_i - wait)}, #{files} files, signed: #{signed}"
          break if signed
          sleep 5
        }

        raise "Unexpected response: #{status['files'].inspect}" if !status['files'] || status['files'].length != 1 || !status['files'][0]['download_url']
        raise "Not signed: #{status['files'][0].inspect}" unless status['files'][0]['signed']

        puts "\ngetting signed XPI from #{status['files'][0]['download_url']}"
        File.open(self.xpi, 'wb'){|f|
          f.write(RestClient.get(status['files'][0]['download_url'], { 'Authorization' => "JWT #{token.call}"} ).body)
        }
      end

      def getxpis
        return if ENV['OFFLINE'].to_s.downcase == 'true'
        return unless @config.test && @config.test.xpis && @config.test.xpis.install

        dir = File.expand_path(@config.test.xpis.install)
        FileUtils.mkdir_p(dir)
        installed = Dir["#{dir}/*.xpi"].collect{|f| File.basename(f) }

        sources = (@config.test.xpis.download || []).collect{|s| resolvexpi(s) }

        (installed - sources.collect{|s| s.xpi}).each{|xpi|
          STDERR.puts "Removing #{xpi}"
          File.unlink("#{dir}/#{xpi}")
        }
        sources.reject{|s| installed.include?(s.xpi) && s.url !~ /^file:/ }.each{|s|
          # https://github.com/zotero/zotero/zipball/master for zotero master
          if s.xpi =~ /(.*)-master-.*.xpi$/
            src = $1
            tgt = "#{dir}/#{s.xpi}"
            STDERR.puts "Zipping #{s.xpi} to #{tgt}"
            Dir.chdir(src){|path|
              Zip::File.open(tgt, 'w') do |zipfile|
                Dir["**/*"].sort.each{|file|
                  zipfile.add(file, file)
                }
              end
            }
          else
            STDERR.puts "Downloading #{s.xpi}"
            download(s.url, "#{dir}/#{s.xpi}")
          end
        }
      end

      def resolvexpi(source)
        STDERR.puts "Resolving #{source}"

        xpi = nil

        if source =~ /update\.rdf$/
          update_rdf = Nokogiri::XML(open(source))
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
        elsif source =~ /^https:\/\/github\.com\/zotero\/([^\/]+)\/zipball\/master$/
          url = source
          src = $1
          Dir.chdir(src) {
            rev = `git log -n 1 --pretty=format:"%h"`
            xpi = "#{src}-master-#{rev}.xpi"
          }
        elsif source =~ /^file:/ || source =~ /\.xpi(\?|$)/
          url = source
        else
          throw "Unsupported XPI source #{source}"
        end

        xpi ||= url.sub(/.*\//, '').sub(/\?.*$/, '')
        STDERR.puts "Resolved to #{url}"
        return OpenStruct.new(url: url, xpi: xpi)
      end

    end
  end
end

XPI = Rake::XPI::Config.new
NODEBIN="node_modules/.bin"

task :default => XPI.xpi do
end

file XPI.xpi => XPI.files do |t|
  STDERR.puts "Building #{t.name}"
  Dir["*.xpi"].each{|f| File.unlink(f) }

  Zip::File.open(t.name, 'w') do |zipfile|
    t.sources.sort.each{|src|
      case File.basename(src)
      when 'install.rdf'
        install_rdf = Nokogiri::XML(File.open(src))
        install_rdf.at('//em:version').content = XPI.version

        if XPI.bintray
          install_rdf.at('//em:updateURL').content = "https://bintray.com/artifact/download/#{XPI.bintray.organization}/#{XPI.bintray.repo}/#{XPI.bintray.package}/update.rdf"
        elsif XPI.github
          install_rdf.at('//em:updateURL').content = "https://github.com/#{XPI.github.user}/#{XPI.github.repo}/releases/download/update.rdf/update.rdf"
        else
          raise "No deployment platform specified"
        end
        zipfile.get_output_stream(src){|f| install_rdf.write_xml_to f }
      else
        zipfile.add(src, src)
      end
    }
  end

  begin
    XPI.sign
  rescue => e
    FileUtils.rm_f(XPI.xpi)
    raise e
  end
end

rule '.js' => '.pegjs' do |t|
  sh "#{NODEBIN}/pegjs -e #{File.basename(t.source, File.extname(t.source))} #{t.source.shellescape} #{t.name.shellescape}"
end

task :npm do
  sh "npm install --save coffee-script coffeelint pegjs"
end

rule '.js' => '.coffee' do |t|
  sh "#{NODEBIN}/coffeelint #{t.source.shellescape}"
  sh "#{NODEBIN}/coffee -bc #{t.source.shellescape}"
end

task :bump, :level do |t, args|
  modified = `git ls-files -m`.split(/\n/).reject{|f| f == 'www' || f == 'wiki'}
  throw "#{modified.length} modified files not checked in" unless modified.length == 0
  XPI.bump(args[:level])

  sh "git add install.rdf"
  sh "git commit -m #{XPI.release_message.shellescape}"
  sh "git tag #{XPI.release.shellescape}"
end

task :publish => XPI.xpi do
  XPI.publish
end
