Since early times, Execute ensured that only a single user could edit a document (AFE, Well, Job, ...) at a time.  This was handy for some document types (such as AFEs) with a very strong workflow, but a bit cumbersome for heavily multi-person documents like Wells, Sites and Jobs.

So... we've changed things a bit.

Execute will now take **shared locks** for Wells, Sites, Jobs and all of your custom document types.  This allows multiple users to be actively editing the same document and, upon save, their changes will be merged together.  It means a whole lot less waiting for someone else to finish their work before you can do yours! 

> Note: If you are making changes where you think you would benefit from the old-style exclusive locks, you can find "Edit with Exclusive Lock" under the more menu.

This functionality gets really interesting when you include fields from related documents on custom tabs.  Previously, for example, you could include read-only well-level fields on your Job for reference but now you can opt-in to allowing those well-level fields to be editable (from the Job) by adding `EDIT_REFERENCED_DOC_FIELDS` to your "Additional Configuration Flags" in settings.