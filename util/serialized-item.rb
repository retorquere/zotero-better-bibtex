#!/usr/bin/env ruby

require 'sqlite3'

db = SQLite3::Database.new(File.expand_path("~/.BBTZ5TEST/zotero/zotero.sqlite"))

query = """
  SELECT it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
  LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
  LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
  ORDER BY 2, 1, 3
"""

fields = {}
itemTypes = []
db.execute(query) do |row|
  typeName, fieldName, fieldAlias = *row

  itemTypes << typeName
  fields[fieldName] ||= { types: [], aliases: [] }
  fields[fieldName][:types] << typeName
  fields[fieldName][:aliases] << "#{typeName}.#{fieldAlias}" if fieldAlias
end

interface = ['interface ISerializedItem {']
fields.keys.sort.each{|fieldName|
  interface << "  #{fieldName}: any // [#{fields[fieldName][:types].uniq.sort.join(', ')}] #{fields[fieldName][:aliases].uniq.sort.join(', ')}".rstrip
}
interface << ''
itemTypes.uniq!
itemTypes.sort!
interface << "  itemType: string // " + itemTypes.join(', ')
%w{dateModified dateAdded}.each{|field|
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
%w{referenceType cslType cslVolumeTitle citekey}.each{|field|
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

open('resource/typings/serialized-item.d.ts', 'w'){|f| f.puts interface.join("\n") }
