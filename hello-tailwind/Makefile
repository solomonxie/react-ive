.PHONY: install build watch lesson clean

install:
	npm install

build:
	npm run build

watch:
	npm run watch

# make lesson N=03
lesson: build
	open $(N)-*.html

clean:
	rm -rf node_modules dist
