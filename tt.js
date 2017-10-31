const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const fs = require('fs')

var xml = fs.readFileSync('resource/bibtex/biblatex.qr.bcf', 'utf8')
var doc = new dom().parseFromString(xml)
var select = xpath.useNamespaces({"bcf": "https://sourceforge.net/projects/biblatex"});

const schemas = {}
var all = null

for (const type of select("//bcf:entrytype", doc)) {
  schemas[type.textContent] = {
    type: 'object',
    additionalProperties: false
  }
}

for (const node of select("//bcf:entryfields", doc)) {
  var isAll = true;
  var allowed = select('./bcf:field', node).map(field => field.textContent)

  for (const type of select('./bcf:entrytype', node)) {
    schemas[type.textContent].properties = allowed.reduce((acc, field) => { acc[field] = { type: 'object' }; return acc }, {})
    isAll = false;
  }

  if (isAll) {
    all = allowed
  }
}

for (const [type, allowed] of Object.entries(schemas)) {
  for (const field of all) {
    schemas[type].properties = schemas[type].properties || {}
    schemas[type].properties[field] = { type: 'object' }
  }
}

function addConstraint(typeSchema, constraint) {
  var fields

  if (constraint.localName == 'fieldxor') {
    fields = Array.from(constraint.childNodes).filter(child => child.localName).map(field => field.textContent)
    typeSchema.allOf = (typeSchema.allOf || []).concat({
      oneOf: fields.map(field => { return { required: [ field ] } })
    })
  }

  else if (constraint.localName == 'fieldor') {
    fields = Array.from(constraint.childNodes).filter(child => child.localName).map(field => field.textContent)
    typeSchema.allOf = (typeSchema.allOf || []).concat({
      anyOf: fields.map(field => { return { required: [ field ] } })
    })
  }

  else if (constraint.localName) {
    fields = [constraint.textContent]
    typeSchema.required = (typeSchema.required || []).concat(constraint.textContent);
  }

  else return

  for (const field of fields) {
    typeSchema.properties = typeSchema.properties || {}
    typeSchema.properties[field] = { type: 'object' }
  }
}

for (const constraints of select('.//bcf:constraints', doc)) {
  for (var type of select('./bcf:entrytype', constraints)) {
    type = type.textContent

    for (var constraint of select('./bcf:constraint', constraints)) {
      if (constraint.getAttribute('type') != 'mandatory') continue

      for (const field of Array.from(constraint.childNodes)) {
        addConstraint(schemas[type], field)
      }
    }
  }
}

fs.writeFileSync('biblatex.schema.json', JSON.stringify(schemas, null, 2));

var Ajv = require('ajv'); // version >= 4.7.4
var ajv = new Ajv({sourceCode: true}); // this option is required
var pack = require('ajv-pack');

for (const [type, schema] of Object.entries(schemas)) {
  console.log(type)
  var validate = ajv.compile(schema);
  var moduleCode = pack(ajv, validate);

  fs.writeFileSync(`biblatex.${type}.schema.js`, moduleCode);
}
