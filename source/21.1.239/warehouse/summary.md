Execute now includes the following functionality in **beta** (pre-release) form.  This functionality is optional (off by default) and has not yet undergone our usual stringent QA process.  We have released it so that interested customers can start exploring it, planning adoption, and providing feedback.  

**We do not recommend using these new capabilities in production at this time.**

The following capabilities are available for testing.

1. Publishing Execute reporting-type data to a Snowflake database
2. Publishing Execute reporting-type data to a SQL Server / Azure SQL database
3. Creating Document Synchronizations and Data Selectors against a Snowflake database

## Publishing to a Data Warehouse

For BI, reporting and warehousing purposes, Execute now supports publishing **all** Execute data (documents) to either a client-owned/managed Snowflake database, or a client-owned/managed public-facing SQL Server (Azure SQL) database.  

To enable the publishing of Execute data to Snowflake...

1. Create a new empty database in your Snowflake environment
2. Copy `plugins_available\integration\product_integrations\warehouse\non_production\snowflake.config` to your `plugins_available` folder or add as a new in-app plugin, and restart Execute.
3. Create a new "Connection String" (Tools > Configuration > Connection Strings) called "Snowflake" with the credentials and information for your Snowflake environment.
4. Run "Tools > Synchronization > Snowflake Schema Publisher" to create tables and helper views in your Snowflake database.  This same process would also be run any time you want to update the helper views to include newly created fields in Execute.
5. Run "Tools > Synchronization > Snowflake Document Publisher" to pre-populate your Snowflake database with your existing data (latest version of each non-deleted document).  This would typically only ever be run once.
6. Execute will periodically and automatically push incremental updates to Snowflake.  You can adjust this timing by changing the "Integration/Snowflake/Snowflake Queue Wait" configuration setting.

![Settings](settings.png)

To enable the publishing of Execute data to SQL Server/Azure SQL...

1. Create a new empty database in your SQL Server/Azure SQL environment
2. Ensure that the SQL Server / Azure SQL database can be access directly from Execute (no VPNs, etc.)
3. Copy `plugins_available\integration\product_integrations\warehouse\non_production\sqlwarehouse.config` to your `plugins_available` folder or add as a new in-app plugin, and restart Execute.
4. Create a new "Connection String" (Tools > Configuration > Connection Strings) called "SQLWarehouse" with the credentials and information for your database.
5. Run "Tools > Synchronization > SQL Warehouse Schema Publisher" to create tables and helper views in your  database.  This same process would also be run any time you want to update the helper views to include newly created fields in Execute.
6. Run "Tools > Synchronization > SQL Warehouse Document Publisher" to pre-populate your database with your existing data (latest version of each non-deleted document).  This would typically only ever be run once.
7. Execute will periodically and automatically push incremental updates to your database.  You can adjust this timing by changing the "Integration/SQL Warehouse/SQL Warehouse Queue Wait" configuration setting.

For both Snowflake and SQL Server, the published data is:

1. A table called `EXECUTE_DOCUMENTS` with up-to-date semi-structured JSON-based representations of all records (documents) in Execute (Wells, AFEs, Users, Accounts, Schedules, Approval Rules, ...).   If a document is deleted, the corresponding record in this table will not be removed but will have its "deleted" field set to "1" / "TRUE".
2. (Optional) Helper views which reformat the data from `EXECUTE_DOCUMENTS` as normal tables (closely resembling the underlying tables in Execute).  These helper views are intentionally simplified and do not include deleted records, nor all the complex document versioning tables/fields (_DOC, _DOC_V, _H, ...) that made querying the underlying tables complex.

This functionality requires the "OData" module be licensed for your in environment.

## Data Selectors and Synchronizations against Snowflake

Execute now supports creating connection strings to Snowflake databases in the Connection String editor.  These connection strings can be used by Document Synchronizations and Data Selectors.

![CS](cs.png)