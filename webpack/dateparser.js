const path = require('path');
const fs = require('fs');
const parse = require('xml-parser');
const punycode = require('punycode')

function uchar(cp) {
  if (cp >= 0x20 && cp <= 0x7E) return String.fromCharCode(cp);
  return "\\u" + ('0000' + cp.toString(16)).slice(-4)
}

function normalized(str) {
  return '"' + punycode.ucs2.decode(str).map(function(cp) { return uchar(cp) }).join('') + '"';
}

module.exports = function(srcdir, tgt) {
  var result = {
    // map: {}
  };

  var translate = {
		'month-01': 'january',
		'month-02': 'february',
		'month-03': 'march',
		'month-04': 'april',
		'month-05': 'may',
		'month-06': 'june',
		'month-07': 'july',
		'month-08': 'august',
		'month-09': 'september',
		'month-10': 'october',
		'month-11': 'november',
		'month-12': 'december',
		'season-01': 'spring',
		'season-02': 'summer',
		'season-03': 'autumn',
		'season-04': 'winter',
	};

  /*
  var keys = Object.keys(translate)
  keys.sort()
  result.english = keys.map(function(k) { return translate[k]; })
  */

  var locales = require(path.join(srcdir, 'locales.json'));

  Object.keys(locales['primary-dialects']).forEach(short => {
    let full = locales['primary-dialects'][short];

    let locale = fs.readFileSync(path.join(srcdir, `locales-${full}.xml`), 'utf8');
    locale = parse(locale);

    // let order = locale.root.children.find(e => e.name == 'date' && e.attributes.form == 'numeric').children.map(e => e.attributes.name[0]).join('');
    // result.dateOrder[full.toLowerCase()] = result.dateOrder[short.toLowerCase()] = order;

    // let months = locale.root.children.find(e => e.name == 'terms').children.filter(e => e.attributes.name.startsWith('month-') && !e.attributes.form);
    // months.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name.localeCompare));
    // months = months.map(m => m.content);
    // result.months[full] = months;

    months = locale.root.children.find(e => e.name == 'terms').children.filter(e => e.attributes.name.startsWith('month-') || e.attributes.name.startsWith('season-'));
    months.forEach(function(month) {
      let name = month.content.toLowerCase().replace(/\./g, '').trim().normalize('NFKC');
      if (name.match(/^[0-9]+$/)) { return; }
      if (result[name] && result[name] != translate[month.attributes.name]) { console.log(`ignoring ${month.attributes.name} ${name}`); return }
      result[name] = translate[month.attributes.name];
    })
  })
  // result.names = Object.keys(result.map);
  // result.names.sort(function(a, b) { return b.length - a.length })

  /*
  Object.keys(locales['language-names']).forEach(full => {
    locales['language-names'][full].forEach(name => {
      result.months[name] = result.months[full];
    })
  })
  */

  fs.writeFileSync(tgt, JSON.stringify(result, null, 2));
  // fs.writeFileSync(tgt, script, {encoding: 'ucs2'});
}
