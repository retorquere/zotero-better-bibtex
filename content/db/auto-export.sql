CREATE TABLE betterbibtex.autoExport (
  type CHECK (type IN ('library', 'collection')),
  id NOT NULL,
  path NOT NULL UNIQUE,
  status CHECK (status in ('scheduled', 'running', 'done', 'error')),
  recursive CHECK (recursive IN (0, 1)),
  error NOT NULL,
  updated NOT NULL,

  translatorID CHECK (
    translatorID IN (
      'BetterBibTeX JSON',
      'Better CSL YAML',
      'Better CSL JSON',
      'Better BibTeX',
      'Better BibLaTeX'
    )
  ),

  exportNotes CHECK (exportNotes IN (0, 1)),
  useJournalAbbreviation CHECK (useJournalAbbreviation IN (0, 1)),

  asciiBibLaTeX CHECK (
    (asciiBibLaTeX IN (0, 1) AND translatorID IN ('Better BibLaTeX'))
    OR
    (asciiBibLaTeX IS NULL AND translatorID NOT IN ('Better BibLaTeX'))
  ),
  biblatexExtendedNameFormat CHECK (
    (biblatexExtendedNameFormat IN (0, 1) AND translatorID IN ('Better BibLaTeX'))
    OR
    (biblatexExtendedNameFormat IS NULL AND translatorID NOT IN ('Better BibLaTeX'))
  ),
  DOIandURL CHECK (
    (DOIandURL IN (0, 1) AND translatorID IN ('Better BibTeX', 'Better BibLaTeX'))
    OR
    (DOIandURL IS NULL AND translatorID NOT IN ('Better BibTeX', 'Better BibLaTeX'))
  ),
  bibtexURL CHECK (
    (bibtexURL IN (0, 1) AND translatorID IN ('Better BibTeX'))
    OR
    (bibtexURL IS NULL AND translatorID NOT IN ('Better BibTeX'))
  )
)
