local utils = require('utils')
local json = require('lunajson')

local url = 'http://127.0.0.1:23119/better-bibtex/json-rpc?'
local request = {
  jsonrpc = "2.0",
  method = "item.citationkey",
  params = {
  },
}

function citekey(itemKey)
  request.params.item_keys = { itemKey }
  local mt, body = pandoc.mediabag.fetch(url .. utils.urlencode(json.encode(request)))
  local ok, response = pcall(json.decode, body)
  if not ok then
    print('could not fetch Zotero items: ' .. response .. '(' .. body .. ')')
    return
  end
  if response.error ~= nil then
    print('could not fetch Zotero items: ' .. response.error.message)
    return
  end
  return response.result[itemKey]
end

function Cite(cite)
  for _, item in pairs(cite.citations) do
    item.id = citekey(item.id)
  end

  return cite
end

return {
  { Meta = Meta },
  { Cite = Cite },
}
