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
local utils = require('utils')
local zotero = require('zotero')

-- -- global state -- --
local config = {
  client = 'zotero',
  scannable_cite = false,
  csl_style = nil, -- more to document than anything else -- Lua does not store nils in tables
  format = nil, -- more to document than anything else -- Lua does not store nils in tables
  transferable = false
}

-- -- -- bibliography marker generator -- -- --
function zotero_docpreferences_odt(csl_style)
  return string.format(
    '<data data-version="3" zotero-version="5.0.89">'
      .. '   <session id="OGe1IYVe"/>'
      .. '   <style id="http://www.zotero.org/styles/%s" locale="en-US" hasBibliography="1" bibliographyStyleHasBeenSet="0"/>'
      .. '   <prefs>'
      .. '     <pref name="fieldType" value="ReferenceMark"/>'
    -- .. '     <pref name="delayCitationUpdates" value="true"/>'
      .. '   </prefs>'
      .. '</data>',
    csl_style)
end

local function zotero_bibl_odt_banner()
  if not (config.format == 'odt' and config.csl_style and config.transferable) then
    error('zotero_bibl_odt_banner: This should not happen')
  end

  local banner = ''
    .. '<text:p text:style-name="Bibliography_20_1">'
    .. 'ZOTERO_TRANSFER_DOCUMENT'
    .. '</text:p>'
    .. '<text:p text:style-name="Bibliography_20_1">'
    .. 'The Zotero citations in this document have been converted to a format'
    .. 'that can be safely transferred between word processors. Open this'
    .. 'document in a supported word processor and press Refresh in the ' .. config.client
    .. 'plugin to continue working with the citations.'
    .. '</text:p>'

  local doc_preferences = ''
    .. '<text:p text:style-name="Text_20_body">'
    .. '<text:a xlink:type="simple" xlink:href="https://www.zotero.org/" text:style-name="Internet_20_link">'
    .. 'DOCUMENT_PREFERENCES '
    .. utils.xmlescape(zotero_docpreferences_odt(config.csl_style))
    .. '</text:a>'
    .. '</text:p>'

  return banner .. doc_preferences
end

local function zotero_bibl_odt()
  if config.format ~= 'odt' or not config.csl_style then
    error('zotero_bibl_odt: This should not happen')
  end

  local message = '<Bibliography: Do ' .. config.client .. ' Refresh>'
  local bib_settings = '{"uncited":[],"omitted":[],"custom":[]}'

  if config.transferable then
    return
      '<text:p text:style-name="Text_20_body">'
      .. '<text:a xlink:type="simple" xlink:href="https://www.zotero.org/" text:style-name="Internet_20_link">'
      .. 'BIBL '
      .. utils.xmlescape(bib_settings)
      .. ' '
      .. 'CSL_BIBLIOGRAPHY'
      .. '</text:a>'
      .. '</text:p>'

  end

  return string.format(
    '<text:section text:name=" %s">'
      .. '<text:p text:style-name="Bibliography_20_1">'
      .. utils.xmlescape(message)
      .. '</text:p>'
      ..'</text:section>',
    'ZOTERO_BIBL ' .. utils.xmlescape(bib_settings) .. ' CSL_BIBLIOGRAPHY' .. ' RND' .. utils.random_id(10))
end

