select distinct it.typeName, f.fieldName
from itemtypefields itf
join itemtypes it on itf.itemTypeID = it.itemTypeID
join fields f on itf.fieldID = f.fieldID
where f.fieldname in ('journalAbbreviation', 'reporter', 'code')
;
