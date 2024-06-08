We've added four new formula functions to make it easy to pull text information from linked documents (in the case where there are multiple linked documents):

* DocumentLinkChildrenSum
* DocumentLinkChildrenSumFiltered
* DocumentLinkSum
* DocumentLinkSumFiltered

Each function returns the sum of a numeric field across linked documents.

i.e.  

On a site, the following would return the sum of the Cost custom field on linked child wells.

```
DocumentLinkChildrenSum("WELL","CUSTOM/COST")
```

While the following would add up the Cost custom field from linked "Maintenance" Jobs for the site.

```
DocumentLinkChildrenTextFirstFiltered("RTX","CUSTOM/COST","JOB_TYPE/VALUE","Maintenance")
```