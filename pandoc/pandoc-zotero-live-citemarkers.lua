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

-- local pl = require('pl.pretty') -- for pl.pretty.dump
local json = require('lunajson')
local csl_locator = require('locator')

local function collect(tbl)
  if not tbl then return nil end

  local t = ''
  for k, v in pairs(tbl) do
    if v.t == 'Str' then
      t = t .. v.text
    elseif v.t == 'Space' then
      t = t .. ' '
    else
      error('cannot collect ' .. v.t, 1)
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

local zotero = {
  bibliography = 'http://127.0.0.1:23119/better-bibtex/library?/1/library',
  scannable_cite = false
}

function Meta(meta)
  if meta.zotero_bibliography then
    meta.zotero.bibliography = meta.zotero_bibliography
  elseif meta.zotero and meta.zotero.bibliography then
    zotero.bibliography = collect(meta.zotero.bibliography)
  end

  if not string.match(zotero.bibliography, '^http://127%.0%.0%.1:2[34]119/better%-bibtex/') and not string.match(zotero.bibliography, '^http://localhost:2[34]119/better%-bibtex/') then
    error(zotero.bibliography .. ' does not look like a Zotero bibliography url', 1)
  end
  if zotero.bibliography:find('%.j.on$') then
    zotero.bibliography = zotero.bibliography:sub(1, -6)
  end

  if type(meta.zotero_scannable_cite) == 'string' then
    if meta.zotero_scannable_cite == 'true' then
      zotero.scannable_cite = true
    elseif meta.zotero_scannable_cite == 'false' then
      zotero.scannable_cite = false
    else
      error('scannable-cite expects true or false, got ' .. meta.zotero_scannable_cite, 1)
    end
  elseif type(meta.zotero_scannable_cite) == 'boolean' then
    zotero.scannable_cite = meta.zotero_scannable_cite
  elseif meta.zotero and type(meta.zotero['scannable-cite']) ~= 'nil' then
    if type(meta.zotero['scannable-cite']) ~= 'boolean' then
      error('scannable-cite expects a boolean', 1)
    end

    zotero.scannable_cite = meta.zotero['scannable-cite']
  end
  
  if string.match(FORMAT, 'docx') then
    zotero.format = 'docx'
  elseif string.match(FORMAT, 'odt') and zotero.scannable_cite then
    zotero.format = 'scannable-cite'
    csl_locator.short_labels()
  elseif string.match(FORMAT, 'odt') then
    zotero.format = 'odt'
  end
end

function Inlines(inlines)
  if not zotero.format then return inlines end

  for k, v in pairs(inlines) do
    if v.t == 'Cite' then
      if zotero.format == 'scannable-cite' then
        inlines[k] = scannable_cite(v)
      else
        inlines[k] = zotero_ref(v)
      end
    end
  end

  return inlines
end

math.randomseed(os.clock()^5)
function cite_id(length)
  local id = ''
  for i = 1, length do
    id = id .. string.char(math.random(97, 122))
  end
  return id
end

function xmlescape(str)
  return string.gsub(str, '["<>&]', { ['&'] = '&amp;', ['<'] = '&lt;', ['>'] = '&gt;', ['"'] = '&quot;' })
end

function trim(s)
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local state = {
  reported = {}
}

function zotero_ref(cite)
  if not state.bib then
    local mt, contents = pandoc.mediabag.fetch(zotero.bibliography .. '.json&pandocFilterData=true', '.')
    state.bib = json.decode(contents)
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
    if item.mode == 'AuthorInText' then -- not supported in Zotero
      return cite
    end

    if not state.bib[item.id] then
      if not state.reported[item.id] then print('@' .. item.id .. ' not found in Zotero') end
      state.reported[item.id] = true
      return cite
    end

    local itemData = deepcopy(state.bib[item.id].item)
    if item.mode == 'SuppressAuthor' then
      itemData['suppress-author'] = true
    end
    itemData.prefix = collect(item.prefix)
    local label, locator, suffix = csl_locator.parse(collect(item.suffix))
    itemData.suffix = suffix
    itemData.label = label
    itemData.locator = locator

    if state.bib[item.id].duplicate then
      if not state.reported[item.id] then print(item.id .. ' appears more than once in the library') end
      state.reported[item.id] = true
    end

    table.insert(csl.citationItems, {
      id = state.bib[item.id].zotero.itemID,
      uris = { state.bib[item.id].zotero.uri },
      uri = { state.bib[item.id].zotero.uri },
      itemData = itemData
    })
  end

  if zotero.format == 'docx' then
    local field = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">'
    field = field .. ' ADDIN ZOTERO_ITEM CSL_CITATION ' .. xmlescape(json.encode(csl)) .. '   '
    field = field .. '</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:t>'
    field = field .. xmlescape('<open Zotero document preferences: ' .. collect(cite.content) .. '>')
    field = field .. '</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>'

    return pandoc.RawInline('openxml', field)
  else
    csl = 'ZOTERO_ITEM CSL_CITATION ' .. xmlescape(json.encode(csl)) .. ' RND' .. cite_id(10)
    local field = '<text:reference-mark-start text:name="' .. csl .. '"/>'
    field = field .. xmlescape('<open Zotero document preferences: ' .. collect(cite.content) .. '>')
    field = field .. '<text:reference-mark-end text:name="' .. csl .. '"/>'

    return pandoc.RawInline('opendocument', field)
  end
end

function scannable_cite(cite)
  if not state.uris then
    state.uris = {}
    local mt, contents = pandoc.mediabag.fetch(zotero.bibliography .. '.jzon', '.')
    for k, item in pairs(json.decode(contents).items) do
      state.uris[item.citationKey] = item.uri
    end
  end

  local citation = ''
  for k, item in pairs(cite.citations) do
    local uri = state.uris[item.id]
    if not uri then
      if not state.reported[item.id] then print('@' .. item.id .. ' not found in Zotero') end
      state.reported[item.id] = true
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

    local label, locator, suffix = csl_locator.parse(collect(item.suffix))
    if locator then
      locator = (label or 'p.') .. ' ' .. locator
    else
      locator = ''
    end
      
    citation = citation ..
      '{ ' .. (collect(item.prefix)  or '') ..
      ' | ' .. suppress .. trim(string.gsub(collect(cite.content) or '', '[|{}]', '')) ..
      ' | ' .. locator ..
      ' | ' .. (suffix or '') ..
      ' | ' .. (ug == 'groups' and 'zg:' or 'zu:') .. id .. ':' .. key .. ' }'
  end

  return pandoc.Str(citation)
end

return {
  { Meta = Meta },
  { Inlines = Inlines }
}
