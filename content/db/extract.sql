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
WITH PreparedItems AS (
    SELECT
        item.itemID,
        item.key AS itemKey,
        item.libraryID,
        f.fieldName,
        idv.value AS rawValue,
        -- Normalize for search: prepend newline, lowercase, and remove carriage returns
        CHAR(10) || LOWER(REPLACE(idv.value, CHAR(13), '')) AS searchVal,
        -- Normalize for extraction: prepend newline and remove carriage returns (keep casing)
        CHAR(10) || REPLACE(idv.value, CHAR(13), '') AS extractVal
    FROM items item
    LEFT JOIN itemData id ON item.itemID = id.itemID
    LEFT JOIN fields f ON id.fieldID = f.fieldID AND f.fieldName IN ('extra', 'citationKey')
    LEFT JOIN itemDataValues idv ON id.valueID = idv.valueID
    WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
      AND item.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
      AND item.itemID NOT IN (SELECT itemID FROM feedItems)
),
Extracted AS (
    SELECT
        itemID, itemKey, libraryID,
        NULLIF(MAX(CASE WHEN fieldName = 'citationKey' THEN rawValue END), '') AS fromNative,
        NULLIF(MAX(CASE
            WHEN fieldName = 'extra' AND INSTR(searchVal, CHAR(10) || 'citation key:') > 0
            THEN
                TRIM(SUBSTR(
                    SUBSTR(extractVal, INSTR(searchVal, CHAR(10) || 'citation key:') + 14),
                    1,
                    CASE
                        WHEN INSTR(SUBSTR(searchVal, INSTR(searchVal, CHAR(10) || 'citation key:') + 14), CHAR(10)) > 0
                        THEN INSTR(SUBSTR(searchVal, INSTR(searchVal, CHAR(10) || 'citation key:') + 14), CHAR(10)) - 1
                        ELSE LENGTH(extractVal)
                    END
                ))
        END), '') AS fromExtra
    FROM PreparedItems
    GROUP BY itemID
)
SELECT itemID, itemKey, libraryID, COALESCE(fromNative, fromExtra), 1
FROM Extracted
WHERE fromNative IS NOT NULL OR fromExtra IS NOT NULL;
