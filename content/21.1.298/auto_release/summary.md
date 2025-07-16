Using the new `automatic_release.config.sample` plugin, you can configure Execute to automatically release an AFE for approval when the review process is complete.

1. Create a new System Review Position Rule called something like "Automatic Release for Approval" (the name doesn't matter).  Record the `DOCUMENT_ID` for this position (the GUID in the URL).
   1. Don't include any people on this position.  The system will automatically mark it as review complete once all other reviewers have finalized their review. 
   2. Adjust the position rule to include it as the last reviewer on any AFEs you'd like the auto-release behavior for.  This lets you fine-tune the behavior (maybe you want this on EVERY AFE, or maybe just your Abandonment AFEs).
2. Create a plugin from `automatic_release.config.sample` and update the `positionRuleId` to be the `DOCUMENT_ID` value obtained earlier.
3. Restart Execute

Now... When you save an AFE that is (a) routed (b) has only this single reviewer as incomplete... and it's the special new "Automatic Release" reviewer, it'll automatically complete the review and release the AFE for approval.