function TableOfContents(tocId, containerId) {
	var style = 'display: block; height: 115px; margin-top: -115px; visibility: hidden;'

  var toc = document.getElementById(tocId);
  toc.innerHTML = '';
  var container = containerId ? document.getElementById(containerId) : toc.parentElement;
  var headings = [].slice.call(container.querySelectorAll('h2, h3, h4, h5, h6'));

  var closeLevel = function(e, levels) {
    for (var i = 0; i < levels && e.parentElement && e.parentElement.parentElement; i++) {
      e = e.parentElement.parentElement;
    }
    return e;
  };

  var createLiWithAnchor = function(anchor, heading) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = window.location.href.replace(/#.*/, '') + '#' + anchor;
    a.textContent = heading.textContent;
    li.appendChild(a);

    var anchorElement = document.createElement('a');
    // anchorElement.className = 'anchor';
    anchorElement.setAttribute('name', anchor);
    anchorElement.setAttribute('style', style);

    var span = document.createElement('span');
    if (heading.tagName === 'H2') span.className = 'hero is-info'
    if (heading.tagName === 'H3') span.className = 'hero is-light'
    span.setAttribute('style', 'width: 100%; display: inline-block;')
    Array.from(heading.childNodes).forEach(function(node) { span.appendChild(node) })

    heading.appendChild(anchorElement)
    heading.appendChild(span)

    return li;
  };

  var prevLevel = 0;
  var root, curr;
  headings.forEach(function (heading, index) {
    var tag = heading.tagName.toLowerCase();
    var curLevel = parseInt(tag.replace(/[^\d]/i, '')) - 1; // get number from h2, h3,... tags
    var anchor = heading.getAttribute('id') || heading.textContent.replace(/\r?\n|\r/g, '').replace(/\s/g, '_'); // remove all new lines and replace spaces with underscore
    var li = createLiWithAnchor(anchor, heading);
    if (curLevel > prevLevel) {
      // open 1 ul and add 1 li
      if (!curr) {
        root = document.createElement('ul');
        root.appendChild(li);
				root.className = 'menu-list';
      } else {
        var ul = document.createElement('ul');
				ul.className = 'menu-list';
        ul.appendChild(li);
        curr.appendChild(ul);
      }
    } else if (curLevel === prevLevel) {
      // add 1 new li next to current li
      curr.parentElement.appendChild(li);
    } else if (curLevel < prevLevel) {
      // close n ul, add one 1 li as a sibling of the ancestor
      var ancestor = closeLevel(curr, prevLevel - curLevel);
      ancestor.parentElement.appendChild(li);
    }
    curr = li;
    prevLevel = curLevel;
  });
  if (root) toc.appendChild(root);
}
