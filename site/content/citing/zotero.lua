do

do
local _ENV = _ENV
package.preload[ "locator" ] = function( ... ) local arg = _G.arg;
local module = {}

local labels = {
  book = 'book',
  ['bk.'] = 'book',
  ['bks.'] = 'book',
  chapter = 'chapter',
  ['chap.'] = 'chapter',
  ['chaps.'] = 'chapter',
  column = 'column',
  ['col.'] = 'column',
  ['cols.'] = 'column',
  figure = 'figure',
  ['fig.'] = 'figure',
  ['figs.'] = 'figure',
  folio = 'folio',
  ['fol.'] = 'folio',
  ['fols.'] = 'folio',
  number = 'number',
  ['no.'] = 'number',
  ['nos.'] = 'number',
  line = 'line',
  ['l.'] = 'line',
  ['ll.'] = 'line',
  note = 'note',
  ['n.'] = 'note',
  ['nn.'] = 'note',
  opus = 'opus',
  ['op.'] = 'opus',
  ['opp.'] = 'opus',
  page = 'page',
  ['p.'] = 'page',
  ['pp.'] = 'page',
  paragraph = 'paragraph',
  ['para.'] = 'paragraph',
  ['paras.'] = 'paragraph',
  part = 'part',
  ['pt.'] = 'part',
  ['pts.'] = 'part',
  section = 'section',
  ['sec.'] = 'section',
  ['secs.'] = 'section',
  ['sub verbo'] = 'sub verbo',
  ['s.v.'] = 'sub verbo',
  ['s.vv.'] = 'sub verbo',
  verse = 'verse',
  ['v.'] = 'verse',
  ['vv.'] = 'verse',
  volume = 'volume',
  ['vol.'] = 'volume',
  ['vols.'] = 'volume'
}

local function get_label(locator)
  local s, e, label, remaining = string.find(locator, '^(%l+.?) *(.*)')
  if label and labels[label] then
    return labels[label], remaining
  else
    return 'page', locator
  end
end

local function parse(suffix)
  if not suffix then
    return nil, nil, suffix
  end

  local s, e, locator, label, remaining
  local _suffix = suffix

  s, e, locator = string.find(_suffix, '^{([^{}]+)}$')
  if locator then
    label, locator = get_label(locator)
    return label, locator, nil
  end

  local s, e, locator, remaining = string.find(_suffix, '^{([^{}]+)}, *(.*)')
  if locator then
    label, locator = get_label(locator)
    return label, locator, remaining
  end

  s, e, locator = string.find(_suffix, '^, *{([^{}]+)}$')
  if locator then
    label, locator = get_label(locator)
    return label, locator, nil
  end

  s, e, locator, remaining = string.find(_suffix, '^, *{([^{}]+)} *(.*)')
  if locator then
    label, locator = get_label(locator)
    return label, locator, remaining
  end

  if not string.find(_suffix, '^, .') then
    return nil, nil, suffix
  end

  s, e, label, remaining = string.find(_suffix, '^, *(%l+%.?) *(.*)')
  if label and labels[label] then
    label = labels[label]
    _suffix = ', ' .. remaining
  else
    label = 'page'
  end

  local _locator = ''
  local loc
  while true do
    s, e, loc, remaining = string.find(_suffix, '^(, *[^, ]+)(.*)')
    if loc then
      _locator = _locator .. loc
      _suffix = remaining
    else
      break
    end
  end

  if _locator ~= '' then
    if _suffix == '' then
      _suffix = nil
    end

    _locator = _locator:gsub('^, *', '')

    return label, _locator, _suffix
  end
    
  return nil, nil, suffix
end

function module.parse(suffix)
  label, locator, suffix = parse(suffix)
  if label == 'page' then
    label = nil
  end
  return label, locator, suffix
end

return module

end
end

