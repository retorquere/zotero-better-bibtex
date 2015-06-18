Zotero.BetterBibTeX.Test = new class
  constructor:
    @status = []

  run: (tags) ->
    @library = new @Library()
    # Yadda = require('yadda')
    scenarios = []
    featureParser = new Yadda.parsers.FeatureParser()
    for feature in Zotero.BetterBibTeX.Test.features
      feature = Zotero.File.getContentsFromURL(feature)
      scenarios = scenarios.concat(featureParser.parse(feature).scenarios)

    scenarios = (scenario for scenario in scenarios when @withTags(scenario, tags))

    @status = ({scenario, status: 'pending'} for scenario of scenarios)
    for scenario, i in scenarios
      Yadda.createInstance(@library).run(scenario.steps, (status) ->
        if status == undefined
          @status[i] = 'success'
        else
          @status[i] = 'fail'
      )

  withTags: (scenario, tags) ->
    for tag in tags
      if tag[0] == '~'
        return false if scenario.annotations.indexOf(tag.slice(1)) >= 0
      else
        return false if scenario.annotations.indexOf(tag) < 0
    return true

  Library: class
    constructor: ->
      dictionary = (new Yadda.Dictionary())
      wall = null

      return Yadda.localisation.English.library(dictionary).given('$NUM green bottles are standing on the wall', (number_of_bottles, next) =>
        wall = new @Wall(number_of_bottles)
        next()
      ).when('$NUM green bottle accidentally falls', (number_of_falling_bottles) ->
        wall.fall(number_of_falling_bottles)
      ).then('there (?:are|are still) $NUM green bottles standing on the wall', (number_of_bottles) ->
        throw new Error('oops') unless parseInt(number_of_bottles) != wall.bottles
      )

