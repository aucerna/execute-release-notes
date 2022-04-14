In addition to the AFE process that most of you are using today, Execute also has the ability to track Wells, Sites and Jobs and their associated data and workflow.

For those of you tracking these other details in Execute, we've added a new "Refresh Linked Data" button on the AFE that makes it easy to pull information from related Wells, Sites and Jobs onto the AFE.

The first step is to configure the mapping(s) from your Well/Site/Job to your AFE.  These are found under `Tools` > `Configuration` > `Field Mappings`.

![Field Mappings](mappings.png)

There are three new Field Mappings which control how attributes are copied onto top-level fields on the AFE.

1. RTX > AFE (mappingId = "update")
1. WELL > AFE (mappingId = "update")
1. SITE > AFE (mappingId = "update")

In addition, there is one new Field Mapping which controls mapping linked wells to new rows in the AFE's Well List.

1. WELL > AFE (mappingId = "update-well")

Here is an example mapping that maps three fields from the Well to top-level fields on the AFE.  If a single Well is linked to the AFE, pressing the "Refresh Linked Data" button will use this mapping to copy these three values from the well to the AFE.

![Well Mapping](mapping.png)

Next, this feature must be enabled by enabling the `Enable 'Refresh Linked Data' on AFEs` setting under `Tools` > `Configuration` > `Settings`.

Document Links can be fairly complex and the system will try and follow the links to find all "reasonable" linked documents.  This includes:

Jobs:

* Directly linked to AFE

Sites:

* Directly linked to AFE
* Owner of a Job linked to an AFE (Site Job)

Wells:

* Directly linked to an AFE
* Owner of a Job linked to an AFE (Well Job)
* Directly Linked to a Site that is:
     * Directly linked to the AFE
     * Owner of a Job linked to the AFE (Site Job)

Mappings are applied in the following order:

1. Well -> AFE
2. Site -> AFE 
3. Job -> AFE

This means that if the AFE is linked to a Well and Site, for example, and both the Well and Site map to the same field, the Site will "win" because it's processed second.

A mapping will not be applied if multiple documents of that type are linked. 

For example, in the following situation the AFE is linked to one Site and two Wells (via. the Site).  

![mapping1.png](mapping1.png)

* The Well > AFE mapping will **not** run because the AFE is linked to two Wells
* The Site > AFE mapping will run because the AFE is linked to only one Site
* The Job > AFE mapping will not run because the AFE isn't linked to any Jobs
* The Well > AFE - Well mapping will run to add each of the two Wells to the AFE's Well list.
