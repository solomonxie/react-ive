.PHONY: install lesson test typecheck lint clean

install:
	npm install

# make lesson N=03
lesson:
	npm run lesson -- $(N)

typecheck:
	npm run typecheck

lint:
	npm run lint

clean:
	rm -rf node_modules dist

test:
	npm run lesson -- 08
