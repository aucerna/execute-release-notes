Execute's new Document Fetch APIs provide a streamlined way to bulk extract documents from Execute.

* A single streamlined API call vs. the Login > Run Report > Logout call for the current APIs.
* Returns ALL data for request documents in a nice friendly machine readable JSON form.
* Supports including calculated field values in the returned data (popular request from User Voice).
* Easily filtering to return only documents modified since a provided date (makes it much easier to keep a remove warehouse up-to-date).

Note: These APIs require the Execute Advanced Data Export (OData) module license.

More information can be found in our [New Postman-based API documentation](https://documenter.getpostman.com/view/24781732/2sA3s1oXCH#4eff85d6-2409-49d4-a8ed-e470a481124b).