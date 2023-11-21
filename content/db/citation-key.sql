CREATE TABLE IF NOT EXISTS betterbibtex.citationkey (
  itemID NOT NULL PRIMARY KEY,
  itemKey NOT NULL,
  libraryID NOT NULL,
  citationKey NOT NULL CHECK (citationKey <> ''),
  pinned CHECK (pinned in (0, 1)),
  UNIQUE (libraryID, itemKey)
)
--
CREATE INDEX IF NOT EXISTS betterbibtex.citationkey_itemKey ON citationkey(itemKey)
--
CREATE INDEX IF NOT EXISTS betterbibtex.citationkey_libraryID_itemKey ON citationkey(libraryID, itemKey)
--
CREATE INDEX IF NOT EXISTS betterbibtex.citationkey_citationkey ON citationkey(citationKey)
