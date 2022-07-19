Execute now will automatically update its schema when launching Execute against any older Execute 21 database.  

* Because this is an upgrade in place it is imperative that a database backup be taken before upgrading Execute.  While we do our best to test changes, we occassionally encounter configuration we didn't expect.
* The release notes for each version of Execute will now explicitly detail any schema changes included in that update.
* Schema updates are forward only.  It is not possible to run an older verison of Execute against an upgraded database.
* Environments prior to Execute 21 will still need to use the DatabaseTool to upgrade to Execute 21.
* Environments on any version of Execute 21 will not need to use the DatabaseTool except for migrating Execute from one database platform to another.
