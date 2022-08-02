The new calculated fields in Execute have been phenomenally successful and many of you are finding all sorts of great uses for them.  In this release, we've added a few new functions based on your feedback.

### InList

Sometimes you need to check if a value is one of a big list of options.  While you can do this with the `if` function, it's not pleasant.  Trying to get the brackets right in an expression like `if([CUSTOM/AFE_TYPE/VALUE]=="Drilling",true,[CUSTOM/AFE_TYPE/VALUE]=="Complete",true,[CUSTOM/AFE_TYPE/VALUE]=="Drill & Complete",true,false)))` is enough to break anybody's brain.

So... We've added the `InList` function which returns whether a value is found in a list of values.

i.e. the following will return true when the AFE Type is one of "Drilling", "Completion" or "Drill & Complete"

```
inlist([CUSTOM/AFE_TYPE/VALUE],"Drilling","Completion","Drill & Complete")
```

Usually, `inList` would be used in condition part of if statement:

```
if(inlist([CUSTOM/AFE_TYPE/VALUE],"Drilling","Completion","Drill & Complete"),"drilling & completion AFE","not a D&C AFE")
```

### FirstNonEmpty

Sometimes it's helpful to return the first non-empty value from a bunch of text fields (such as when showing the "best available identifier for an AFE").   The new `FirstNonEmpty` function helps with that!

i.e. Here is a function that returns the description (if one), or the internal justification (if one), or a constant string.

```
FirstNonEmpty([DESCRIPTION],[INTERNAL_JUSTIFICATION],"This AFE has no name")
```

### Document Link Counting

Another common ask has been around getting a count of linked documents, so we've introduced `DocumentLinkChildrenCount` and `DocumentLinkCount` to help with that.

i.e. Find the number of child wells for a site.

```
DoumentLinkChildCount("WELL")
```

i.e. Find the count of AFEs linked to a Job (child, associated, parent... all are counted).

```
DoumentLinkCount("AFE")
```