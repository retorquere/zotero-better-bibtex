local module = {}

local utils = require('utils')
local json = require('lunajson')
-- local pl = require('pl.pretty') -- for pl.pretty.dump

local state = {
  reported = {},
}

module.citekeys = {}

function module.authors(csl_or_item)
  local authors = {}
  local author

  if csl_or_item.author ~= nil then
    for _, author in ipairs(csl_or_item.author) do
      if author.literal ~= nil then
        table.insert(authors, author.literal)
      elseif author.family ~= nil then
        table.insert(authors, author.family)
      end
    end

  elseif csl_or_item.creators ~= nil then
    for _, author in ipairs(csl_or_item.creators) do
      if author.name ~= nil then
        table.insert(authors, author.name)
      elseif author.lastName ~= nil then
        table.insert(authors, author.lastName)
      end
    end

  elseif csl_or_item.reporter ~= nil then
    table.insert(authors, csl_or_item.reporter)
  end

  if utils.tablelength(authors) == 0 then
    return nil
  end

  local last = table.remove(authors)
  if utils.tablelength(authors) == 0 then
    return last
  end
  authors = table.concat(authors, ', ')
  return table.concat({ authors, last }, ' and ')
end

local function load_items()
  if state.fetched ~= nil then
    return
  end

  state.fetched = {
    items = {},
    errors = {},
  }

  local citekeys = {}
  for k, _ in pairs(module.citekeys) do
    table.insert(citekeys, k)
  end

  if utils.tablelength(citekeys) == 0 then
    return
  end

  module.request.params.citekeys = citekeys
  local url = module.url .. utils.urlencode(json.encode(module.request))
  local mt, body = pandoc.mediabag.fetch(url, '.')
  local ok, response = pcall(json.decode, body)
  if not ok then
    print('could not fetch Zotero items: ' .. body)
    return
  end
  if response.error ~= nil then
    print('could not fetch Zotero items: ' .. response.error.message)
    return
  end
  state.fetched = response.result
end

function module.get(citekey)
  load_items()

  if state.reported[citekey] ~= nil then
    return nil
  end

  if state.fetched.errors[citekey] ~= nil then
    state.reported[citekey] = true
    if state.fetched.errors[citekey] == 0 then
      print('@' .. citekey .. ': not found')
    else
      print('@' .. citekey .. ': duplicates found')
    end
    return nil
  end

  if state.fetched.items[citekey] == nil then
    state.reported[citekey] = true
    print('@' .. citekey .. ' not in Zotero')
    return nil
  end

  return state.fetched.items[citekey]
end

return module
