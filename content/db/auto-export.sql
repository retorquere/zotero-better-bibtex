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
        '36a3b0b5-bad0-4a04-b79b-441c7cef77db',
        '0f238e69-043e-4882-93bf-342de007de19',
        'f4b52ab0-f878-4556-85a0-c7aeedd09dfc',
        'ca65189f-8815-4afe-8c8b-8c7c15f0edca',
        'f895aa0d-f28e-47fe-b247-2ea77c6ed583'
      )
    ),

  exportNotes
    CONSTRAINT exportNotes_boolean CHECK (exportNotes IN (0, 1)),

  useJournalAbbreviation
    CONSTRAINT useJournalAbbreviation_boolean CHECK (useJournalAbbreviation IN (0, 1)),

  asciiBibLaTeX
    CONSTRAINT asciiBibLaTeX_boolean CHECK (
      ((translatorID = 'f895aa0d-f28e-47fe-b247-2ea77c6ed583') = (asciiBibLaTeX IS NOT NULL))
      AND
      COALESCE(asciiBibLaTeX, 0) IN (0, 1)
    ),

  biblatexExtendedNameFormat
    CONSTRAINT biblatexExtendedNameFormat_boolean CHECK (
      ((translatorID = 'f895aa0d-f28e-47fe-b247-2ea77c6ed583') = (biblatexExtendedNameFormat IS NOT NULL))
      AND
      COALESCE(biblatexExtendedNameFormat, 0) IN (0, 1)
    ),

  DOIandURL
    CONSTRAINT DOIandURL_domain CHECK (
      ((translatorID IN ('ca65189f-8815-4afe-8c8b-8c7c15f0edca', 'f895aa0d-f28e-47fe-b247-2ea77c6ed583')) = (DOIandURL IS NOT NULL))
      AND
      COALESCE(DOIandURL, 'both') IN ('both', 'doi', 'url')
    ),

  bibtexURL
    CONSTRAINT bibtexURL_domain CHECK (
      ((translatorID = 'ca65189f-8815-4afe-8c8b-8c7c15f0edca') = (bibtexURL IS NOT NULL))
      AND
      COALESCE(bibtexURL, 'off') IN ('off', 'note', 'note-url-ish', 'url', 'url-ish')
    )
)
