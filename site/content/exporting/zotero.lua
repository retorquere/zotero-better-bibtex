
  print('zotero-live-citations 374f349')
  local mt, latest = pandoc.mediabag.fetch('https://retorque.re/zotero-better-bibtex/exporting/zotero.lua.revision')
  latest = string.sub(latest, 1, 10)
  if '374f349' ~= latest then
    print('new version "' .. latest .. '" available at https://retorque.re/zotero-better-bibtex/exporting')
  end

do
local _ENV = _ENV
package.preload[ "locator" ] = function( ... ) local arg = _G.arg;
-- local lpeg = require('lpeg')

local book = (lpeg.P('book') + lpeg.P('bk.') + lpeg.P('bks.')) / 'book'
local chapter = (lpeg.P('chapter') + lpeg.P('chap.') + lpeg.P('chaps.')) / 'chapter'
local column = (lpeg.P('column') + lpeg.P('col.') + lpeg.P('cols.')) / 'column'
local figure = (lpeg.P('figure') + lpeg.P('fig.') + lpeg.P('figs.')) / 'figure'
local folio = (lpeg.P('folio') + lpeg.P('fol.') + lpeg.P('fols.')) / 'folio'
local number = (lpeg.P('number') + lpeg.P('no.') + lpeg.P('nos.')) / 'number'
local line = (lpeg.P('line') + lpeg.P('l.') + lpeg.P('ll.')) / 'line'
local note = (lpeg.P('note') + lpeg.P('n.') + lpeg.P('nn.')) / 'note'
local opus = (lpeg.P('opus') + lpeg.P('op.') + lpeg.P('opp.')) / 'opus'
local page = (lpeg.P('page') + lpeg.P('p.') + lpeg.P('pp.')) / 'page'
local paragraph = (lpeg.P('paragraph') + lpeg.P('para.') + lpeg.P('paras.') + lpeg.P('¶¶') + lpeg.P('¶')) / 'paragraph'
local part = (lpeg.P('part') + lpeg.P('pt.') + lpeg.P('pts.')) / 'part'
local section = (lpeg.P('section') + lpeg.P('sec.') + lpeg.P('secs.') + lpeg.P('§§') + lpeg.P('§')) / 'section'
local subverbo = (lpeg.P('sub verbo') + lpeg.P('s.v.') + lpeg.P('s.vv.')) / 'sub verbo'
local verse = (lpeg.P('verse') + lpeg.P('v.') + lpeg.P('vv.')) / 'verse'
local volume = (lpeg.P('volume') + lpeg.P('vol.') + lpeg.P('vols.')) / 'volume'
local label = book + chapter + column + figure + folio + number + line + note + opus + page + paragraph + part + section + subverbo + verse + volume

local whitespace = lpeg.P(' ')^0
local nonspace = lpeg.P(1) - lpeg.S(' ')
local nonbrace = lpeg.P(1) - lpeg.S('{}')

local word = nonspace^1 / 1
-- local roman = lpeg.S('IiVvXxLlCcDdMm]')^1
local number = lpeg.R('09')^1 -- + roman

local numbers = number * (whitespace * lpeg.S('-')^1 * whitespace * number)^-1
local ranges = (numbers * (whitespace * lpeg.P(',') * whitespace * numbers)^0) / 1

-- local braced_locator = lpeg.P('{') * lpeg.Cs(label + lpeg.Cc('page')) * whitespace * lpeg.C(nonbrace^1) * lpeg.P('}')
local braced_locator = lpeg.P('{') * label * whitespace * lpeg.C(nonbrace^1) * lpeg.P('}')
local braced_implicit_locator = lpeg.P('{') * lpeg.Cc('page') * lpeg.Cs(numbers) * lpeg.P('}')
local locator = braced_locator + braced_implicit_locator + (label * whitespace * ranges) + (label * whitespace * word) + (lpeg.Cc('page') * ranges)
local remainder = lpeg.C(lpeg.P(1)^0)

local suffix = lpeg.C(lpeg.P(',')^-1 * whitespace) * locator * remainder

local pseudo_locator = lpeg.C(lpeg.P(',')^-1 * whitespace) * lpeg.P('{') * lpeg.C(nonbrace^0) * lpeg.P('}') * remainder

