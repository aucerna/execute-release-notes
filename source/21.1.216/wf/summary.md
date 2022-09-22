The new advanced task-based workflow module in Execute is great and allows you to tightly control the collection of information on your Wells, Sites, Jobs, AFEs, etc.

Up until now, the workflow always marched forward.  Once a task was complete, it would stay complete.  There was no way to reactivate part of the workflow and force those tasks to be re-run.

&lt;announcer_voice&gt;Until today. . .&lt;/announcer_voice&gt;

In this update, we've added phase 1 of a new workflow reset feature that allows a task owner, or an administrator with the `Can Reactivate Workflow Task` admin privilege to reactive a task.  As part of the workflow defintion, administrators can now continue what happens when a task is reactivated, such as:
* Does reactivating a task clear any data (forcing the user to re-enter those fields)?
* Does reactivating a task require the user to manually review/complete the task?
* If a parent task is reactivated, should the child/dependent task also be reactivated?

As mentioned, this is only the beginning.

Right now, task reactivation is a manual process.

Over the coming months, the plan is to introduce an automated aspect to this so that you can build rules like "If the location changes, automatically reset big chunks of the workflow."