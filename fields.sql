SELECT it.typeName, COALESCE(bf.fieldName, f.fieldName) as fieldName, CASE WHEN bf.fieldName IS NULL THEN NULL ELSE f.fieldName END as fieldAlias
FROM itemTypes it
JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
JOIN fields f ON f.fieldID = itf.fieldID
LEFT JOIN baseFieldMappingsCombined bfmc ON it.itemTypeID = bfmc.itemTypeID AND f.fieldID = bfmc.fieldID
LEFT JOIN fields bf ON bf.fieldID = bfmc.baseFieldID
ORDER BY 2
;
