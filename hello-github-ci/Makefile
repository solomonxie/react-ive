.PHONY: install validate app try clean

install:
	npm install
	cd app && npx -y --loglevel=error pnpm@12.23.0 install

# Check every workflow file against GitHub's schemas.
validate:
	npm run validate

# Run locally what the workflows run on GitHub.
app:
	cd app && npx -y --loglevel=error pnpm@12.23.0 lint
	cd app && npx -y --loglevel=error pnpm@12.23.0 test
	cd app && npx -y --loglevel=error pnpm@12.23.0 build
	cd app && npx -y --loglevel=error pnpm@12.23.0 generate

# make try N=03
try:
	npm run try -- $(N)

clean:
	rm -rf node_modules app/node_modules app/packages/*/node_modules
