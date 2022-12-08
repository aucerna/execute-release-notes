We've added four new formula functions to make it easy to pull text information from linked documents (in the case where there are multiple linked documents):

* DocumentLinkTextValueFirst
* DocumentLinkTextValueFirstFiltered
* DocumentLinkChildrenTextFirst
* DocumentLinkChildrenTextFirstFiltered

Each function returns the alphabetically first non-empty value from the referenced field on the linked documents.

i.e.  

On a site, the following would return the alphabetically first non-empty Job Description from linked child jobs.

```
DocumentLinkChildrenTextFirst("RTX","DESCRIPTION")
```

While the following would do the same, but only for Drilling Jobs.

```
DocumentLinkChildrenTextFirstFiltered("RTX","DESCRIPTION","JOB_TYPE/VALUE","Drilling")
```