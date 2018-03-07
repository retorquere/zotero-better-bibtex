# Configuration

The Better BibTeX Configuration can be found under the regular Zotero preferences pane, tab 'Better Bib(La)TeX'.

The configuration of Better BibTeX is a little baroque compared to the standard Zotero Bib(La)TeX exporters (which only have hidden preferences). The defaults should just work, but here's an attempt to describe what they do.

**Making any change here will drop your entire export cache.** This is usually not a problem unless you have a really large library, but you can read about what is involved [here](performance).

{% for tab in site.data.configuration %}

## {{ tab.name }}

{{ tab.description }}

  {% for pref in tab.preferences %}

### {{ pref[0] }}

default: `{{ pref[1].default }}`

{{ pref[1].description }}

    {% if pref[1].options %}

Options:

      {% for option in pref[1].options %}
        * {{ options }}
      {% endfor %}

    {% endif %}

  {% endfor %}

{% endfor %}
