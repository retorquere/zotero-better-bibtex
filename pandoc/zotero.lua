local module = {}

local utils = require('utils')
local json = require('lunajson')
-- local pl = require('pl.pretty') -- for pl.pretty.dump

local state = {
  reported = {},
}

module.citekeys = {}

function module.authors(csl)
  if csl.author == nil then
    return nil
  end

  local authors = {}
  local author
  for _, author in ipairs(csl.author) do
    if author.literal ~= nil then
      table.insert(authors, author.literal)
    elseif author.family ~= nil then
      table.insert(authors, author.family)
    end
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

  citekeys = table.concat(citekeys, ',')
  local url = module.url .. utils.urlencode(citekeys)
  local mt, contents = pandoc.mediabag.fetch(url, '.')
  local ok, fetched = pcall(json.decode, contents)
  if not ok then
    print('could not fetch Zotero items: ' .. contents)
    return
  end
  state.fetched = fetched
end

function module.get(citekey)
  load_items()

  if state.reported[citekey] ~= nil then
    return nil
  end

  if state.fetched.errors[citekey] ~= nil then
    state.reported[citekey] = true
    print('@' .. citekey .. ': ' .. state.fetched.errors[citekey])
    return nil
  end

  if state.fetched.items[citekey] == nil then
    state.reported[citekey] = true
    print('@' .. citekey .. ' not in Zotero')
    return nil
  end

  return state.fetched.items[citekey], state.fetched.zotero[citekey]
end

return module
