if (Translator.BetterTeX) {
  const tex_fields = Object.entries(item.extraFields.tex).sort((a, b) => a[1].line - b[1].line).map(field => field[0]).filter(field => entry.has[field])
  const field_order = Object.keys(entry.has).filter(field => !tex_fields.includes(field)).concat(tex_fields)
  for (const field of field_order) {
    // delete and add has the effect of fields being added to the end
    const value = entry.has[field]
    delete entry.has[field]
    entry.has[field] = value
  }
}
