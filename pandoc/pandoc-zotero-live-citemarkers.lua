--
-- bbt-to-live-doc
--
-- Copyright (c) 2020 Emiliano Heyns
--
-- Permission is hereby granted, free of charge, to any person obtaining a copy of
-- this software and associated documentation files (the "Software"), to deal in
-- the Software without restriction, including without limitation the rights to
-- use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
-- of the Software, and to permit persons to whom the Software is furnished to do
-- so, subject to the following conditions:
--
-- The above copyright notice and this permission notice shall be included in all
-- copies or substantial portions of the Software.
--
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
-- IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
-- AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
-- LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
-- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
-- SOFTWARE.
--

local pl = require('pl.pretty') -- for pl.pretty.dump
local json = require('lunajson')

local function collect(tbl)
  if not tbl then return nil end

  local t = ''
  for k, v in pairs(tbl) do
    if v.t == 'Str' then
      t = t .. v.text
    elseif v.t == 'Space' then
      t = t .. ' '
    else
      error(1, 'cannot collect ' .. v.t)
    end
  end

  if t == '' then
    return nil
  else
    return t
  end
end

function deepcopy(orig)
  local orig_type = type(orig)
  local copy
  if orig_type == 'table' then
    copy = {}
    for orig_key, orig_value in next, orig, nil do
      copy[deepcopy(orig_key)] = deepcopy(orig_value)
    end
    setmetatable(copy, deepcopy(getmetatable(orig)))
  else -- number, string, boolean, etc
    copy = orig
  end
  return copy
end

local zotero_bib_uri = 'http://127.0.0.1:23119/better-bibtex/library?/1/library'

function Meta(meta)
  if meta.zotero then
    zotero_bib_uri = meta.zotero
    if zotero_bib_uri:find('%.j.on$') then
      zotero_bib_uri = zotero_bib_uri:sub(1, -6)
    end
    print('zotero=' .. zotero_bib_uri)
  end
end

if FORMAT:match 'docx' then
  local bib = nil
  local reported = {}

  math.randomseed(os.clock()^5)
  function cite_id(length)
	  local id = ''
	  for i = 1, length do
		  id = id .. string.char(math.random(97, 122))
	  end
	  return id
  end
  -- local citationID = 1

  function xmlescape(str)
    return string.gsub(str, '["<>&]', { ['&'] = '&amp;', ['<'] = '&lt;', ['>'] = '&gt;', ['"'] = '&quot;' })
  end

  function zotero_ref(cite)
    if not bib then
      local mt, contents = pandoc.mediabag.fetch(zotero_bib_uri .. '.json&pandocFilterData=true', '.')
      bib = json.decode(contents)
    end

    local csl = {
      citationID = cite_id(8),
      properties = {
        formattedCitation = collect(cite.content),
        plainCitation = collect(cite.content),
        noteIndex = 0
      },
      citationItems = {},
      schema = "https://github.com/citation-style-language/schema/raw/master/csl-citation.json"
    }
    for k, item in pairs(cite.citations) do
      print('prefix')
      pl.dump(item.prefix)
      print('suffix')
      pl.dump(item.suffix)
      if not bib[item.id] then
        if not reported[item.id] then print('@' .. item.id .. ' not found in Zotero') end
        reported[item.id] = true
        return cite
      end

      -- TODO: locator and label are not parsed by pandoc but by pandoc-citeproc
      local itemData = deepcopy(bib[item.id].item)
      itemData.prefix = collect(item.prefix)
      itemData.suffix = collect(item.suffix)
--[[      if itemData.suffix then
            article: 'art.',
    chapter: 'ch.',
    subchapter: 'subch.',
    column: 'col.',
    figure: 'fig.',
    line: 'l.',
    note: 'n.',
    issue: 'no.',
    opus: 'op.',
    page: 'p.',
    paragraph: 'para.',
    subparagraph: 'subpara.',
    part: 'pt.',
    rule: 'r.',
    section: 'sec.',
    subsection: 'subsec.',
    Section: 'Sec.',
    'sub verbo': 'sv.',
    schedule: 'sch.',
    title: 'tit.',
    verse: 'vrs.',
    volume: 'vol.',

      end --]]
      if item.mode == 'SuppressAuthor' then
        itemData['suppress-author'] = true
      elseif item.mode == 'AuthorInText' then
        return cite
      end

      if bib[item.id].duplicate then
        if not reported[item.id] then print(item.id .. ' appears more than once in the library') end
        reported[item.id] = true
      end

      table.insert(csl.citationItems, {
        id = bib[item.id].zotero.itemID,
        uris = { bib[item.id].zotero.uri },
        uri = { bib[item.id].zotero.uri },
        itemData = itemData
      })
    end


    local field = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">'
    field = field .. ' ADDIN ZOTERO_ITEM CSL_CITATION ' .. xmlescape(json.encode(csl)) .. '   '
    field = field .. '</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:t>'
    field = field .. xmlescape('<refresh: ' .. collect(cite.content) .. '>')
    field = field .. '</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>'

    return pandoc.RawInline('openxml', field)
  end

  function Inlines(inlines)
    for k, v in pairs(inlines) do
      if v.t == 'Cite' then
        inlines[k] = zotero_ref(v)
      end
    end
    return inlines
  end
end

if FORMAT:match 'odt' then
  local uris = nil

  function trim(s)
    return (s:gsub("^%s*(.-)%s*$", "%1"))
  end

  function scannable_cite(cite)
    if not uris then
      local mt, contents = pandoc.mediabag.fetch(zotero_bib_uri .. '.jzon', '.')
      uris = {}
      for k, item in pairs(json.decode(contents).items) do
        uris[item.citationKey] = item.uri
      end
    end

    -- {"citations":[{"prefix":[{"text":"see"}],"id":"doe99","suffix":[{"text":","},[],{"text":"pp. 33-35"}],"note_num":0,"mode":"NormalCitation","hash":0},{"prefix":[{"text":"also"}],"id":"smith04","suffix":[{"text":","},[],{"text":"ch. 1"}],"note_num":0,"mode":"NormalCitation","hash":0}],"content":[{"text":"[see"},[],{"text":"@doe99,"},[],{"text":"pp."},[],{"text":"33-35;"},[],{"text":"also"},[],{"text":"@smith04,"},[],{"text":"ch."},[],{"text":"1]"}]}
    local citation = ''
    for k, item in pairs(cite.citations) do
      local uri = uris[item.id]
      if not uri then
        return cite
      end

      local suppress = (item.mode == 'SuppressAuthor' and '-' or '')
      local s, e, ug, id, key
      s, e, key = string.find(uri, 'http://zotero.org/users/local/%w+/items/(%w+)')
      if key then
        ug = 'users'
        id = '0'
      else
        s, e, ug, id, key = string.find(uri, 'http://zotero.org/(%w+)/(%w+)/items/(%w+)')
      end

      citation = citation ..
        '{ ' .. (collect(item.prefix)  or '') ..
        ' | ' .. suppress .. trim(string.gsub(collect(cite.content) or '', '[|{}]', '')) ..
        ' | ' .. -- (item.locator or '') ..
        ' | ' .. (collect(item.suffix) or '') ..
        ' | ' .. (ug == 'groups' and 'zg:' or 'zu:') .. id .. ':' .. key .. ' }'
    end

    return pandoc.Str(citation)
  end

  function Inlines(inlines)
    for k, v in pairs(inlines) do
      if v.t == 'Cite' then
        inlines[k] = scannable_cite(v)
      end
    end
    return inlines
  end
end

return {
  { Meta = Meta },
  { Inlines = Inlines }
}
