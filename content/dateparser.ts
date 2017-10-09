import edtf = require('edtf');
import edtfy = require('edtfy');
import debug = require('./debug.ts');
// import escapeStringRegexp = require('escape-string-regexp')

const months = require('../gen/dateparser-data.json');
const months_re = new RegExp(Object.keys(months).sort((a, b) => b.length - a.length).join('|'), 'i');

/*
regex = {
  My: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{3,})$', 'i'),
  Mdy: new RegExp('^(' + months.english.join('|') + ')\\s([0-9]{1,2})\\s*,\\s*([0-9]{3,})$', 'i'),
  dMy: new RegExp('^([0-9]{1,2})\\.?\\s+(' + months.english.join('|') + ')\\s+([0-9]{3,})$', 'i'),
}
*/

function normalize_edtf(date) {
  const spring = 21;
  const winter = 24;
  switch (date.type) {
    case 'Date':
      const year = date.values[0];
      const month = typeof date.values[1] === 'number' ? date.values[1] + 1 : undefined;
      const day = date.values[2]; // tslint:disable-line:no-magic-numbers
      return { type: 'date', year, month, day, approximate: date.approximate || !!date.unspecified, uncertain: date.uncertain };

//    when 'Set'
//      if date.values.length == 1
//        return { type: 'set', orig: { type: 'date', year: date.values[0].values[0] } }

    case 'Interval':
      // tslint:disable-next-line:no-magic-numbers
      if (date.values.length !== 2) throw new Error(JSON.stringify(date));
      const from = date.values[0] ? normalize_edtf(date.values[0]) : { type: 'open' };
      const to = date.values[1] ? normalize_edtf(date.values[1]) : { type: 'open' };
      return { type: 'interval', from, to };

    case 'Season':
      if (date.values[1] < spring || date.values[1] > winter) throw new Error(`Unexpected season ${date.values[1]}`);
      return { type: 'season', year: date.values[0], season: ['spring', 'summer', 'autumn', 'winter'][date.values[1] - spring] };

    case 'List':
      return { type: 'list', dates: date.values.map(normalize_edtf) };

    default:
      throw new Error(JSON.stringify(date));
  }
}

function parse_edtf(date) {
  try {
    return normalize_edtf(edtf.parse(edtfy(date.replace(/\. /, ' ')))); // 8. july 2011
  } catch (err) {}

  try {
    return normalize_edtf(edtf.parse(date.replace('?~', '~').replace(/u/g, 'X')));
  } catch (err) {}

  return false;
}

