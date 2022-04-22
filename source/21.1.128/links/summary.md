Execute now does it's best to automatically maintain Document Links between related documents.  This includes:

* Linking an AFE to the Job it was created from.
* Linking Jobs to the Well or Site they are associated with / created from.
* Linking a Well to the Pad (Site) it is associated with.

These new links are automatically managed by the system and will automatically be updated or removed when you change the underlying field that link is based on.  For example: Changing the "Pad" field on the well will automatically update the associated Document Link.  These links are identified by a "system managed" badge on the Document Links tab.

![Links](links.png)

These new links are exciting for several reasons:

1. They are bi-directional.  From a well you can see the associated sites and click on them to open them.  From a site, you see the associated wells.
2. Our new document link formulas make it easy to see/summarize information from linked documents.  For example:
     * Show the current AFE Status for the AFE linked to a Job
     * Show the minimum Spud Date for all wells linked to a Site
3. Use the new "Refresh Linked Data" button on the AFE to automatically copy data from linked Wells, Sites and Jobs onto the AFE and the fill out the AFE's well list.

**Document Links are automatically created from this point forward.  This update does not retroactively create links on historical documents.**