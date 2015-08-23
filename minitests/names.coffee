parse = (name) ->
  console.log("Name:   %j", name)
  CSL.parseParticles(name)
  console.log("Parsed: %j", name)

parse(
  family: "Gooding, Jr."
  given:  "Cuba"
)
parse(
  family: "Gooding"
  given:  "Cuba, Jr."
)
parse(
  family: "Humboldt",
  given : "Alexander von"
)
parse(
  given: "François Hédelin"
  family: "abbé d’Aubignac"
)
parse(
  family: 'Aubignac'
  given: "François Hédelin, abbé d'"
)
parse(
  family: "La Fontaine"
  given: "Jean de"
)
parse(
  family: "von Hicks"
  given: "Michael, III"
)
parse(
  given: "Jens, Forstædernes Tænketank",
  family: "Kvorning",
)
