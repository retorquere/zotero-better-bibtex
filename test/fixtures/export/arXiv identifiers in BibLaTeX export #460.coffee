if @item.arXiv && @has.journaltitle.value.toLowerCase().startsWith('arxiv:')
  @add({name: 'pages', value: @item.arXiv })
  @add({name: 'journaltitle', bibtex: '{}', replace: true })
