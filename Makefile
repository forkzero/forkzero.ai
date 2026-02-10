.PHONY: ci install format lint typecheck build test clean

ci: install format lint typecheck build test
	@echo "CI passed."

install:
	npm ci

format:
	npm run format:check

lint:
	npm run lint

typecheck:
	npx tsc --noEmit

build:
	npm run build

test:
	npm test

clean:
	rm -rf dist node_modules
