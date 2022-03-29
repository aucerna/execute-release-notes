We've added two new formula functions to make it easier to extract/report on parts of an AFE's estimate:

1. `GrossEstimateForAccountFilter`
2. `NetEstimateForAccountFilter`

The following example pulls out just a single account's (`9210.247`) Net estimate amount.

```
NetEstimateForAccountFilter("ACCOUNTNUMBER","9210.247")
```

While this formula sums up the gross estimate for any accounts with a Target Activity Name of "Development".

```
GrossEstimateForAccountFilter("CUSTOM/TARGET_ACTIVITY/NAME","Development")
```