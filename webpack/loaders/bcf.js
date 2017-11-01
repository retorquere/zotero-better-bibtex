const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const fs = require('fs')
const jsesc = require('jsesc');
const _ = require('lodash');
const ejs = require('ejs');
const dedent = require('dedent-js');

module.exports = function(source) {
  var doc = new dom().parseFromString(source)
  var select = xpath.useNamespaces({"bcf": "https://sourceforge.net/projects/biblatex"});
  
  var BCF = {
    // combinations fo allowed fields
    fieldSet: {},
  
    // per type, array of fieldset names that make up the allowed fields for this type
    allowed: {},
  
    // combinations of required fields and the types they apply to
    required: {}
  };
  
  // get all the possible entrytypes and apply the generic fields
  for (const type of select("//bcf:entrytypes/bcf:entrytype", doc)) {
    BCF.allowed[type.textContent] = ['optional']
  }
  
  // gather the fieldsets
  for (const node of select("//bcf:entryfields", doc)) {
    var types = select('./bcf:entrytype', node).map(type => type.textContent).sort()
  
    var setname = types.length == 0 ? 'optional' : 'optional_' + types.join('_');
    if (BCF.fieldSet[setname]) throw new Error(`field set ${setname} exists`);
  
    // find all the field names allowed by this set
    BCF.fieldSet[setname] = new Set(select('./bcf:field', node).map(field => field.textContent))
  
    // assign the fieldset to the types it applies to
    for (const type of types) {
      if (!BCF.allowed[type]) {
        throw new Error(`Unknown reference type ${type}`)
      } else {
        BCF.allowed[type] = _.uniq(BCF.allowed[type].concat(setname))
      }
    }
  }
  
  for (const node of select('.//bcf:constraints', doc)) {
    var mandatory = select(".//bcf:constraint[@type='mandatory']", node);
    switch (mandatory.length) {
      case 0:
        continue
      case 1:
        mandatory = mandatory[0]
        break
      default:
        throw new Error(`found ${mandatory.length} constraints, expected 1`)
    }
  
    var types = select('./bcf:entrytype', node).map(type => type.textContent).sort()
    if (!types.length) throw new Error(`constraint has no types`)
  
    var setname = 'required_' + types.join('_')
    if (BCF.fieldSet[setname] || BCF.required[setname]) throw new Error(`constraint set ${setname} exists`);
  
    // find all the field names allowed by this set
    BCF.fieldSet[setname] = new Set(select('.//bcf:field', node).map(field => field.textContent))
  
    // allow the fields that are required
    for (const type of types) {
      if (!BCF.allowed[type]) {
        throw new Error(`Unknown reference type ${type}`)
      } else {
        BCF.allowed[type] = _.uniq(BCF.allowed[type].concat(setname))
      }
    }
  
    BCF.required[setname] = { types, fields: []}
  
    for (const constraint of Array.from(mandatory.childNodes)) {
      switch (constraint.localName || '#text') {
        case '#text':
          break
  
        case 'field':
          BCF.required[setname].fields.push(constraint.textContent)
          break
  
        case 'fieldor':
        case 'fieldxor':
          BCF.required[setname].fields.push({
            [constraint.localName.replace('field', '')]: select('./bcf:field', constraint).map(field => field.textContent)
          })
          break
  
        default:
          throw new Error(`Unexpected constraint type ${constraint.localName}`)
      }
    }
  }
  
  var template = dedent(`
    const fieldSet = ${jsesc(BCF.fieldSet, { compact: false, indent: '  ' })};
    const allowed = {
    <%_ for (const [type, sets] of Object.entries(allowed)) { -%>
      <%= type -%>: [
        <%_ for (const set of sets) { -%>
          fieldSet.<%= set -%>,
        <%_ }; -%>
      ],
    <%_ }; -%>
    };
    const required = [
      <%_ for (const [, {types, fields}] of Object.entries(required)) { -%>
        {
          types: new Set(<%- JSON.stringify(types) -%>),
          check: function(ref, report) {
            <%_ for (const field of fields) { -%>
              <%_ if (typeof field == 'string') { -%>
                if (!ref.has.<%= field -%>) report.push("Missing required field '<%= field -%>'")
              <%_ } else if (field.or) { -%>
                if (!(<%- field.or.map(field => "this.has." + field).join(' || ') -%>)) report.push("At least one of <%- field.or.map(f => "'" + f + "'").join(' / ') -%> must be present")
              <%_ } else if (field.xor) { -%>
                if (!ref.has.<%= field.xor[0] -%> === !ref.has.<%= field.xor[1] -%>) report.push("Exactly one of <%- field.xor.map(f => "'" + f + "'").join(' / ') -%> must be present")
              <%_ } -%>
            <%_ } -%>
          }
        },
      <%_ } -%>
    ];
    
    module.exports = function(explanation) {
      var type = this.referencetype.toLowerCase();
    
      if (!allowed[type]) return;
    
      var unexpected = Object.keys(this.has).filter(field => !allowed[type].find(set => set.has(field)));
      var report = unexpected.map(field => "Unexpected field '" + field + "'" + (explanation[field] ? (' (' + explanation[field] + ')'): ''))
    
      for (const test of required) {
        if (test.types.has(type)) test.check(this, report)
      }
    
      return report;
    }
  `);
  
  return ejs.render(template, BCF);
}
