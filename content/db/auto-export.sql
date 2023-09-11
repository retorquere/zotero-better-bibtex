CREATE TABLE betterbibtex.autoExport (
  type
    CONSTRAINT type_domain CHECK (type IN ('library', 'collection')),
  id NOT NULL,
  path NOT NULL UNIQUE,
  status
    CONSTRAINT status_domain CHECK (status in ('scheduled', 'running', 'done', 'error')),
  recursive
    CONSTRAINT recursive_boolean CHECK (recursive IN (0, 1)),
  error NOT NULL,
  updated NOT NULL,

  translatorID
    CONSTRAINT translatorID_domain CHECK (
      translatorID IN (
        'BetterBibTeX JSON',
        'Better CSL YAML',
        'Better CSL JSON',
        'Better BibTeX',
        'Better BibLaTeX'
      )
    ),

  exportNotes
    CONSTRAINT exportNotes_boolean CHECK (exportNotes IN (0, 1)),

  useJournalAbbreviation
    CONSTRAINT useJournalAbbreviation_boolean CHECK (useJournalAbbreviation IN (0, 1)),

  asciiBibLaTeX
    CONSTRAINT asciiBibLaTeX_boolean CHECK (
      ((translatorID = 'Better BibLaTeX') = (asciiBibLaTeX IS NOT NULL))
      AND
      COALESCE(asciiBibLaTeX, 0) IN (0, 1)
    ),

  biblatexExtendedNameFormat
    CONSTRAINT biblatexExtendedNameFormat_boolean CHECK (
      ((translatorID = 'Better BibLaTeX') = (biblatexExtendedNameFormat IS NOT NULL))
      AND
      COALESCE(biblatexExtendedNameFormat, 0) IN (0, 1)
    ),

  DOIandURL
    CONSTRAINT DOIandURL_domain CHECK (
      ((translatorID IN ('Better BibTeX', 'Better BibLaTeX')) = (DOIandURL IS NOT NULL))
      AND
      COALESCE(DOIandURL, 'both') IN ('both', 'doi', 'url')
    ),

  bibtexURL
    CONSTRAINT bibtexURL_domain CHECK (
      ((translatorID = 'Better BibTeX') = (bibtexURL IS NOT NULL))
      AND
      COALESCE(bibtexURL, 'off') IN ('off', 'note', 'note-url-ish', 'url', 'url-ish')
    )
)
