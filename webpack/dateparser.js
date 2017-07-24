const path = require('path');
const fs = require('fs');
const parse = require('xml-parser');

module.exports = function(srcdir, tgt) {
  var result = {
    months: {},
    dateOrder: {},
    month: {}
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
      let name = month.content.toLowerCase().replace(/\./g, '').trim();
      if (name.match(/^[0-9]+$/)) { return; }
      if (result.month[name]) { console.log(`ignoring ${month.attributes.name} ${name}`); return }
      result.month[name] = translate[month.attributes.name];
    })
  })

  /*
  Object.keys(locales['language-names']).forEach(full => {
    locales['language-names'][full].forEach(name => {
      result.months[name] = result.months[full];
    })
  })
  */

  fs.writeFileSync(tgt, JSON.stringify(result, null, 2));
}
