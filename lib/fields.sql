SELECT bf.fieldName, it.typeName, f.fieldName
FROM baseFieldMappingsCombined bfmc
join fields bf on bf.fieldID = bfmc.baseFieldID
join fields f on f.fieldID = bfmc.fieldID
join itemTypes it on it.itemTypeID = bfmc.itemTypeID
order by it.typeName, bf.fieldName
;
