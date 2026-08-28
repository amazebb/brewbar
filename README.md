## Homebrew Packages

This is a snapshot of personal homebrew formula and casks viewable and
searchable via GitHub pages. 

To refresh the `docs/packages.tsv` simply run the file `./brewinfo`

```sh
cd docs
./brewinfo
```

## Running locally

On `localhost` the page loads amazejs from a local build at
`../../amazejs/dist/amazejs.js`, so it expects the `amazejs` repo checked out
alongside `brewbar`:

```
amazebb/
  amazejs/
  brewbar/
```

From the `brewbar` repo root, serve the parent `amazebb` directory (not
`brewbar/docs`), so that relative path resolves:

```sh
cd ..
python3 -m http.server 8000
```

Then open <http://localhost:8000/brewbar/docs/> in a browser. Opening
`index.html` directly with `file://` won't work — the page uses ES modules and
fetches its data files.