local module = {}

function module.parse(input, shortlabel)
  local parsed = lpeg.Ct(suffix):match(input)
  if parsed then
    local _prefix, _label, _locator, _suffix = table.unpack(parsed)
    return _label, _locator, _prefix .. _suffix
  end

  parsed = lpeg.Ct(pseudo_locator):match(input)
  if parsed then
    local _prefix, _locator, _suffix = table.unpack(parsed)
    return nil, nil, _prefix .. _locator .. _suffix
  end

  return nil, nil, input
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

do
local _ENV = _ENV
package.preload[ "lunajson.sax" ] = function( ... ) local arg = _G.arg;
local setmetatable, tonumber, tostring =
      setmetatable, tonumber, tostring
local floor, inf =
      math.floor, math.huge
local mininteger, tointeger =
      math.mininteger or nil, math.tointeger or nil
local byte, char, find, gsub, match, sub =
      string.byte, string.char, string.find, string.gsub, string.match, string.sub

local function _parse_error(pos, errmsg)
	error("parse error at " .. pos .. ": " .. errmsg, 2)
end

local f_str_ctrl_pat
if _VERSION == "Lua 5.1" then
	-- use the cluttered pattern because lua 5.1 does not handle \0 in a pattern correctly
	f_str_ctrl_pat = '[^\32-\255]'
else
	f_str_ctrl_pat = '[\0-\31]'
end

local type, unpack = type, table.unpack or unpack
local open = io.open

local _ENV = nil


local function nop() end

