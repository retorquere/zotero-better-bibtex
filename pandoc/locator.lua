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
