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
