local module = {}

function module.tablelength(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

math.randomseed(os.clock()^5)
function module.random_id(length)
  local id = ''
  for i = 1, length do
    id = id .. string.char(math.random(97, 122))
  end
  return id
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
  return (s:gsub("^%s*(.-)%s*$", "%1"))
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

return module
