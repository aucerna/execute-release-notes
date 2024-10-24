Execute will now correctly prevent passwords from being used in environments configured to use Single Sign-on.  This change has the potential to prevent users from accessing these SSO environments if they were relying on a username and password instead of the SSO mechanism.

This affects environments...
1. using OKTA or OIDC for SSO
2. using our legacy Windows login mechanism where the `Authentication Type` setting is set to `WINDOWS`

This means that:
1. Users will not be able to login with a user-specified password in these environments.
  * Login screen
  * APIs
  * OData
2. Users will not be able to set a password.  The password changing feature will be hidden from the user's profile.
3. Administrators will not be able to set a user's password from the user management screen.

Any integrations using Execute's API or OData should transition to using Execute's safer API Key mechanism.

**If you require the use of user-specified passwords in your SSO environment (NOT RECOMMENDED), you can override this new behavior by setting the new `Allow User Passwords When Federated` setting.**