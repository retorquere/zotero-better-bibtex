local locator = {}

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

local function 
end

function locator.parse(suffix)
  local label
  local s, e, locator, remaining = string.find(suffix, '{([^{}]+)}, *(.*)')

  if not locator then
    s, e, locator, remaining = string.find(suffix, ', *{([^{}]+)} *(.*)')
  end

  if not locator then
    s, e, label, remaining = string.find(suffix, '^, *(%l+%.?) *(.*)')
    if label and labels[label] then
      label = labels[label]
      suffix = remaining
    else
      label = 'page'
    end

    local _locator = ''
    local num
    repeat
      s, e, num, remaining = string.find(suffix, '^(,? *%d+-%d+)(.*)')
      if not num then
        s, e, num, remaining = string.find(suffix, '^(,? *%d+)(.*)')
      end

      if num then
        _locator = _locator .. num
        suffix = remaining
      end
    until not num

    if _locator ~= '' then
      locator = _locator
    end

  end
  
  if locator then print(label, locator) end

  return suffix
end

return locator