-- -- -- citation market generators -- -- --
local function zotero_ref(cite)
  local content = pandoc.utils.stringify(cite.content)
  local csl = {
    citationID = utils.random_id(8),
    properties = {
      formattedCitation = content,
      plainCitation = nil, -- effectively the same as not including this like -- keep an eye on whether Zotero is OK with this missing. Maybe switch to a library that allows json.null
      -- dontUpdate = false,
      noteIndex = 0
    },
    citationItems = {},
    schema = "https://github.com/citation-style-language/schema/raw/master/csl-citation.json"
  }
  local author_in_text = ''

  for k, item in pairs(cite.citations) do
    local itemData, zoteroData = zotero.get(item.id)
    if itemData == nil then
      return cite
    end

    local citation = {
      id = zoteroData.itemID,
      uris = { zoteroData.uri },
      uri = { zoteroData.uri },
      itemData = itemData,
    }

    if item.mode == 'AuthorInText' then -- not formally supported in Zotero
      if config.author_in_text then
        local authors = zotero.authors(itemData)
        if authors == nil then
          return cite
        else
          author_in_text = pandoc.utils.stringify(pandoc.Str(authors)) .. ' '
          citation['suppress-author'] = true
        end
      else
        return cite
      end
    end

    if item.mode == 'SuppressAuthor' then
      citation['suppress-author'] = true
    end
    citation.prefix = pandoc.utils.stringify(item.prefix)
    local label, locator, suffix = csl_locator.parse(pandoc.utils.stringify(item.suffix))
    citation.suffix = suffix
    citation.label = label
    citation.locator = locator

    table.insert(csl.citationItems, citation)
  end

  local message = '<Do Zotero Refresh: ' .. content .. '>'

  if config.format == 'docx' then
    local field = author_in_text .. '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">'
    field = field .. ' ADDIN ZOTERO_ITEM CSL_CITATION ' .. utils.xmlescape(json.encode(csl)) .. '   '
    field = field .. '</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:noProof/></w:rPr><w:t>'
    field = field .. utils.xmlescape(message)
    field = field .. '</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r>'

    return pandoc.RawInline('openxml', field)
  else
    if config.transferable then
      local field = author_in_text
        .. '<text:a xlink:type="simple" xlink:href="https://www.zotero.org/" text:style-name="Internet_20_link">'
        .. 'ITEM CSL_CITATION '
        .. utils.xmlescape(json.encode(csl))
        .. '</text:a>'
      return pandoc.RawInline('opendocument', field)
    end

    csl = 'ZOTERO_ITEM CSL_CITATION ' .. utils.xmlescape(json.encode(csl)) .. ' RND' .. utils.random_id(10)
    local field = author_in_text .. '<text:reference-mark-start text:name="' .. csl .. '"/>'
    field = field .. utils.xmlescape(message)
    field = field .. '<text:reference-mark-end text:name="' .. csl .. '"/>'

    return pandoc.RawInline('opendocument', field)
  end
end

local function scannable_cite(cite)
  local citations = ''
  for k, item in pairs(cite.citations) do
    citation = zotero.get(item.id)
    if citation == nil then
      return cite
    end

    if item.mode == 'AuthorInText' then -- not formally supported in Zotero
      if config.author_in_text then
        local authors = zotero.authors(citation)
        if authors == nil then
          return cite
        else
          return pandoc.Str(authors)
        end
      else
        return cite
      end
    end

    local suppress = (item.mode == 'SuppressAuthor' and '-' or '')
    local s, e, ug, id, key
    s, e, key = string.find(citation.uri, 'http://zotero.org/users/local/%w+/items/(%w+)')
    if key then
      ug = 'users'
      id = '0'
    else
      s, e, ug, id, key = string.find(citation.uri, 'http://zotero.org/(%w+)/(%w+)/items/(%w+)')
    end

    local label, locator, suffix = csl_locator.parse(pandoc.utils.stringify(item.suffix))
    if locator then
      locator = (label or 'p.') .. ' ' .. locator
    else
      locator = ''
    end

    citations = citations ..
      '{ ' .. (pandoc.utils.stringify(item.prefix) or '') ..
      ' | ' .. suppress .. utils.trim(string.gsub(pandoc.utils.stringify(cite.content) or '', '[|{}]', '')) ..
      ' | ' .. locator ..
      ' | ' .. (suffix or '') ..
      ' | ' .. (ug == 'groups' and 'zg:' or 'zu:') .. id .. ':' .. key .. ' }'
  end

  return pandoc.Str(citations)
end

-- -- -- get config -- -- --
local function test_enum(k, v, values)
  for _, valid in ipairs(values) do
    if type(v) ~= type(valid) then
      error(k .. ' expects an ' .. type(valid) .. ', got an ' .. type(v))
    end

    if v == valid then return v end
  end

  error(k .. ' expects one of ' .. table.concat(values, ', ') .. ', got ' .. v)
end
local function test_boolean(k, v)
  if type(v) == 'boolean' then
    return v
  elseif type(v) == 'nil' then
    return false
  end
  return (test_enum(k, v, {'true', 'false'}) == 'true')
