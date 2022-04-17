citekeys = {}
function Cite(cite)
  for _, item in pairs(cite.citations) do
    citekeys[item.id] = true
  end

  return nil
end

function Pandoc(doc)
  body = {}
  for citekey, _ in pairs(citekeys) do
    table.insert(body, pandoc.Plain(citekey))
  end
  return pandoc.Pandoc(body)
end

return {
  { Cite = Cite },
  { Pandoc = Pandoc },
}
