.PHONY: ci install format lint typecheck build build-ui test smoke-test test-all clean pre-commit pre-push help

# Pre-commit gate: fast checks (format + lint)
pre-commit: format lint
	@echo "Pre-commit checks passed."

# Pre-push gate: full checks (format + lint + typecheck + test + build)
pre-push: pre-commit typecheck test build
	@echo "Pre-push checks passed."

# Full CI (same as pre-push with clean install)
ci: install format lint typecheck build test
	@echo "CI passed."

install:
	npm ci

format:
	npm run format:check

lint:
	npm run lint

build-ui:
	npm run build -w packages/ui

typecheck: build-ui
	npx tsc --noEmit

build: build-ui
	npm run build

test:
	npm test

# Smoke tests against live site (run after deploy)
smoke-test:
	npm run test:smoke

# Run all tests (unit + smoke) with JUnit XML summary
test-all:
	@rm -rf test-results && mkdir -p test-results
	npm test
	npm run test:smoke
	@node scripts/test-summary.mjs

clean:
	rm -rf dist packages/*/dist node_modules test-results coverage

help:
	@echo "Available targets:"
	@echo "  make pre-commit  - Check formatting + lint (run before commit)"
	@echo "  make pre-push    - Full check: format + lint + typecheck + test + build (run before push)"
	@echo "  make ci          - Full CI with clean install"
	@echo "  make build-ui    - Build @forkzero/ui package"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run unit tests with coverage"
	@echo "  make smoke-test  - Run smoke tests against live site"
	@echo "  make test-all    - Run all tests with JUnit XML summary"
	@echo "  make clean       - Remove dist, test-results, and node_modules"
