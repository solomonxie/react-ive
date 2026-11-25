.PHONY: install lesson typecheck lint clean

install:
	npm install

# make lesson N=03
# make lesson N=05 ARGS="--mode staging"
# make lesson N=07 ARGS=build   (build, then vite preview)
lesson:
	npm run lesson -- $(N) $(ARGS)

typecheck:
	npm run typecheck

lint:
	npm run lint

clean:
	rm -rf node_modules dist lessons/*/dist
