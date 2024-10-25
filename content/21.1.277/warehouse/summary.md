Execute's Data Warehousing feature has received many updates:

### SQL Warehouse

1. We have removed the `NORMAL` and `MATERIALIZED` options for the creation of helper views since they were not-performant with larger datasets.  We added a new option `TABLES_AUTO` (the new default, and our recommendation for most cases) which will similarly ensure that the helper tables are kept current automatically.
2. We have added support for breaking very large documents (typically only seen with Schedules) into smaller chunks.  To enable this, the `EXECUTE_DOCUMENTS` table has a new `chunk` column.  If you are querying `EXECUTE_DOCUMENTS` directly, you may need to adjust your queries to handle this correctly (When querying normal fields, filter to chunk=0.  When querying child tables, include data from all chunks).  If you are querying our automatically created helper tables, this work has been done for you.
3. To avoid issues where restarting Execute could take a very long time, Execute will no longer wait for a sync to finish on shutdown but, instead, keep a highwater mark of successfully sync'd records.  After restart, and on the next automated sync, Execute will publish any records modified since that stored highwater mark.
3. Fixed behavior when Deleting and Undeleting records.
4. To avoid excessive replication of data, the `EXECUTE_DOCUMENTS_LATEST` table no longer includes the data from the latest records.  Queries relying on this table will need to join on `EXECUTE_DOCUMENTS`.

### Snowflake

1. We have added support for breaking very large documents (typically only seen with Schedules) into smaller chunks.  To enable this, the `EXECUTE_DOCUMENTS` table has a new `chunk` column.  If you are querying `EXECUTE_DOCUMENTS` directly, you may need to adjust your queries to handle this correctly.  If you are querying our automatically created helper tables, this work has been done for you.
2. To avoid issues where restarting Execute could take a very long time, Execute will no longer wait for a sync to finish on shutdown but, instead, keep a highwater mark of successfully sync'd records.  After restart, and on the next automated sync, Execute will publish any records modified since that stored highwater mark.
3. Fixed behavior when Deleting and Undeleting records.

### Mandatory Manual Upgrade Step

Because of the changes made in this update, administrators must manually perform the following steps after upgrading Execute.

1. Replace your SQL Warehouse or Snowflake plugin with the latest version from `plugins_available`
1. Verify that the `Create Views` setting is set appropriately (for SQL Server, we strongly recommend `TABLES_AUTO`)
1. Remove all Execute created objects in Execute's Data Warehouse schema (`EXECUTE_DOCUMENTS`, `AFE`, `PROCESS_EXECUTE_DOCUMENTS`, `...`).
2. Run the `Schema Publisher` synchronization task.
3. Run the `Document Publisher` synchronization task. 
