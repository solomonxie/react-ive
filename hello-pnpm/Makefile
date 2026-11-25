# Runs pnpm 12.23.0 through npx so nothing needs installing globally.
# If you have pnpm: make PNPM=pnpm ...
PNPM ?= npx -y --loglevel=error pnpm@12.23.0

.PHONY: install build run clean

install:
	cd workspace && $(PNPM) install

build:
	cd workspace && $(PNPM) -r build

run:
	cd workspace && $(PNPM) run-local

clean:
	rm -rf workspace/node_modules workspace/modules/*/node_modules workspace/modules/*/lib
