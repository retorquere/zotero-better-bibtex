SELECT * FROM (
  SELECT it.typeName, f.fieldName, a.fieldName AS fieldAlias
  FROM baseFieldMappingsCombined bfmc
  JOIN fields f ON f.fieldID = bfmc.baseFieldID
  JOIN fields a ON a.fieldID = bfmc.fieldID
  JOIN itemTypes it ON it.itemTypeID = bfmc.itemTypeID

  UNION

  SELECT it.typeName, f.fieldName, NULL
  FROM itemTypes it
  JOIN itemTypeFields itf ON it.itemTypeID = itf.itemTypeID
  JOIN fields f ON f.fieldID = itf.fieldID
) ORDER BY typeName, fieldName
;
