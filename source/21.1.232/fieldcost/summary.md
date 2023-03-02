In this update, we've made some changes to how the import of Field Costs from Peloton's WellView/SiteView and Quorum's WellEz work to fix some issues with cost duplication with Execute's carryover behavior.

* We've added a new setting called `Field Cost Import Ignore On/Before Date` that instructs the import to completely ignore any existing / import costs on/before a certain date. Execute doesn't compare existing costs to imported costs for months on/before the ignore-before date and will never generate carryover amounts for differences. This setting is primarily useful if your source system doesn't have complete/correct data before a certain point.
* We've fixed the behavior for the `Field Cost Cut-off Date` setting to ensure that the import will never change costs on/before the cut-off date. If the system detects changes between the costs already in Execute and the import data, however, Execute will carry the difference into a future unlocked/open month. 
* We've cleaned up the behavior of the `Submitted after Field Cost Import` setting.  
    * When set to Yes, all imported costs will be imported and marked as submitted automatically.  
    * When set to No, imported costs will be imported as unsubmitted. Additionally, if we are importing changed costs over a month that the owner of those costs has already submitted, the import will now unsubmit the cost to trigger a re-review.
* Previously, the import wouldn't overwrite submitted costs by default (creating some issues... you could end up with excessive months of carryover). In this update, the import WILL overwrite submitted costs after the Cut-off date if they are changed.

### What if I want to instruct Execute to ignore (and not change) known correct costs?

If you are completely happy with historic hosts in Execute up to and including June 2022 (for example), and you want the import to ignore those costs, you can set the `Field Cost Import Ignore On/Before Date` setting to "2022-06". Note, however, that doing so will mean that if costs prior to that date change in the source system, Execute will not see that change.

### What if I want costs in Execute to match the source system exactly?

If you want the monthly costs in Execute to match those of the source system exactly, set the following settings:

* `Field Cost Import Ignore On/Before Date` = empty
* `Field Cost Cut-off Date` = empty
* `Submitted after Field Cost Import` = Yes

### What if I want to freeze historical field costs in Execute?

If you want to ensure that historical field costs in Execute don't change if they change in the source system (i.e. someone adds a missing cost to a prior period), set the `Field Cost Cut-off Date`. This will prevent the import from changing costs on/before that date but will carry any change forward into a future unlocked month (ensuring that, at the end of the import, the totals always match between the two systems).

### What if I want to have AFE owners review and, potentially, adjust imported costs?

If you would like AFE owners/delegates to use the Field Cost Entry screen to review imported costs and, potentially, add adjustments for costs that are not represented in the source system (perhaps overhead or material transfers), set the `Submitted after Field Cost Import` to No.

Note that when using this behavior, if the import does change a month that has already been reviewed (submitted), it will unsubmit that month to trigger a re-review.