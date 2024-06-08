We will enable both types of authentication by default.  They can be turned off by adding one of the following to the `<castle>` container in `user.config`.

<pre>
&lt;?define DISABLE_KERBEROS_AUTH ?&gt;
</pre>

<pre>
&lt;?define DISABLE_NTLM_AUTH ?&gt;
</pre>

