Previously, Execute's Advanced Workflows allowed administrators to reference fields (either as task-fields or in Blockly rules) from child documents.  In practice, these references would rarely work (since the behaviour becomes ambiguous as soon as a parent record has multiple children of the same type) and this functionality has been removed.

Specifically, we have removed:

1. The ability for a Project-level workflow to reference fields on linked Wells or Sites
2. The ability for a Site-level workflow to reference fields on linked Wells or Jobs
3. The ability for a Well-level workflow to reference fields on linked Jobs

As a safety check, Execute 265 and higher will check for these invalid references and, if encountered, will fail to start and the server log will contain a message like this:

```
2024-05-06 11:17:01.613 [ERR] Exception: System.ApplicationException: Upgrade incomplete. Precondition failed for upgrade of database to version 30: There are 2 task paths that must be addressed. Please contact Execute Support.
```

If this happens, revert to Execute [21.1.264](https://updates.aucerna.app/execute/21/Aucerna_Execute_2021.1.264.zip) and contact Execute Support.