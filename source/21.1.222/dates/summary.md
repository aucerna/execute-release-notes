Most dates in Execute are actually Date + Time and those come with automatic timezone conversions.  Sometimes, however, you just want a plain old date that will always show the same thing regardless of what timezone you are in.  For that, we've added a new `Unzoned Date/Time` setting to Date Fields in the Field Configuration screen.

![](unzoned.png)

When a date field is set to `Unzoned`, users will never see a time component for that field, and the value will never be subject to automatic timezone conversion.

For example.  In the screenshot below, Date 1 is a normal date field, and Date 2 is a new unzoned date field.

![](undated.png)