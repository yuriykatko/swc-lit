# Reproduce the issue
Run `yarn test` and see `example-element tests › can change element class using @query decorator` test fail

# Workaround
- Downgrade `"@swc/core"` to version `"1.3.39"` 
- Run `yarn test` and see all tests pass