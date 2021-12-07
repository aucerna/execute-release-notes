For those of you whose process when finalizing a project is to revise/supplement an AFE estimate down to match the AFE's actual spend... we have a new thing!

The new optional "Release Funds" actions make it easy to:

* Supplement an AFE and automatically adjust the AFE estimate to match the actual spend
* Get that new supplement approved (without requiring a complicated approval process)

The new feature is controlled by following new configuration settings.

| Setting | Default | Description |
| --- | --- | --- |
| Enable 'Release of Funds' feature| false | Enable quick action to allow an AFE owner to automatically supplement an AFE and adjust the AFE estimate to match the AFE actuals. |
| Release Funds Flag Field | (null) | Field (i.e. CUSTOM/RELEASE_FUNDS) that will be set on the AFE to indicate the supplement was created using the Release Funds feature. (must be a list, text or yes/no type field) |
| Release Funds Flag Value | (null) | Value to be set in the 'Release Funds Flag Field' field.  |
| Release Funds Approval by AFE Owner | false | Allow AFE Owner to 'Force Approve' previously approved supplemental AFEs that decrease the AFE estimate.|
| Release Funds Approval Default Approval Position | (null) | Name of placeholder approval position to be used on the Approvers tab for 'Force Approved' AFEs |