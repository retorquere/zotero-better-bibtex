if @item.arXiv
  @add({name: 'pages', value: @item.arXiv })
  @add({name: 'journaltitle', bibtex: '{}' }) unless @has.journaltitle
