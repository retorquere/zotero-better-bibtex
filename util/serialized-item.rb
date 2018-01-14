#!/usr/bin/env ruby

require 'sqlite3'

db = SQLite3::Database.new(File.expand_path("~/.BBTZ5TEST/zotero/zotero.sqlite"))

query = """
  SELECT distinct COALESCE(bf.fieldName, f.fieldName) as fieldName
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
  LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
  LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
  ORDER BY 1
"""

interface = ['export interface ISerializedItem {']
db.execute(query) do |row|
  interface << "  #{row[0]}: any"
end
interface << ''
%w{itemType dateModified dateAdded}.each{|field|
  interface << "  #{field}: string"
}
%w{notes tags}.each{|field|
  interface << "  #{field}: string[]"
}
%w{collections creators attachments}.each{|field|
  interface << "  #{field}: any[]"
}
%w{itemID multi}.each{|field|
  interface << "  #{field}: any"
}
interface << ''
%w{citekey cslType volumeTitle __type__}.each{|field|
  interface << "  #{field}: string"
}

interface << """  extraFields: { #{
  [ 
    'bibtex: { [key: string]: { name: string, type: string, value: any } }',
    'csl: { [key: string]: { name: string, type: string, value: any } }',
    'kv: { [key: string]: { name: string, type: string, value: string, raw?: boolean } }'
  ].join(', ')
} }"""
interface << '  arXiv: { eprint: string, source?: string, id: string, primaryClass?: string }'
interface << '}'
interface << ''

open('resource/serialized-item.ts', 'w'){|f| f.puts interface.join("\n") }
