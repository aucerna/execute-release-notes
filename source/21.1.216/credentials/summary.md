In this update, we have made some HUGE improvements to how we store credentials for 3rd party systems (required for integrations).

### What needed to change

Previously, some credentials were stored in the Execute database, while others were embedded in plugins and configuration files.

* Credentials in the database were suboptimal for several reasons:
     * Users with read access to the database could potentially retrieve integration credentials
     * When copying from PROD to TEST you could inadvertently end up with a TEST environment that was integrating with PROD data
* Access to credentials in the plugins and configuration files were typically limited to the IT folks who manage those systems, but it's still not a best practice to do things that way.

### What's New

With this update, we've added a new credential storage mechanism.

* For those of you with on-prem Execute environments, this is an encrypted file called `credentials.bin` in your service's config folder.  This file is encrypted using the Windows Data Protection API and unusable for any user other than the Execute service user.  (NOTE: this means that changing the user that runs the Execute service will render all credentials stored in this file unusable!)
* For those of you with Quorum-hosted Execute environments, these credentials are stored securely in an Azure Key Vault.

All external credentials managed from within the Execute Web UI (Quorum On Demand Well Operations (WellEz), Peloton, Enersight, and the Integration Agent) are automatically written to the new encrypted credential mechanism.

Relevant plugins and config file now support a sensitive information placeholder element which will refer to credentials stored in the credential store.

### What happens on upgrade?

On upgrade, any database-stored credentials (such as WellEz, Peloton, Enersight, and the Integration Agent) will be automatically migrated to the secure credential store.  Note that this will come with a change in behaviour as these credentials will no longer copy between Execute environments when you copy the database.  While different, we strongly feel this is a much safer behaviour.

Any existing plugins/config files with embedded credentials will be left as-is.  If desired, the process of migrating a secret from these files to the credential store is described below.

### How do I add protection for credentials in my config and plugin files?

Many plugins (such as synchronizations to external systems) contain sensitive information like database connection strings.

```
<actual_cost_database>Data Source=SQL_Server;Initial Catalog=SQL_Server;Integrated Security=False;User ID=accounting;Password=hunter2;MultipleActiveResultSets=True</actual_cost_database>
```

We can replace the password in the connection string with a placeholder label (prefixed with `@@@`).

```
<actual_cost_database>Data Source=SQL_Server;Initial Catalog=SQL_Server;Integrated Security=False;User ID=accounting;Password=@@@ACCOUNTING_PASSWORD;MultipleActiveResultSets=True</actual_cost_database>
```

Then, an administrator with the `Edit External Credentials` admin privilege can navigate to `Tools > Configuration > External Credentials` and set the value for that placeholder.

![Adding a credential](add.png)

Now, when Execute tries to connect to the accounting database it will evaluate the connection string and replace the placeholder `@@@ACCOUNTING_PASSWORD` with the password we defined in the External Credentials screen.

Note that once added, the password can NEVER again be read from Execute.