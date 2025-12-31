ALTER TABLE betterbibtex.citationkey
ADD COLUMN lastPinned
--
UPDATE tableName SET lastPinned = citationKey WHERE pinned = 1;
