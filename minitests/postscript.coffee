Translator.initialize = ((original) ->
  return ->
    return if @initialized
    original.apply(@, arguments)
    try
      Reference::postscript = new Function(Translator.postscript)
    catch err
      Translator.debug('postscript failed to compile:', err, Translator.postscript)
)(Translator.initialize)