export = function parse(raw) {
  let day, m, month, year;
  const december = 12;

  debug('dateparser: parsing', raw);

  if (raw.trim() === '') return {type: 'open'};

  for (const sep of ['--', '-', '/', '_']) {
    // tslint:disable-next-line:no-magic-numbers
    if ((m = raw.split(sep)).length === 2) { // potential range
      // tslint:disable-next-line:no-magic-numbers
      if (((m[0].length > 2) || ((sep === '/') && (m[0].length === 0))) && ((m[1].length > 2) || ((sep === '/') && (m[1].length === 0)))) {
        const from = parse(m[0]); // tslint:disable-line:no-magic-numbers
        const to = parse(m[1]);   // tslint:disable-line:no-magic-numbers
        if (['date', 'open'].includes(from.type) && ['date', 'open'].includes(to.type)) return { type: 'interval', from, to };
      }
    }
  }

  const cleaned = raw.normalize('NFC').replace(months_re, (_ => months[_.toLowerCase()]));
  debug('dateparser:', raw, 'cleaned up to', cleaned);

  const trimmed = cleaned.trim().replace(/(\s+|T)[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|\+[0-9]{2}:?[0-9]{2})?$/, '').toLowerCase();

//  if m = regex.dMy.exec(trimmed)
//    year = parseInt(m[3])
//    day = parseInt(m[1])
//    month = months.english.indexOf(m[2]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month, day }

//  if m = regex.Mdy.exec(trimmed)
//    year = parseInt(m[3])
//    day = parseInt(m[2])
//    month = months.english.indexOf(m[1]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month, day }

//  if m = regex.My.exec(trimmed)
//    year = parseInt(m[2])
//    month = months.english.indexOf(m[1]) + 1
//    month += 8 if month > december
//    return { type: 'date', year, month }

  if (m = /^(-?[0-9]{3,})-([0-9]{2})-([0-9]{2})T/.exec(trimmed)) {
    year = parseInt(m[1]);  // tslint:disable-line:no-magic-numbers
    month = parseInt(m[2]); // tslint:disable-line:no-magic-numbers
    day = parseInt(m[3]);   // tslint:disable-line:no-magic-numbers
    return { type: 'date', year, month, day };
  }

  if (m = /^(-?[0-9]{3,})([-\/\.])([0-9]{1,2})(\2([0-9]{1,2}))?$/.exec(trimmed)) {
    year = parseInt(m[1]);                    // tslint:disable-line:no-magic-numbers
    month = parseInt(m[3]);                   // tslint:disable-line:no-magic-numbers
    day = m[5] ? parseInt(m[5]) : undefined;  // tslint:disable-line:no-magic-numbers
    if (day && (month > december) && (day < december)) [day, month] = [month, day];
    return { type: 'date', year, month, day };
  }

  if (m = /^([0-9]{1,2})([-\/\. ])([0-9]{1,2})([-\/\. ])([0-9]{3,})$/.exec(trimmed)) {
    year = parseInt(m[5]);  // tslint:disable-line:no-magic-numbers
    month = parseInt(m[3]); // tslint:disable-line:no-magic-numbers
    day = parseInt(m[1]);   // tslint:disable-line:no-magic-numbers
    if (m[1] === '/') [day, month] = [month, day]; // silly yanks
    if ((month > december) && (day < december)) [day, month] = [month, day];
    return { type: 'date', year, month, day };
  }

  if (m = /^([0-9]{1,2})[-\/\.]([0-9]{3,})$/.exec(trimmed)) {
    year = parseInt(m[2]);   // tslint:disable-line:no-magic-numbers
    month = parseInt(m[1]);  // tslint:disable-line:no-magic-numbers
    return { type: 'date', year, month };
  }

  if (m = /^([0-9]{3,})[-\/\.]([0-9]{1,2})$/.exec(trimmed)) {
    year = parseInt(m[1]);   // tslint:disable-line:no-magic-numbers
    month = parseInt(m[2]);  // tslint:disable-line:no-magic-numbers
    return { type: 'date', year, month };
  }

//  if m = /^(-?[0-9]{3,})([?~]*)$/.exec(trimmed)
//    return { type: 'date', year: parseInt(m[1]), approximate: m[2].indexOf('~') >=0, uncertain: m[2].indexOf('?') >= 0 }

  if (m = /^\[(-?[0-9]+)\]$/.exec(trimmed)) {
    // 704
    // return { type: 'date', orig: { type: 'date', year: parseInt(m[1]) } }
    return { type: 'verbatim', verbatim: raw };
  }

  if (m = /^\[(-?[0-9]+)\]\s*(-?[0-9]+)$/.exec(trimmed)) {
    return {
      type: 'date',
      year: parseInt(m[2]),                         // tslint:disable-line:no-magic-numbers
      orig: { type: 'date', year: parseInt(m[1]) }, // tslint:disable-line:no-magic-numbers
    };
  }

  if (m = /^(-?[0-9]+)\s*\[(-?[0-9]+)\]$/.exec(trimmed)) {
    return {
      type: 'date',
      year: parseInt(m[1]),
      orig: { type: 'date', year: parseInt(m[2]) }, // tslint:disable-line:no-magic-numbers
    };
  }

  const parsed = parse_edtf(cleaned);
  return parsed || { type: 'verbatim', verbatim: raw };
};