end

function Meta(meta)
  -- create meta.zotero if it does not exist
  if not meta.zotero then
    meta.zotero = {}
  end

  -- copy meta.zotero_<key>, which are likely command line params and take precedence, over to meta.zotero
  for k, v in pairs(meta) do
    local s, e, key = string.find(k, '^zotero[-_](.*)')
    if key then
      meta.zotero[key:gsub('_', '-')] = v
    end
  end

  -- normalize values
  for k, v in pairs(meta.zotero) do
    meta.zotero[k] = pandoc.utils.stringify(v)
  end

  config.scannable_cite = test_boolean('scannable-cite', meta.zotero['scannable-cite'])
  config.author_in_text = test_boolean('author-in-text', meta.zotero['author-in-text'])

  if meta.zotero['csl-style'] ~= nil then
    config.csl_style = pandoc.utils.stringify(meta.zotero['csl-style'])
  end

  config.transferable = test_boolean('transferable', meta.zotero['transferable'])

  -- refuse to create a transferable document, when csl style is not specified
  if config.transferable and not config.csl_style then
    error('Transferable documents need a CSL style')
  end
  if config.transferable and not config.scannable_cite then
    error('Scannable-cite documents are not transferable')
  end

  if type(meta.zotero.client) == 'nil' then -- should never happen as the default is 'zotero'
    meta.zotero.client = 'zotero'
  else
    test_enum('client', meta.zotero.client, {'zotero', 'jurism'})
  end
  config.client = meta.zotero.client

  if config.client == 'zotero' then
    zotero.url = 'http://127.0.0.1:23119/better-bibtex/export/item?pandocFilterData=true'
  elseif config.client == 'jurism' then
    zotero.url = 'http://127.0.0.1:24119/better-bibtex/export/item?pandocFilterData=true'
  end

  if string.match(FORMAT, 'odt') and config.scannable_cite then
    -- scannable-cite takes precedence over csl-style
    config.format = 'scannable-cite'
    zotero.url = zotero.url .. '&translator=jzon'
    csl_locator.short_labels()
  elseif string.match(FORMAT, 'odt') or string.match(FORMAT, 'docx') then
    config.format = FORMAT
    zotero.url = zotero.url .. '&translator=json'
  end

  if type(meta.zotero.library) ~= 'nil' then
    zotero.url = zotero.url .. '&library=' .. utils.urlencode(meta.zotero.library)
  end

  zotero.url = zotero.url .. '&citationKeys='

  if config.format == 'odt' and config.csl_style then
    -- These will be added to the document metadata by pandoc automatically
    meta.ZOTERO_PREF_1 = zotero_docpreferences_odt(config.csl_style)
    meta.ZOTERO_PREF_2 = ''
  end

  return meta
end

-- -- -- replace citations -- -- --
function Cite_collect(cite)
  if not config.format then return nil end

  for _, item in pairs(cite.citations) do
    zotero.citekeys[item.id] = true
  end

  return nil
end

function Cite_replace(cite)
  if not config.format then return nil end

  if config.format == 'scannable-cite' then
    return scannable_cite(cite)
  else
    return zotero_ref(cite)
  end
end

local refsDivSeen=false
function Div(div)
  if not div.attr or div.attr.identifier ~= 'refs' then return nil end
  if config.format ~= 'odt' or not config.csl_style then return nil end

  refsDivSeen=true
  return pandoc.RawBlock('opendocument', zotero_bibl_odt())
end

function Doc(doc)
  if config.format ~= 'odt' then return nil end

  if config.transferable then
    table.insert(doc.blocks, 1, pandoc.RawBlock('opendocument', zotero_bibl_odt_banner()))
  end

  if config.csl_style and not refsDivSeen then
    table.insert(doc.blocks, pandoc.RawBlock('opendocument', zotero_bibl_odt()))
  end

  return pandoc.Pandoc(doc.blocks, doc.meta)
end

return {
  { Meta = Meta },
  { Cite = Cite_collect },
  { Cite = Cite_replace },
  { Div = Div },
  { Doc = Doc },
}
