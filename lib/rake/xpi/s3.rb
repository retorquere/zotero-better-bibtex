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
        raise "S3 publishing not configured" unless @config.s3 && @config.s3.id && @config.s3.secret
        STDERR.puts "Publishing #{self.versioned_xpi} to S3"
        id = ENV[@config.s3.id]
        secret = ENV[@config.s3.secret]
        return false unless id && secret

        s3 = Aws::S3::Resource.new(region: @config.s3.region, credentials: Aws::Credentials.new(id, secret))
        bucket = s3.bucket(@config.s3.bucket)

        obj = bucket.object("#{release_build? ? @config.s3.prefix : 'builds'}/#{self.versioned_xpi}")
        obj.upload_file(self.xpi, content_type: 'application/x-xpinstall')
        if release_build?
          update_rdf("https://s3.#{@config.s3.region}.amazonaws.com/#{@config.s3.bucket}/#{@config.s3.prefix}/#{self.versioned_xpi}"){|update|
            obj = bucket.object("#{@config.s3.prefix}/update.rdf")
            obj.upload_file(update, content_type: 'application/rdf+xml')
          }
        end
      end
    end
  end
end

task :bucket, [:uploader, :id, :secret] do |t, args|
  id = args[:id] || ENV[XPI.s3.id]
  secret = args[:secret] || ENV[XPI.s3.secret]
  uploader = args[:uploader]

  s3 = Aws::S3::Resource.new(region: XPI.s3.region, credentials: Aws::Credentials.new(id, secret))
  bucket = s3.bucket(XPI.s3.bucket)
  bucket.create() unless bucket.exists?

  bucket.policy.put(policy: {
    "Version": "2012-10-17",
    "Id": "XPI downloads",
    "Statement": [
      {
        "Sid": "Stmt1435253907295",
        "Effect": "Allow",
        "Principal": { "AWS": uploader },
        "Action": "s3:*",
        "Resource": "arn:aws:s3:::#{XPI.s3.bucket}/*"
      },
      {
        "Sid": "PublicRead",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::#{XPI.s3.bucket}/*"
      }
    ]
  }.to_json)

  bucket.lifecycle.put(lifecycle_configuration: {
    rules: [
      {
        status: "Enabled",
        prefix: "builds/",
        expiration: { days: 7 },
        id: "cleanup-build"
      }
    ]
  })
end
