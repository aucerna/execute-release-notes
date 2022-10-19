Execute automatically manages System-level document links between...

* An AFE and the Job it was created from
* An AFE and the Project(s) it is linked to
* A Well and it's Pad (Site)
* A Project and related Wells and Sites
* A Job and related Wells and Sites

If you have some other relationship between records (such as a "Well" drop-down field on an AFE), you can use the new plugins to automatically manage System-level document links based on that field.

![](links.png)

This functionality is enabled with the following new plugin configuration files:

* `plugins_available/custom_auto_document_link_list.config.sample`
* `plugins_available/custom_auto_document_link_single.config.sample`