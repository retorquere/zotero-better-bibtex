if @item.arXiv
  @add({name: 'journaltitle', bibtex: '{}' })
  @add({name: 'pages', value: @item.arXiv })
