#!/usr/bin/env ruby

require 'httparty'

response = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", {
  headers: { 'Content-Type' => 'text/plain' },
  body: File.read(ARGV[0]),
})

puts response.code

puts response.body
