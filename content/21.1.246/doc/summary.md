With this update, Execute now includes support for integrating with the following document management systems:

* Quorum's DynamicDocs
* Microsoft's SharePoint

Execute now supports multiple pluggable "AttachmentStores" which can selectively take over the storage of attachments.

* Each attachment store can decide which document(s) (AFE, Well, …) it should store attachments for.
* Execute supports pushing and maintaining additional meta-data for each attachment to help searching/sorting/categorization/etc. in the document management system.

This gives a great deal of flexibility.  For example, you can use SharePoint for "approved" AFE attachments, DynamicDocs for Well-level attachments, and the built-in storage for everything else.

Plugins for these integrations are found under `plugins_available\integration\product_integrations\document_management`.