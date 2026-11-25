.PHONY: install lesson generate typecheck lint clean

install:
	npm install

# make lesson N=03
lesson:
	npm run lesson -- $(N)

# writes SQL migrations from db/schema.ts (needed before lesson 07)
generate:
	npm run generate

typecheck:
	npm run typecheck

lint:
	npm run lint

clean:
	rm -rf node_modules dist
