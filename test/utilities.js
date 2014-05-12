Zotero.Utilities.cleanAuthor = function(author, type, useComma) {
    var allCaps = 'A-Z' +
                  '\u0400-\u042f';    //cyrilic

    var allCapsRe = new RegExp('^[' + allCaps + ']+$');
    var initialRe = new RegExp('^-?[' + allCaps + ']$');

    if(typeof(author) != "string") {
      throw "cleanAuthor: author must be a string";
    }

    author = author.replace(/^[\s\u00A0\.\,\/\[\]\:]+/, '')
                    .replace(/[\s\u00A0\.\,\/\[\]\:]+$/, '')
                  .replace(/[\s\u00A0]+/, ' ');

    if(useComma) {
      // Add spaces between periods
      author = author.replace(/\.([^ ])/, ". $1");

      var splitNames = author.split(/, ?/);
      if(splitNames.length > 1) {
        var lastName = splitNames[0];
        var firstName = splitNames[1];
      } else {
        var lastName = author;
      }
    } else {
      var spaceIndex = author.lastIndexOf(" ");
      var lastName = author.substring(spaceIndex+1);
      var firstName = author.substring(0, spaceIndex);
    }

    if(firstName && allCapsRe.test(firstName) &&
        firstName.length < 4 &&
        (firstName.length == 1 || lastName.toUpperCase() != lastName)) {
      // first name is probably initials
      var newFirstName = "";
      for(var i=0; i<firstName.length; i++) {
        newFirstName += " "+firstName[i]+".";
      }
      firstName = newFirstName.substr(1);
    }

    //add periods after all the initials
    if(firstName) {
      var names = firstName.replace(/^[\s\.]+/,'')
            .replace(/[\s\,]+$/,'')
            //remove spaces surronding any dashes
            .replace(/\s*([\u002D\u00AD\u2010-\u2015\u2212\u2E3A\u2E3B])\s*/,'-')
            .split(/(?:[\s\.]+|(?=-))/);
      var newFirstName = '';
      for(var i=0, n=names.length; i<n; i++) {
        newFirstName += names[i];
        if(initialRe.test(names[i])) newFirstName += '.';
        newFirstName += ' ';
      }
      firstName = newFirstName.replace(/ -/g,'-').trim();
    }

    return {firstName:firstName, lastName:lastName, creatorType:type};
  }

Zotero.Utilities.formatDate = function(date, shortFormat) {
    if(shortFormat) {
      var localeDateOrder = getLocaleDateOrder();
      var string = localeDateOrder[0]+"/"+localeDateOrder[1]+"/"+localeDateOrder[2];
      return string.replace("y", (date.year !== undefined ? date.year : "00"))
                   .replace("m", (date.month !== undefined ? 1+date.month : "0"))
                   .replace("d", (date.day !== undefined ? date.day : "0"));
    } else {
      var string = "";

      if(date.part) {
        string += date.part+" ";
      }

      var months = Zotero.Date.getMonths().long;
      if(date.month != undefined && months[date.month]) {
        // get short month strings from CSL interpreter
        string += months[date.month];
        if(date.day) {
          string += " "+date.day+", ";
        } else {
          string += " ";
        }
      }

      if(date.year) {
        string += date.year;
      }
    }

    return string;
  }

Zotero.Utilities.strToDate = Zotero.Date.strToDate;
