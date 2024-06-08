We've added some calculated field helper functions to fetch data from tables:

These functions are broken into two parts:

1. **Find a row** - return the "ID" for the row you'd like to retrieve a value from
2. **Retrieve a value** - given the "ID" for a row, retrieve the value of a specified field

**Find a row functions:**

* `TableGetRow("TABLE","FIELDPATH","FIELDVALUE")` - returns ID of the row where FIELDPATH = FIELDVALUE
* `TableGetMinDateRow("TABLE","DATEFIELD")` - returns ID of the row with minimum date in DATEFIELD
* `TableGetMaxDateRow("TABLE","DATEFIELD")` - returns ID of the row with max date in DATEFIELD
* `TableGetMinRow("TABLE","NUMFIELD")` - returns ID of the row with minimum numeric value in NUMFIELD
* `TableGetMaxRow("TABLE","NUMFIELD")` - returns ID of the row with maximum numeric value in NUMFIELD

All of the above return the text "MULTIPLE" if there are multiple matched rows.

**Retrieve a value functions:**

* `TableGetText("TABLE","ROW ID","FIELD")`  - returns the value of a TEXT field
* `TableGetDecimal("TABLE","ROW ID","FIELD")` - returns the value of a DECIMAL field
* `TableGetInteger("TABLE","ROW ID","FIELD")` - returns the value of an INTEGER field
* `TableGetBoolean("TABLE","ROW ID","FIELD")` - returns the value of a BOOLEAN (Yes/No) field
* `TableGetDate("TABLE","ROW ID","FIELD")` - returns the value of a DATE field

If "MULTIPLE" is passed in as the Row ID, the above functions return Null

**Examples:**

The following returns the ID of well with DESCRIPTION = "test"

```
tablegetrow("WELL","DESCRIPTION","test")
```

The following returns the ID of well with Custom PARNTER name of "Arctic..." (i.e. can peak into fields on document references)

```
tablegetrow("WELL","CUSTOM/PARTNER/COMNAME","Arctic Canada Ltd.")
```

The following returns the of the primary well (boolean checking)

```
tablegetrow("WELL","ISPRIMARY","True")
```

The following shows how you can chain functions together to get the Company Name value (custom field on the AFE's Well) from the Primary Well.

```
tablegettext("WELL", tablegetrow("WELL","ISPRIMARY","True"), "CUSTOM/PARTNER/COMNAME")
```

In this example, we return the Contract Number for the contract (custom table) with the most recent contract date. (Note: if two contracts share the same latest date, nothing will be returned).

```
tablegettext("CUSTOM/CONTRACTS", tablegetmaxdaterow("CUSTOM/CONTRACTS","CONTRACT_DATE), "CONTRACT_NUMBER")
```