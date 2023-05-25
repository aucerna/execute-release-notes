I think it's safe to say that administrators with the `Manage Execute Plugins` administrator privilege will be overjoyed that they can now (optionally) managed Execute plugins directly in Execute.  This is primarily targeted at Execute SaaS customers, but can be helpful for on-prem installations as well.  

NOTE: Plugins found in the `plugins` folder will continue to work and there is no requirement to migrate some or all of your plugins to in-app managed plugins.  If you choose to migrate plugins from the `plugins` folder to the in-app plugins it is CRITICAL that the migrated plugins in the `plugins` folder are removed prior to adding them to the in-app plugins list.  Loading the same plugin twice never yields good results.

Administrators can find the list of in-app managed plugins under `Tools > Configuration > Plugins`.  This screen may look familiar at this point because in-app plugins are treated just like any other record in Execute.  They even have change tracking!

![Plugins](plugins.png)

Viewing a plugin will show details about the plugin, as well as give the opportunity to edit the "Content" for the plugin.

![Plugin Detail](plugins2.png)

In addition, we've made some improvements to error handling.  In most cases, when a plugin fails to load properly, Execute will skip that plugin and continue startup.  The "Loaded Successfully" column on the plugins screen will identify any plugins that failed to load (they will also have a red status bar the the left of the plugin row).

**It is important to note that plugins managed in this way are included in the database and will get copied as part of the database (for example, when copying PROD to TEST).  This can potentially cause some issues where a TEST Execute environment is inadvertently attached to a 3rd-party production system.  There are two mechanisms to avoid this:**

1. Connection strings and credentials should be stored in Execute's (new) connection string storage or external credential storage.  These values are NEVER copied between environments, and this eliminates the risk of a PROD>TEST migration accidentally causing TEST data to leak into a downstream PROD system.
2. You can tag plugins with a "Plugin Environment" which can limit which environment a plugin is valid for (based on the Environment Label).  If unspecified, the plugin will load in any environment.

We hope you are as excited by this functionality as we are.  It will hugely streamline the process for managing Execute plugins.