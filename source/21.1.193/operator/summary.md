During some code reworking as part of a bug fix in Execute 21.1.184, a critical error was unfortunately introduced that caused issues with the handling of the selected operator on AFEs.

When an AFE was updated, the code was incorrectly updating the Operator field to the selected Parent Company for the AFE.

On operated AFEs where the Operator and Parent Company were the same, there would be no effect caused by this issue.  Unfortunately for non-op AFEs or affiliate operated AFEs, this would cause the operator to be incorrectly changed.

This issue was present in both Execute 21.1.184 and 21.1.188 and would affect any AFEs created or updated by that version of the software.  Historical AFEs that were not edited with either of the two affected versions of the software will be unaffected.

Fortunately, Execute's extensive change history means that this data was not lost.

If only a small number of AFEs were effected, it might be that manually updating them is the quickest path forward.  For larger numbers of AFEs get in touch with Execute Support and we can work with you to create a script to fix up any affected AFEs.

<b>Details on the Issue and Resolution</b>

The change was a copy-paste mistake that unfortunately slipped through our [development code review, normal QA process, and our automated QA process](https://en.wikipedia.org/wiki/Swiss_cheese_model).

The code read:

```
editableRecord.SetField(Paths.AFE.OPERATING_COMPANY, currentDocumentData.ReadDocumentField(Paths.AFE.PARENT_COMPANY));
```

instead of:

```
editableRecord.SetField(Paths.AFE.OPERATING_COMPANY, currentDocumentData.ReadDocumentField(Paths.AFE.OPERATING_COMPANY));
```

A mistake that, in retrospect, is very easy to spot, but we missed seeing it amidst the larger set of changes.

In this release, we have fixed the offending code, but also re-reviewed the entire larger change to make sure no other similar errors were introduced.  From what we can see this was the only issue.

To help avoid mistakes like this, we do employ and continue to invest in a suite of automated tests which are run as part of every build.  Unfortunately, our automated build scripts only tested operated AFEs where the operator and parent company were the same company, so they didn't catch this mistake.  Our automated test development team is extending our testing model to include other operator combinations to make sure mistakes like this can't happen in the future.

Our sincere apologies for any trouble this has caused.  Please do reach out if you have any further questions or concerns.

