# Execute Release Notes

## Development

```
hugo server
```

Notes:
* Running the hugo server doesn't always automatically refresh the "changes since" pages where the .CSV files change

## Building

To build with DevOps links (internal use only)

```
export HUGO_SHOW_DEVOPS_LINKS=true
hugo
```