do
local _ENV = _ENV
package.preload[ "lunajson" ] = function( ... ) local arg = _G.arg;
local newdecoder = require 'lunajson.decoder'
local newencoder = require 'lunajson.encoder'
local sax = require 'lunajson.sax'
-- If you need multiple contexts of decoder and/or encoder,
-- you can require lunajson.decoder and/or lunajson.encoder directly.
return {
	decode = newdecoder(),
	encode = newencoder(),
	newparser = sax.newparser,
	newfileparser = sax.newfileparser,
}

end
end

do
local _ENV = _ENV
package.preload[ "lunajson.decoder" ] = function( ... ) local arg = _G.arg;
local setmetatable, tonumber, tostring =
      setmetatable, tonumber, tostring
local floor, inf =
      math.floor, math.huge
local mininteger, tointeger =
      math.mininteger or nil, math.tointeger or nil
local byte, char, find, gsub, match, sub =
      string.byte, string.char, string.find, string.gsub, string.match, string.sub

local function _decode_error(pos, errmsg)
	error("parse error at " .. pos .. ": " .. errmsg, 2)
end

local f_str_ctrl_pat
if _VERSION == "Lua 5.1" then
	-- use the cluttered pattern because lua 5.1 does not handle \0 in a pattern correctly
	f_str_ctrl_pat = '[^\32-\255]'
else
	f_str_ctrl_pat = '[\0-\31]'
end

local _ENV = nil


