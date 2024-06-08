We've added some new functions to provide more options when building calculated fields against a subset of the data in a table.

* TableMaxDateFiltered - return the maximum date from a filtered subset of the rows in a table
* TableMinDateFiltered - return the minimum date from a filtered subset of the rows in a table
* TableMaxFiltered - return the maximum number from a filtered subset of the rows in a table
* TableMinFiltered - return the minimum number from a filtered subset of the rows in a table
* TableSumFiltered - return the sum of a numeric field on a filtered subset of the rows in a table
* TableCountFiltered - return the count of a filtered subset of the rows in a table

All of the above work like their non-filtered counterparts, but introduce two new parameters:

1. `filterPath` - is the path to a field on the table row that we are going to use to filter the rows.
2. `filterValue` - is a text value that we are going to compare to the value of the field in `filterPath`.  The function will only process/include rows where the `filterValue` is a match to the `filterPath` value.

For example:

If I have a custom table for tracking Contract details (`CUSTOM/CONTRACTS`) and I wanted to return the most recent contract date (`CUSTOM/CONTRACTS/CONTRACT_DATE`) for any "Land"-type contract (`CUSTOM/CONTRACTS/CONTRACT_TYPE` = "Land"), I would use a formula like this:

```
TableMaxDateFiltered("CUSTOM/CONTRACTS","CONTRACT_DATE","CONTRACT_TYPE","Land")
```

(note: the fields above must be enclosed in quotes and not square brackets in this case.)
