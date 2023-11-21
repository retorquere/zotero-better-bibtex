local module = {}

function module.tablelength(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

module.id_number = 0
function module.next_id(length)
  module.id_number = module.id_number + 1
  return string.format(string.format('%%0%dd', length), module.id_number)
end

local function url_encode_char(chr)
  return string.format("%%%X",string.byte(chr))
end

function module.urlencode(str)
  local output, t = string.gsub(str,"[^%w]",url_encode_char)
  return output
end

function module.xmlescape(str)
  return string.gsub(str, '["<>&]', { ['&'] = '&amp;', ['<'] = '&lt;', ['>'] = '&gt;', ['"'] = '&quot;' })
end

function module.trim(s)
  return s:gsub("^%s*(.-)%s*$", "%1")
end

function module.deepcopy(orig)
  local orig_type = type(orig)
  local copy
  if orig_type == 'table' then
    copy = {}
    for orig_key, orig_value in next, orig, nil do
      copy[module.deepcopy(orig_key)] = module.deepcopy(orig_value)
    end
    setmetatable(copy, module.deepcopy(getmetatable(orig)))
  else -- number, string, boolean, etc
    copy = orig
  end
  return copy
end

function module.trim(s)
  if s == nil then
    return s
  end
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

return module
