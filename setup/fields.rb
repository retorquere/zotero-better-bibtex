#!/usr/bin/env ruby

require 'sqlite3'
require 'liquid'
require 'dedent'
require 'json'
require 'facets'

clients = %w{zotero jurism}
valid = {}
simplify = {}
clients.each{|client|
  valid[client] = {}
  simplify[client] = []

  db = SQLite3::Database.new(File.join(File.dirname(__FILE__), "../test/fixtures/profile/#{client}/#{client}/#{client}.sqlite"))
  db.results_as_hash = true

  q = """
      SELECT DISTINCT bf.fieldName, f.fieldName as fieldAlias
      FROM itemTypes it
      JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
      JOIN fields f ON f.fieldID = itf.fieldID
      JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
      JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
      ORDER BY 1
  """

  aliases = {}
  db.execute(q).each{|field|
    fieldName = field['fieldName']
    fieldAlias = field['fieldAlias']

    # just to make sure
    raise "field alias #{fieldAlias} maps to #{aliases[fieldAlias]} and #{fieldName}" if aliases[fieldAlias] && aliases[fieldAlias] != fieldName
    aliases[fieldAlias] = fieldName

    simplify[client] << "if (typeof item.#{fieldAlias} != 'undefined') { item.#{fieldName} = item.#{fieldAlias}; delete item.#{fieldAlias}; }"
  }

  simplify[client] += """
    if (mode == 'export') {
      item.tags = item.tags ? item.tags.map(function(tag) { return tag.tag }) : [];
      item.notes = item.notes ? item.notes.map(function(note) { return note.note || note }) : [];
      item.relations = item.relations ? (item.relations['dc:relation'] || []) : []
      for (const att of item.attachments || []) {
        att.relations = att.relations ? (att.relations['dc:relation'] || []) : []
      }
    }

    if (item.creators) {
      // import & export translators expect different creator formats... nice
      for (const creator of item.creators) {
        if (mode == 'export' && creator.fieldMode == 1) {
          creator.name = creator.name || creator.lastName;
          delete creator.lastName
          delete creator.firstName;
          delete creator.fieldMode;

        } else if (mode == 'import' && creator.name) {
          creator.lastName = creator.lastName || creator.name;
          creator.fieldMode = 1;
          delete creator.firstName
          delete creator.name
        }
      }
    }
  """.unindent.split("\n")

  q = """
      SELECT it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
      FROM itemTypes it
      JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
      JOIN fields f ON f.fieldID = itf.fieldID
      LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
      LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
      ORDER BY 2
  """

  valid[client] = {
    note: {
      itemType: true,
      tags: true,
      note: true,
      id: true,
      itemID: true,
      dateAdded: true,
      dateModified: true,
    }
  }
  db.execute(q).each{|field|
    typeName = field['typeName']
    fieldName = field['fieldName']
    fieldAlias = field['fieldAlias']

    valid[client][typeName] ||= {
      itemType: true,
      creators: true,
      tags: true,
      attachments: true,
      notes: true,
      seeAlso: true,
      id: true,
      itemID: true,
      dateAdded: true,
      dateModified: true,
      multi: true, # accomodate Juris-M
    }

    valid[client][typeName][fieldName] = true
    valid[client][typeName][fieldAlias] = true if fieldAlias
  }
}

clients.each{|client|
  valid[client] = JSON.pretty_generate(valid[client]).indent(2).strip
}
fields = Liquid::Template.parse("""
declare const Zotero: any
{% for client in clients %}
const {{ client }} = {
  valid: {{ valid[client] }},

  simplify: (item, mode) => {
    {% for line in simplify[client] %}
    {{ line }}{% endfor %}
    return item;
  },
}
{% endfor %}
const fields = Zotero.BetterBibTeX.client() === 'zotero' ? zotero : jurism

export fields
""")

open(File.join(File.dirname(__FILE__), "../translators/lib/fields.ts"), 'w'){|f| 
  f.puts(fields.render('simplify' => simplify, 'valid' => valid, 'clients' => clients))
}
