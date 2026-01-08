SELECT item.itemID
FROM items item
WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
  AND item.itemID NOT IN (SELECT itemID FROM feedItems)
  AND item.itemTypeID NOT IN (
    SELECT itemTypeID
    FROM itemTypes
    WHERE typeName IN ('attachment', 'note', 'annotation')
  );

INSERT OR REPLACE INTO betterbibtex.citationkey (itemID, itemKey, libraryID, citationKey, pinned)
WITH
  ExtractKey AS (
    SELECT item.itemID, item.key as itemKey, item.libraryID,
      MAX(CASE WHEN f.fieldName = 'citationKey' THEN idv.value END) AS fromNative,
      MAX(CASE
          WHEN f.fieldName = 'extra' THEN
            (SELECT
               TRIM(SUBSTR(
                 SUBSTR(val, INSTR(val, CHAR(10) || 'citation key:') + 14),
                 1,
                 CASE
                   WHEN INSTR(SUBSTR(val, INSTR(val, CHAR(10) || 'citation key:') + 14), CHAR(10)) > 0
                   THEN INSTR(SUBSTR(val, INSTR(val, CHAR(10) || 'citation key:') + 14), CHAR(10)) - 1
                   ELSE LENGTH(val)
                 END
               ))
             FROM (SELECT CHAR(10) || idv.value AS val)
             WHERE INSTR(val, CHAR(10) || 'citation key:') > 0
            )
      END) AS fromExtra
    FROM items item
    LEFT JOIN itemData id ON item.itemID = id.itemID
    LEFT JOIN fields f ON id.fieldID = f.fieldID AND f.fieldName IN ('extra', 'citationKey')
    LEFT JOIN itemDataValues idv ON id.valueID = idv.valueID
    WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
      AND item.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
      AND item.itemID NOT IN (SELECT itemID from feedItems)
    GROUP BY item.itemID
  )
SELECT itemID, itemKey, libraryID, COALESCE(fromNative, fromExtra) AS citationKey, 1
FROM ExtractKey
WHERE fromExtra IS NOT NULL OR fromNative IS NOT NULL;
