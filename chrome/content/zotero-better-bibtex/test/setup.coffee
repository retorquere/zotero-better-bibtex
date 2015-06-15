assert = chai.assert
expect = chai.expect
chai.should()

Zotero.BetterBibTeX.Test = new class
  run: (clusters) ->
    mocha.setup({ui:'bdd', reporter:@Reporter})
    loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader)

    clusters = Object.keys(@clusters) if '*' in clusters
    for cluster, tests of @clusters
      continue unless cluster in clusters
      for test in tests
        loader.loadSubScript("chrome://zotero-better-bibtex/content/test/#{test}.js")

    mocha.run()

  Reporter: class
    constructor: (runner) ->
      @indents = 0
      @passed = 0
      @failed = 0

    for event in ['start', 'suite', 'suite end', 'pending', 'pass', 'fail', 'end']
      runner.on(event, @[event].bind(@))

    start: ->

    suite: (suite) ->
      ++@indents
      dump(indent() + suite.title + '\n')
      return

    'suite end': (suite) ->
      --@indents
      dump('\n') if 1 == indents
      return

    pending: (test) ->
      # dump('\ud' + indent() + 'pending  -' + test.title + '\n')
      return

    pass: (test) ->
      passed++
      # msg = '\ud' + indent() + Mocha.reporters.Base.symbols.ok + ' ' + test.title
      if 'fast' != test.speed
        msg += ' (' + Math.round(test.duration) + ' ms)'
      dump(msg + '\n')
      return

    fail: (test, err) ->
      failed++
      #dump '\ud' + indent() + Mocha.reporters.Base.symbols.err + ' ' + test.title + '\n' + indent() + '  ' + err.toString() + ' at\n' + indent() + '    ' + err.stack.replace('\n', '\n' + indent() + '    ', 'g')
      return

    end: ->
      dump(passed + '/' + passed + failed + ' tests passed.\n')
      quit(failed != 0)
      return

    indent: ->
      #Array(indents).join('  ')
      return
