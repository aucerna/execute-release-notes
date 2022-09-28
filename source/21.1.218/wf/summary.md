The new advanced task-based workflow module in Execute is great and allows you to tightly control the collection of information on your Wells, Sites, Jobs, AFEs, etc.

Up until now, the workflow always marched forward.  Once a task was complete, it would stay complete.  There was no way to reactivate part of the workflow and force those tasks to be re-run.

&lt;announcer_voice&gt;Until today. . .&lt;/announcer_voice&gt;

In this update, we've added phase 1 of a new workflow reset feature that allows a task owner or an administrator with the `Can Reactivate Workflow Task` admin privilege to reactive a task.  As part of the workflow definition, administrators can now configure what happens when a task is reactivated, such as:

* Does reactivating a task clear any data (forcing the user to re-enter those fields)?
* Does reactivating a task require the user to manually review/complete the task?
* If a parent task is reactivated, should the child/dependent task also be reactivated?

![](task.png)

As mentioned, this is only the beginning.

In this update, task reactivation is a manual process.

Over the coming months, the plan is to introduce an automated aspect to this so that you can build rules like "If the location changes, automatically reset big chunks of the workflow."

As part of this change, we have also cleaned up the behaviour of the "Manual Completion Behaviour".

* If a task marked as "Require Manual Completion" has a Completion Rule, that completion rule must be satisfied before the task can be completed.
* If a task is not marked as "Require Manual Completion", the task must have a Completion Rule to be completed.  There is no option for a user to manually complete the task in this case.  This is a change from the previous version where the software would incorrectly show a Complete button to the user.
* Tasks where "Require Manual Completion" = yes will show a "Save" and a "Save & Complete" button
* Tasks where "Require Manual Completion" = no will show a "Save" only