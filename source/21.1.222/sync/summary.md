A new setting (`inactiveMissingRecords` - off by default) was added to synchronizations to automatically inactivate records that are no longer found in the source dataset.

If you would like to enable this in an existing sync, you can add the following to the `IDocumentSynchronizer` component.

```
<inactivateMissingRecords>true</inactivateMissingRecords>
```

Note: Be careful when using this feature as it can/will quickly inactivate records in Execute that are no longer found in the source system.  If the source data is a table (populated by a scheduled job such as the replicator) make sure that the table is filled before letting this sync run!  As always, it is strongly advised to run this in TEST before doing this in PROD.

See `plugins_available\integration\synchronization\synchronize_document_data.config.sample` for more documentation.
