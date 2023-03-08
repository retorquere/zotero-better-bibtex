if (Translator.BetterTeX && !Translator.options.exportFileData && item.attachments && (true || Translator.exportPath.includes('\\\\'))) {
  if (item.attachments) {
    reference.add({ name: 'file', bibtex: '{' + reference.enc_attachments({ value: item.attachments }, path => path.replace(/\//g, '\\\\')) + '}' })
  }
}