local function newdecoder()
	local json, pos, nullv, arraylen, rec_depth

	-- `f` is the temporary for dispatcher[c] and
	-- the dummy for the first return value of `find`
	local dispatcher, f

	--[[
		Helper
	--]]
	local function decode_error(errmsg)
		return _decode_error(pos, errmsg)
	end

	--[[
		Invalid
	--]]
	local function f_err()
		decode_error('invalid value')
	end

	--[[
		Constants
	--]]
	-- null
	local function f_nul()
		if sub(json, pos, pos+2) == 'ull' then
			pos = pos+3
			return nullv
		end
		decode_error('invalid value')
	end

	-- false
	local function f_fls()
		if sub(json, pos, pos+3) == 'alse' then
			pos = pos+4
			return false
		end
		decode_error('invalid value')
	end

	-- true
	local function f_tru()
		if sub(json, pos, pos+2) == 'rue' then
			pos = pos+3
			return true
		end
		decode_error('invalid value')
	end

	--[[
		Numbers
		Conceptually, the longest prefix that matches to `[-+.0-9A-Za-z]+` (in regexp)
		is captured as a number and its conformance to the JSON spec is checked.
	--]]
	-- deal with non-standard locales
	local radixmark = match(tostring(0.5), '[^0-9]')
	local fixedtonumber = tonumber
	if radixmark ~= '.' then
		if find(radixmark, '%W') then
			radixmark = '%' .. radixmark
		end
		fixedtonumber = function(s)
			return tonumber(gsub(s, '.', radixmark))
		end
	end

	local function number_error()
		return decode_error('invalid number')
	end

	-- `0(\.[0-9]*)?([eE][+-]?[0-9]*)?`
	local function f_zro(mns)
		local num, c = match(json, '^(%.?[0-9]*)([-+.A-Za-z]?)', pos)  -- skipping 0

		if num == '' then
			if c == '' then
				if mns then
					return -0.0
				end
				return 0
			end

			if c == 'e' or c == 'E' then
				num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
				if c == '' then
					pos = pos + #num
					if mns then
						return -0.0
					end
					return 0.0
				end
			end
			number_error()
		end

		if byte(num) ~= 0x2E or byte(num, -1) == 0x2E then
			number_error()
		end

		if c ~= '' then
			if c == 'e' or c == 'E' then
				num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
			end
			if c ~= '' then
				number_error()
			end
		end

		pos = pos + #num
		c = fixedtonumber(num)

		if mns then
			c = -c
		end
		return c
	end

	-- `[1-9][0-9]*(\.[0-9]*)?([eE][+-]?[0-9]*)?`
	local function f_num(mns)
		pos = pos-1
		local num, c = match(json, '^([0-9]+%.?[0-9]*)([-+.A-Za-z]?)', pos)
		if byte(num, -1) == 0x2E then  -- error if ended with period
			number_error()
		end

		if c ~= '' then
			if c ~= 'e' and c ~= 'E' then
				number_error()
			end
			num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
			if not num or c ~= '' then
				number_error()
			end
		end

		pos = pos + #num
		c = fixedtonumber(num)

		if mns then
			c = -c
			if c == mininteger and not find(num, '[^0-9]') then
				c = mininteger
			end
		end
		return c
	end

	-- skip minus sign
	local function f_mns()
		local c = byte(json, pos)
		if c then
			pos = pos+1
			if c > 0x30 then
				if c < 0x3A then
					return f_num(true)
				end
			else
				if c > 0x2F then
					return f_zro(true)
				end
			end
		end
		decode_error('invalid number')
	end

	--[[
		Strings
	--]]
	local f_str_hextbl = {
		0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7,
		0x8, 0x9, inf, inf, inf, inf, inf, inf,
		inf, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF, inf,
		inf, inf, inf, inf, inf, inf, inf, inf,
		inf, inf, inf, inf, inf, inf, inf, inf,
		inf, inf, inf, inf, inf, inf, inf, inf,
		inf, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF,
		__index = function()
			return inf
		end
	}
	setmetatable(f_str_hextbl, f_str_hextbl)

	local f_str_escapetbl = {
		['"']  = '"',
		['\\'] = '\\',
		['/']  = '/',
		['b']  = '\b',
		['f']  = '\f',
		['n']  = '\n',
		['r']  = '\r',
		['t']  = '\t',
		__index = function()
			decode_error("invalid escape sequence")
		end
	}
	setmetatable(f_str_escapetbl, f_str_escapetbl)

	local function surrogate_first_error()
		return decode_error("1st surrogate pair byte not continued by 2nd")
	end

	local f_str_surrogate_prev = 0
	local function f_str_subst(ch, ucode)
		if ch == 'u' then
			local c1, c2, c3, c4, rest = byte(ucode, 1, 5)
			ucode = f_str_hextbl[c1-47] * 0x1000 +
			        f_str_hextbl[c2-47] * 0x100 +
			        f_str_hextbl[c3-47] * 0x10 +
			        f_str_hextbl[c4-47]
			if ucode ~= inf then
				if ucode < 0x80 then  -- 1byte
					if rest then
						return char(ucode, rest)
					end
					return char(ucode)
				elseif ucode < 0x800 then  -- 2bytes
					c1 = floor(ucode / 0x40)
					c2 = ucode - c1 * 0x40
					c1 = c1 + 0xC0
					c2 = c2 + 0x80
					if rest then
						return char(c1, c2, rest)
					end
					return char(c1, c2)
				elseif ucode < 0xD800 or 0xE000 <= ucode then  -- 3bytes
					c1 = floor(ucode / 0x1000)
					ucode = ucode - c1 * 0x1000
					c2 = floor(ucode / 0x40)
					c3 = ucode - c2 * 0x40
					c1 = c1 + 0xE0
					c2 = c2 + 0x80
					c3 = c3 + 0x80
					if rest then
						return char(c1, c2, c3, rest)
					end
					return char(c1, c2, c3)
				elseif 0xD800 <= ucode and ucode < 0xDC00 then  -- surrogate pair 1st
					if f_str_surrogate_prev == 0 then
						f_str_surrogate_prev = ucode
						if not rest then
							return ''
						end
						surrogate_first_error()
					end
					f_str_surrogate_prev = 0
					surrogate_first_error()
				else  -- surrogate pair 2nd
					if f_str_surrogate_prev ~= 0 then
						ucode = 0x10000 +
						        (f_str_surrogate_prev - 0xD800) * 0x400 +
						        (ucode - 0xDC00)
						f_str_surrogate_prev = 0
						c1 = floor(ucode / 0x40000)
						ucode = ucode - c1 * 0x40000
						c2 = floor(ucode / 0x1000)
						ucode = ucode - c2 * 0x1000
						c3 = floor(ucode / 0x40)
						c4 = ucode - c3 * 0x40
						c1 = c1 + 0xF0
						c2 = c2 + 0x80
						c3 = c3 + 0x80
						c4 = c4 + 0x80
						if rest then
							return char(c1, c2, c3, c4, rest)
						end
						return char(c1, c2, c3, c4)
					end
					decode_error("2nd surrogate pair byte appeared without 1st")
				end
			end
			decode_error("invalid unicode codepoint literal")
		end
		if f_str_surrogate_prev ~= 0 then
			f_str_surrogate_prev = 0
			surrogate_first_error()
		end
		return f_str_escapetbl[ch] .. ucode
	end

	-- caching interpreted keys for speed
	local f_str_keycache = setmetatable({}, {__mode="v"})

	local function f_str(iskey)
		local newpos = pos
		local tmppos, c1, c2
		repeat
			newpos = find(json, '"', newpos, true)  -- search '"'
			if not newpos then
				decode_error("unterminated string")
			end
			tmppos = newpos-1
			newpos = newpos+1
			c1, c2 = byte(json, tmppos-1, tmppos)
			if c2 == 0x5C and c1 == 0x5C then  -- skip preceding '\\'s
				repeat
					tmppos = tmppos-2
					c1, c2 = byte(json, tmppos-1, tmppos)
				until c2 ~= 0x5C or c1 ~= 0x5C
				tmppos = newpos-2
			end
		until c2 ~= 0x5C  -- leave if '"' is not preceded by '\'

		local str = sub(json, pos, tmppos)
		pos = newpos

		if iskey then  -- check key cache
			tmppos = f_str_keycache[str]  -- reuse tmppos for cache key/val
			if tmppos then
				return tmppos
			end
			tmppos = str
		end

		if find(str, f_str_ctrl_pat) then
			decode_error("unescaped control string")
		end
		if find(str, '\\', 1, true) then  -- check whether a backslash exists
			-- We need to grab 4 characters after the escape char,
			-- for encoding unicode codepoint to UTF-8.
			-- As we need to ensure that every first surrogate pair byte is
			-- immediately followed by second one, we grab upto 5 characters and
			-- check the last for this purpose.
			str = gsub(str, '\\(.)([^\\]?[^\\]?[^\\]?[^\\]?[^\\]?)', f_str_subst)
			if f_str_surrogate_prev ~= 0 then
				f_str_surrogate_prev = 0
				decode_error("1st surrogate pair byte not continued by 2nd")
			end
		end
		if iskey then  -- commit key cache
			f_str_keycache[tmppos] = str
		end
		return str
	end

	--[[
		Arrays, Objects
	--]]
	-- array
	local function f_ary()
		rec_depth = rec_depth + 1
		if rec_depth > 1000 then
			decode_error('too deeply nested json (> 1000)')
		end
		local ary = {}

		pos = match(json, '^[ \n\r\t]*()', pos)

		local i = 0
		if byte(json, pos) == 0x5D then  -- check closing bracket ']' which means the array empty
			pos = pos+1
		else
			local newpos = pos
			repeat
				i = i+1
				f = dispatcher[byte(json,newpos)]  -- parse value
				pos = newpos+1
				ary[i] = f()
				newpos = match(json, '^[ \n\r\t]*,[ \n\r\t]*()', pos)  -- check comma
			until not newpos

			newpos = match(json, '^[ \n\r\t]*%]()', pos)  -- check closing bracket
			if not newpos then
				decode_error("no closing bracket of an array")
			end
			pos = newpos
		end

		if arraylen then -- commit the length of the array if `arraylen` is set
			ary[0] = i
		end
		rec_depth = rec_depth - 1
		return ary
	end

	-- objects
	local function f_obj()
		rec_depth = rec_depth + 1
		if rec_depth > 1000 then
			decode_error('too deeply nested json (> 1000)')
		end
		local obj = {}

		pos = match(json, '^[ \n\r\t]*()', pos)
		if byte(json, pos) == 0x7D then  -- check closing bracket '}' which means the object empty
			pos = pos+1
		else
			local newpos = pos

			repeat
				if byte(json, newpos) ~= 0x22 then  -- check '"'
					decode_error("not key")
				end
				pos = newpos+1
				local key = f_str(true)  -- parse key

				-- optimized for compact json
				-- c1, c2 == ':', <the first char of the value> or
				-- c1, c2, c3 == ':', ' ', <the first char of the value>
				f = f_err
				local c1, c2, c3 = byte(json, pos, pos+3)
				if c1 == 0x3A then
					if c2 ~= 0x20 then
						f = dispatcher[c2]
						newpos = pos+2
					else
						f = dispatcher[c3]
						newpos = pos+3
					end
				end
				if f == f_err then  -- read a colon and arbitrary number of spaces
					newpos = match(json, '^[ \n\r\t]*:[ \n\r\t]*()', pos)
					if not newpos then
						decode_error("no colon after a key")
					end
					f = dispatcher[byte(json, newpos)]
					newpos = newpos+1
				end
				pos = newpos
				obj[key] = f()  -- parse value
				newpos = match(json, '^[ \n\r\t]*,[ \n\r\t]*()', pos)
			until not newpos

			newpos = match(json, '^[ \n\r\t]*}()', pos)
			if not newpos then
				decode_error("no closing bracket of an object")
			end
			pos = newpos
		end

		rec_depth = rec_depth - 1
		return obj
	end

	--[[
		The jump table to dispatch a parser for a value,
		indexed by the code of the value's first char.
		Nil key means the end of json.
	--]]
	dispatcher = { [0] =
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_str, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_mns, f_err, f_err,
		f_zro, f_num, f_num, f_num, f_num, f_num, f_num, f_num,
		f_num, f_num, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_ary, f_err, f_err, f_err, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_fls, f_err,
		f_err, f_err, f_err, f_err, f_err, f_err, f_nul, f_err,
		f_err, f_err, f_err, f_err, f_tru, f_err, f_err, f_err,
		f_err, f_err, f_err, f_obj, f_err, f_err, f_err, f_err,
		__index = function()
			decode_error("unexpected termination")
		end
	}
	setmetatable(dispatcher, dispatcher)

	--[[
		run decoder
	--]]
	local function decode(json_, pos_, nullv_, arraylen_)
		json, pos, nullv, arraylen = json_, pos_, nullv_, arraylen_
		rec_depth = 0

		pos = match(json, '^[ \n\r\t]*()', pos)

		f = dispatcher[byte(json, pos)]
		pos = pos+1
		local v = f()

		if pos_ then
			return v, pos
		else
			f, pos = find(json, '^[ \n\r\t]*', pos)
			if pos ~= #json then
				decode_error('json ended')
			end
			return v
		end
	end

	return decode
