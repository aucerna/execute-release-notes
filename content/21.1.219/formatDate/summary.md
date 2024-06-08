The new `FormatDate` function enables you to convert a date field to text in a specified format (and time-zone). 

For example, this formula converts the START_DATE to the America/Edmonton time-zone and then formats it as a long format date/time field (i.e. 2022-12-23 11:30:00 PM).

```
FormatDate([START_DATE], "yyyy-MM-dd hh:mm:ss tt", "America/Edmonton")
```

This formula converts the START_DATE to the UTC and then formats it as a date only (i.e. 2022-12-23).

```
FormatDate([START_DATE], "yyyy-MM-dd", "UTC")
```

You can find documentation on date format strings [here](https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings).