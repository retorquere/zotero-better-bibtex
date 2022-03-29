citekeys = {}
function Cite(cite)
  for _, item in pairs(cite.citations) do
    citekeys[item.id] = true
  end

  return nil
end

printed = false
function Block(block)
  body = ''
  if not printed then
    printed = true
    for id, _ in pairs(citekeys) do
      body = body .. id .. ' '
    end
  end
  return pandoc.Plain(body)
end

return {
  { Cite = Cite },
  { Block = Block },
}
