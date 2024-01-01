local module = {}

local utils = require('utils')
local json = require('lunajson')
-- local pl = require('pl.pretty') -- for pl.pretty.dump

local state = {
  reported = {},
}

module.citekeys = {}

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
    print('could not fetch Zotero items: ' .. response .. '(' .. body .. ')')
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