end

return newdecoder

end
end

do
local _ENV = _ENV
package.preload[ "lunajson.encoder" ] = function( ... ) local arg = _G.arg;
local error = error
local byte, find, format, gsub, match = string.byte, string.find, string.format,  string.gsub, string.match
local concat = table.concat
local tostring = tostring
local pairs, type = pairs, type
local setmetatable = setmetatable
local huge, tiny = 1/0, -1/0

local f_string_esc_pat
if _VERSION == "Lua 5.1" then
	-- use the cluttered pattern because lua 5.1 does not handle \0 in a pattern correctly
	f_string_esc_pat = '[^ -!#-[%]^-\255]'
else
	f_string_esc_pat = '[\0-\31"\\]'
end

local _ENV = nil


local function newencoder()
	local v, nullv
	local i, builder, visited

	local function f_tostring(v)
		builder[i] = tostring(v)
		i = i+1
	end

	local radixmark = match(tostring(0.5), '[^0-9]')
	local delimmark = match(tostring(12345.12345), '[^0-9' .. radixmark .. ']')
	if radixmark == '.' then
		radixmark = nil
	end

	local radixordelim
	if radixmark or delimmark then
		radixordelim = true
		if radixmark and find(radixmark, '%W') then
			radixmark = '%' .. radixmark
		end
		if delimmark and find(delimmark, '%W') then
			delimmark = '%' .. delimmark
		end
	end

	local f_number = function(n)
		if tiny < n and n < huge then
			local s = format("%.17g", n)
			if radixordelim then
				if delimmark then
					s = gsub(s, delimmark, '')
				end
				if radixmark then
					s = gsub(s, radixmark, '.')
				end
			end
			builder[i] = s
			i = i+1
			return
		end
		error('invalid number')
	end

	local doencode

	local f_string_subst = {
		['"'] = '\\"',
		['\\'] = '\\\\',
		['\b'] = '\\b',
		['\f'] = '\\f',
		['\n'] = '\\n',
		['\r'] = '\\r',
		['\t'] = '\\t',
		__index = function(_, c)
			return format('\\u00%02X', byte(c))
		end
	}
	setmetatable(f_string_subst, f_string_subst)

	local function f_string(s)
		builder[i] = '"'
		if find(s, f_string_esc_pat) then
			s = gsub(s, f_string_esc_pat, f_string_subst)
		end
		builder[i+1] = s
		builder[i+2] = '"'
		i = i+3
	end

	local function f_table(o)
		if visited[o] then
			error("loop detected")
		end
		visited[o] = true

		local tmp = o[0]
		if type(tmp) == 'number' then -- arraylen available
			builder[i] = '['
			i = i+1
			for j = 1, tmp do
				doencode(o[j])
				builder[i] = ','
				i = i+1
			end
			if tmp > 0 then
				i = i-1
			end
			builder[i] = ']'

		else
			tmp = o[1]
			if tmp ~= nil then -- detected as array
				builder[i] = '['
				i = i+1
				local j = 2
				repeat
					doencode(tmp)
					tmp = o[j]
					if tmp == nil then
						break
					end
					j = j+1
					builder[i] = ','
					i = i+1
				until false
				builder[i] = ']'

			else -- detected as object
				builder[i] = '{'
				i = i+1
				local tmp = i
				for k, v in pairs(o) do
					if type(k) ~= 'string' then
						error("non-string key")
					end
					f_string(k)
					builder[i] = ':'
					i = i+1
					doencode(v)
					builder[i] = ','
					i = i+1
				end
				if i > tmp then
					i = i-1
				end
				builder[i] = '}'
			end
		end

		i = i+1
		visited[o] = nil
	end

	local dispatcher = {
		boolean = f_tostring,
		number = f_number,
		string = f_string,
		table = f_table,
		__index = function()
			error("invalid type value")
		end
	}
	setmetatable(dispatcher, dispatcher)

	function doencode(v)
		if v == nullv then
			builder[i] = 'null'
			i = i+1
			return
		end
		return dispatcher[type(v)](v)
	end

	local function encode(v_, nullv_)
		v, nullv = v_, nullv_
		i, builder, visited = 1, {}, {}

		doencode(v)
		return concat(builder)
	end

	return encode
end

return newencoder

end
end

end

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

    citation = citation ..
      '{ ' .. (collect(item.prefix)  or '') ..
      ' | ' .. suppress .. trim(string.gsub(collect(cite.content) or '', '[|{}]', '')) ..
      ' | ' .. -- (item.locator or '') ..
      ' | ' .. (collect(item.suffix) or '') ..
      ' | ' .. (ug == 'groups' and 'zg:' or 'zu:') .. id .. ':' .. key .. ' }'
  end

  return pandoc.Str(citation)
end

return {
  { Meta = Meta },
  { Inlines = Inlines }
}