local function newparser(src, saxtbl)
	local json, jsonnxt, rec_depth
	local jsonlen, pos, acc = 0, 1, 0

	-- `f` is the temporary for dispatcher[c] and
	-- the dummy for the first return value of `find`
	local dispatcher, f

	-- initialize
	if type(src) == 'string' then
		json = src
		jsonlen = #json
		jsonnxt = function()
			json = ''
			jsonlen = 0
			jsonnxt = nop
		end
	else
		jsonnxt = function()
			acc = acc + jsonlen
			pos = 1
			repeat
				json = src()
				if not json then
					json = ''
					jsonlen = 0
					jsonnxt = nop
					return
				end
				jsonlen = #json
			until jsonlen > 0
		end
		jsonnxt()
	end

	local sax_startobject = saxtbl.startobject or nop
	local sax_key = saxtbl.key or nop
	local sax_endobject = saxtbl.endobject or nop
	local sax_startarray = saxtbl.startarray or nop
	local sax_endarray = saxtbl.endarray or nop
	local sax_string = saxtbl.string or nop
	local sax_number = saxtbl.number or nop
	local sax_boolean = saxtbl.boolean or nop
	local sax_null = saxtbl.null or nop

	--[[
		Helper
	--]]
	local function tryc()
		local c = byte(json, pos)
		if not c then
			jsonnxt()
			c = byte(json, pos)
		end
		return c
	end

	local function parse_error(errmsg)
		return _parse_error(acc + pos, errmsg)
	end

	local function tellc()
		return tryc() or parse_error("unexpected termination")
	end

	local function spaces()  -- skip spaces and prepare the next char
		while true do
			pos = match(json, '^[ \n\r\t]*()', pos)
			if pos <= jsonlen then
				return
			end
			if jsonlen == 0 then
				parse_error("unexpected termination")
			end
			jsonnxt()
		end
	end

	--[[
		Invalid
	--]]
	local function f_err()
		parse_error('invalid value')
	end

	--[[
		Constants
	--]]
	-- fallback slow constants parser
	local function generic_constant(target, targetlen, ret, sax_f)
		for i = 1, targetlen do
			local c = tellc()
			if byte(target, i) ~= c then
				parse_error("invalid char")
			end
			pos = pos+1
		end
		return sax_f(ret)
	end

	-- null
	local function f_nul()
		if sub(json, pos, pos+2) == 'ull' then
			pos = pos+3
			return sax_null(nil)
		end
		return generic_constant('ull', 3, nil, sax_null)
	end

	-- false
	local function f_fls()
		if sub(json, pos, pos+3) == 'alse' then
			pos = pos+4
			return sax_boolean(false)
		end
		return generic_constant('alse', 4, false, sax_boolean)
	end

	-- true
	local function f_tru()
		if sub(json, pos, pos+2) == 'rue' then
			pos = pos+3
			return sax_boolean(true)
		end
		return generic_constant('rue', 3, true, sax_boolean)
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
		return parse_error('invalid number')
	end

	-- fallback slow parser
	local function generic_number(mns)
		local buf = {}
		local i = 1
		local is_int = true

		local c = byte(json, pos)
		pos = pos+1

		local function nxt()
			buf[i] = c
			i = i+1
			c = tryc()
			pos = pos+1
		end

		if c == 0x30 then
			nxt()
			if c and 0x30 <= c and c < 0x3A then
				number_error()
			end
		else
			repeat nxt() until not (c and 0x30 <= c and c < 0x3A)
		end
		if c == 0x2E then
			is_int = false
			nxt()
			if not (c and 0x30 <= c and c < 0x3A) then
				number_error()
			end
			repeat nxt() until not (c and 0x30 <= c and c < 0x3A)
		end
		if c == 0x45 or c == 0x65 then
			is_int = false
			nxt()
			if c == 0x2B or c == 0x2D then
				nxt()
			end
			if not (c and 0x30 <= c and c < 0x3A) then
				number_error()
			end
			repeat nxt() until not (c and 0x30 <= c and c < 0x3A)
		end
		if c and (0x41 <= c and c <= 0x5B or
		          0x61 <= c and c <= 0x7B or
		          c == 0x2B or c == 0x2D or c == 0x2E) then
			number_error()
		end
		pos = pos-1

		local num = char(unpack(buf))
		num = fixedtonumber(num)
		if mns then
			num = -num
			if num == mininteger and is_int then
				num = mininteger
			end
		end
		return sax_number(num)
	end

	-- `0(\.[0-9]*)?([eE][+-]?[0-9]*)?`
	local function f_zro(mns)
		local num, c = match(json, '^(%.?[0-9]*)([-+.A-Za-z]?)', pos)  -- skipping 0

		if num == '' then
			if pos > jsonlen then
				pos = pos - 1
				return generic_number(mns)
			end
			if c == '' then
				if mns then
					return sax_number(-0.0)
				end
				return sax_number(0)
			end

			if c == 'e' or c == 'E' then
				num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
				if c == '' then
					pos = pos + #num
					if pos > jsonlen then
						pos = pos - #num - 1
						return generic_number(mns)
					end
					if mns then
						return sax_number(-0.0)
					end
					return sax_number(0.0)
				end
			end
			pos = pos-1
			return generic_number(mns)
		end

		if byte(num) ~= 0x2E or byte(num, -1) == 0x2E then
			pos = pos-1
			return generic_number(mns)
		end

		if c ~= '' then
			if c == 'e' or c == 'E' then
				num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
			end
			if c ~= '' then
				pos = pos-1
				return generic_number(mns)
			end
		end

		pos = pos + #num
		if pos > jsonlen then
			pos = pos - #num - 1
			return generic_number(mns)
		end
		c = fixedtonumber(num)

		if mns then
			c = -c
		end
		return sax_number(c)
	end

	-- `[1-9][0-9]*(\.[0-9]*)?([eE][+-]?[0-9]*)?`
	local function f_num(mns)
		pos = pos-1
		local num, c = match(json, '^([0-9]+%.?[0-9]*)([-+.A-Za-z]?)', pos)
		if byte(num, -1) == 0x2E then  -- error if ended with period
			return generic_number(mns)
		end

		if c ~= '' then
			if c ~= 'e' and c ~= 'E' then
				return generic_number(mns)
			end
			num, c = match(json, '^([^eE]*[eE][-+]?[0-9]+)([-+.A-Za-z]?)', pos)
			if not num or c ~= '' then
				return generic_number(mns)
			end
		end

		pos = pos + #num
		if pos > jsonlen then
			pos = pos - #num
			return generic_number(mns)
		end
		c = fixedtonumber(num)

		if mns then
			c = -c
			if c == mininteger and not find(num, '[^0-9]') then
				c = mininteger
			end
		end
		return sax_number(c)
	end

	-- skip minus sign
	local function f_mns()
		local c = byte(json, pos) or tellc()
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
		parse_error("invalid number")
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
			parse_error("invalid escape sequence")
		end
	}
	setmetatable(f_str_escapetbl, f_str_escapetbl)

	local function surrogate_first_error()
		return parse_error("1st surrogate pair byte not continued by 2nd")
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
					parse_error("2nd surrogate pair byte appeared without 1st")
				end
			end
			parse_error("invalid unicode codepoint literal")
		end
		if f_str_surrogate_prev ~= 0 then
			f_str_surrogate_prev = 0
			surrogate_first_error()
		end
		return f_str_escapetbl[ch] .. ucode
	end

	local function f_str(iskey)
		local pos2 = pos
		local newpos
		local str = ''
		local bs
		while true do
			while true do  -- search '\' or '"'
				newpos = find(json, '[\\"]', pos2)
				if newpos then
					break
				end
				str = str .. sub(json, pos, jsonlen)
				if pos2 == jsonlen+2 then
					pos2 = 2
				else
					pos2 = 1
				end
				jsonnxt()
				if jsonlen == 0 then
					parse_error("unterminated string")
				end
			end
			if byte(json, newpos) == 0x22 then  -- break if '"'
				break
			end
			pos2 = newpos+2  -- skip '\<char>'
			bs = true  -- mark the existence of a backslash
		end
		str = str .. sub(json, pos, newpos-1)
		pos = newpos+1

		if find(str, f_str_ctrl_pat) then
			parse_error("unescaped control string")
		end
		if bs then  -- a backslash exists
			-- We need to grab 4 characters after the escape char,
			-- for encoding unicode codepoint to UTF-8.
			-- As we need to ensure that every first surrogate pair byte is
			-- immediately followed by second one, we grab upto 5 characters and
			-- check the last for this purpose.
			str = gsub(str, '\\(.)([^\\]?[^\\]?[^\\]?[^\\]?[^\\]?)', f_str_subst)
			if f_str_surrogate_prev ~= 0 then
				f_str_surrogate_prev = 0
				parse_error("1st surrogate pair byte not continued by 2nd")
			end
		end

		if iskey then
			return sax_key(str)
		end
		return sax_string(str)
	end

	--[[
		Arrays, Objects
	--]]
	-- arrays
	local function f_ary()
		rec_depth = rec_depth + 1
		if rec_depth > 1000 then
			parse_error('too deeply nested json (> 1000)')
		end
		sax_startarray()

		spaces()
		if byte(json, pos) == 0x5D then  -- check closing bracket ']' which means the array empty
			pos = pos+1
		else
			local newpos
			while true do
				f = dispatcher[byte(json, pos)]  -- parse value
				pos = pos+1
				f()
				newpos = match(json, '^[ \n\r\t]*,[ \n\r\t]*()', pos)  -- check comma
				if newpos then
					pos = newpos
				else
					newpos = match(json, '^[ \n\r\t]*%]()', pos)  -- check closing bracket
					if newpos then
						pos = newpos
						break
					end
					spaces()  -- since the current chunk can be ended, skip spaces toward following chunks
					local c = byte(json, pos)
					pos = pos+1
					if c == 0x2C then  -- check comma again
						spaces()
					elseif c == 0x5D then  -- check closing bracket again
						break
					else
						parse_error("no closing bracket of an array")
					end
				end
				if pos > jsonlen then
					spaces()
				end
			end
		end

		rec_depth = rec_depth - 1
		return sax_endarray()
	end

	-- objects
	local function f_obj()
		rec_depth = rec_depth + 1
		if rec_depth > 1000 then
			parse_error('too deeply nested json (> 1000)')
		end
		sax_startobject()

		spaces()
		if byte(json, pos) == 0x7D then  -- check closing bracket '}' which means the object empty
			pos = pos+1
		else
			local newpos
			while true do
				if byte(json, pos) ~= 0x22 then
					parse_error("not key")
				end
				pos = pos+1
				f_str(true)  -- parse key
				newpos = match(json, '^[ \n\r\t]*:[ \n\r\t]*()', pos)  -- check colon
				if newpos then
					pos = newpos
				else
					spaces()  -- read spaces through chunks
					if byte(json, pos) ~= 0x3A then  -- check colon again
						parse_error("no colon after a key")
					end
					pos = pos+1
					spaces()
				end
				if pos > jsonlen then
					spaces()
				end
				f = dispatcher[byte(json, pos)]
				pos = pos+1
				f()  -- parse value
				newpos = match(json, '^[ \n\r\t]*,[ \n\r\t]*()', pos)  -- check comma
				if newpos then
					pos = newpos
				else
					newpos = match(json, '^[ \n\r\t]*}()', pos)  -- check closing bracket
					if newpos then
						pos = newpos
						break
					end
					spaces()  -- read spaces through chunks
					local c = byte(json, pos)
					pos = pos+1
					if c == 0x2C then  -- check comma again
						spaces()
					elseif c == 0x7D then  -- check closing bracket again
						break
					else
						parse_error("no closing bracket of an object")
					end
				end
				if pos > jsonlen then
					spaces()
				end
			end
		end

		rec_depth = rec_depth - 1
		return sax_endobject()
	end

	--[[
		The jump table to dispatch a parser for a value,
		indexed by the code of the value's first char.
		Key should be non-nil.
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
	}

	--[[
		public funcitons
	--]]
	local function run()
		rec_depth = 0
		spaces()
		f = dispatcher[byte(json, pos)]
		pos = pos+1
		f()
	end

	local function read(n)
		if n < 0 then
			error("the argument must be non-negative")
		end
		local pos2 = (pos-1) + n
		local str = sub(json, pos, pos2)
		while pos2 > jsonlen and jsonlen ~= 0 do
			jsonnxt()
			pos2 = pos2 - (jsonlen - (pos-1))
			str = str .. sub(json, pos, pos2)
		end
		if jsonlen ~= 0 then
			pos = pos2+1
		end
		return str
	end

	local function tellpos()
		return acc + pos
	end

	return {
		run = run,
		tryc = tryc,
		read = read,
		tellpos = tellpos,
	}
end

local function newfileparser(fn, saxtbl)
	local fp = open(fn)
	local function gen()
		local s
		if fp then
			s = fp:read(8192)
			if not s then
				fp:close()
				fp = nil
			end
		end
		return s
	end
	return newparser(gen, saxtbl)
end

return {
	newparser = newparser,
	newfileparser = newfileparser
}
end
end

do
local _ENV = _ENV
package.preload[ "utils" ] = function( ... ) local arg = _G.arg;
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

function module.trim(s)
  if s == nil then
    return s
  end
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

return module
end
end

do
local _ENV = _ENV
package.preload[ "zotero" ] = function( ... ) local arg = _G.arg;
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

local json = require('lunajson')
local csl_locator = require('locator')
local utils = require('utils')
local zotero = require('zotero')

if lpeg == nil then
  print('upgrade pandoc to version 2.16.2 or later')
end

-- -- global state -- --
local config = {
  client = 'zotero',
  scannable_cite = false,
  csl_style = 'apa7',
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
    'ZOTERO_BIBL ' .. utils.xmlescape(bib_settings) .. ' CSL_BIBLIOGRAPHY' .. ' RND' .. utils.next_id(10))
end

-- -- -- citation market generators -- -- --
local function zotero_ref(cite)
  local content = pandoc.utils.stringify(cite.content)
  local csl = {
    citationID = utils.next_id(8),
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

  notfound = false
  for k, item in pairs(cite.citations) do
    local itemData, zoteroData = zotero.get(item.id)
    if itemData == nil then
      notfound = true
    else

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
  end

  if notfound then
    return cite
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

    csl = 'ZOTERO_ITEM CSL_CITATION ' .. utils.xmlescape(json.encode(csl)) .. ' RND' .. utils.next_id(10)
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

    local shortlabel = {
      book = 'bk.',
      chapter = 'chap.',
      column = 'col.',
      figure = 'fig.',
      folio = 'fol.',
      number = 'no.',
      line = 'l.',
      note = 'n.',
      opus = 'op.',
      page = 'p.',
      paragraph = 'para.',
      part = 'pt.',
      section = 'sec.',
      ['sub verbo'] = 's.v.',
      verse = 'v.',
      volume = 'vol.',
    }
    local label, locator, suffix = csl_locator.parse(pandoc.utils.stringify(item.suffix))
    if label then
      locator = shortlabel[label] .. ' ' .. locator
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

