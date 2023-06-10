In this update, we've added a new Job Scheduling mode (inspired by Generwell's similarly named module) to Execute's Operational Schedule.  This new mode simplifies the process of adding jobs (from the Jobs module) to a schedule, adjusting their timing, and feeding that updated timing back into the Job workflow.

* Each schedule view can define a report which provides a list of candidate jobs (the job hopper) that can be added to that view.
* A scheduler can select one or more job(s) from that report and add them to a resource on the schedule.
* New Schedule Activity Relationships configuration allows you to define the relationships between activities (Completion happens after Drilling, etc.), so that appropriate dependencies will automatically be created when scheduling Jobs.
* Updated timing from the *master* schedule will automatically feed back to the new "Job Start", "Job End" and "Duration" fields.

Note: Execute previously included "Sched Start" and "Sched End" fields which were barely used (only set when creating a Job from the schedule).  The new Job Start and Job End fields replace these and the old fields will be removed in a future update.

