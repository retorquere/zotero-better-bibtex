#!/usr/bin/env ruby

require 'bindata'
require 'socket'
require 'json'

class ZoteroMsg < BinData::Record
  endian :big
  uint32 :s
  uint32 :len
  string :msg, :read_length => :len
end


class Zotero
  def initialize
    @zotero = TCPSocket.new('127.0.0.1', 23116)
    @session = 0
    @docID = 1
    @fieldID = 2
    @docData = '''<data data-version="3" zotero-version="5.0.12">
      <session id="Z9Tp8PjG"/>
      <style
        id="http://www.zotero.org/styles/chicago-note-bibliography"
        locale="en-US"
        hasBibliography="1"
        bibliographyStyleHasBeenSet="0"
      />
      <prefs>
        <pref name="fieldType" value="Bookmark"/>
        <pref name="automaticJournalAbbreviations" value="true"/>
        <pref name="noteType" value="1"/>
      </prefs>
    </data>'''

    send('addCitation')
    while true
      cmd, args = *receive
      case cmd
        when 'Application_getActiveDocument'
          @api = args.first
          send([@api, @docID])

        when 'Document_getDocumentData'
          send(@docData)

        when 'Document_setDocumentData'
          send(nil)

        when 'Document_canInsertField'
          send(true)

        when 'Document_cursorInField'
          send(nil)

        when 'Document_insertField'
          #send([@docID, 'ReferenceMark', 0])
          send([@fieldID, '', 0])

        when 'Field_setCode'
          fieldCode = args.last
          if fieldCode =~ /^ITEM CSL_CITATION ({.*})/
            @reference = JSON.parse($1)
            puts JSON.pretty_generate(@reference)
            @fieldCode = nil
          else
            @fieldCode = fieldCode
          end
          send(nil)

        when 'Document_getFields'
          send([[@fieldID],[@fieldCode],[0]])

        when 'Field_setText'
          send(nil)

        when 'Field_getText'
          send('[1]')

        when 'Document_activate'
          send(nil)

        when 'Document_complete'
          send(nil)
          @zotero.close
          break

        when 'Field_delete'
          # document, fieldID
          send(nil)

        else
          raise cmd
      end
    end
  end

  def send(payload)
    payload = payload.to_json
    puts ">> #{payload}"
    message = ZoteroMsg.new(s: @session, len: payload.length, msg: payload)
    @zotero.write(message.to_binary_s)
  end

  def receive
    response = ZoteroMsg.read(@zotero)
    @session = response.s
    puts "<< #{response.msg}"
    return JSON.parse(response.msg)
  end
end

zotero = Zotero.new

#{
#  "citationID": "W5117IPo",
#  "properties": {
#    "formattedCitation": "{\\rtf pre {\\i{}Citations, Out of the Box}, 12 post; Africa News, \\uc0\\u8220{}Bugreports_YearSuffixInHarvard1,\\uc0\\u8221{} bk. 11.}",
#    "plainCitation": "[1]"
#  },
#  "citationItems": [
#    {
#      "id": 6,
#      "uris": [
#        "http://zotero.org/users/local/Nywl04ll/items/ICWTSREC"
#      ],
#      "uri": [
#        "http://zotero.org/users/local/Nywl04ll/items/ICWTSREC"
#      ],
#      "itemData": {
#        "id": 6,
#        "type": "book",
#        "title": "Citations, Out of the Box",
#        "publisher": "CreateSpace Independent Publishing Platform",
#        "publisher-place": "Lexington Kentucky",
#        "number-of-pages": "137",
#        "event-place": "Lexington Kentucky",
#        "abstract": "bibtex*:bennett_citations_2013",
#        "ISBN": "978-1-4793-4771-1",
#        "author": [
#          {
#            "family": "Bennett",
#            "given": "Frank G.",
#            "comma-suffix": true,
#            "suffix": "Jr."
#          }
#        ],
#        "issued": {
#          "date-parts": [
#            [
#              "2013"
#            ]
#          ]
#        }
#      },
#      "locator": "12",
#      "suppress-author": true,
#      "prefix": "pre",
#      "suffix": "post"
#    },
#    {
#      "id": 15,
#      "uris": [
#        "http://zotero.org/users/local/Nywl04ll/items/VQ2CP22W"
#      ],
#      "uri": [
#        "http://zotero.org/users/local/Nywl04ll/items/VQ2CP22W"
#      ],
#      "itemData": {
#        "id": 15,
#        "type": "article-journal",
#        "title": "bugreports_YearSuffixInHarvard1",
#        "abstract": "bibtex: bugreports_YearSuffixInHarvard1",
#        "author": [
#          {
#            "literal": "Africa News"
#          }
#        ]
#      },
#      "locator": "11",
#      "label": "book"
#    }
#  ],
#  "schema": "https://github.com/citation-style-language/schema/raw/master/csl-citation.json"
#}
#
