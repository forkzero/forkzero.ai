.PHONY: ci install format format-check lint typecheck build build-ui test smoke-test test-all clean pre-commit pre-push lattice-fresh help

# Pre-commit gate: fast checks (format check + lint + lattice health strict)
pre-commit: format-check lint
	@if command -v lattice >/dev/null 2>&1 && lattice health --help 2>&1 | grep -q strict; then \
		lattice health --strict --check; \
	else \
		echo "Note: lattice health skipped (install lattice >=0.2.2 to enable)"; \
	fi
	@echo "Pre-commit checks passed."

# Lattice staleness gate: hard-fail if .lattice is >72h behind code (push/CI altitude).
lattice-fresh:
	@if command -v lattice >/dev/null 2>&1; then \
		lattice freshness --check || { echo "Lattice is stale (>72h behind code). Update .lattice before pushing."; exit 1; }; \
	else \
		echo "Note: lattice freshness skipped (lattice not installed)"; \
	fi

# Pre-push gate: full checks (format + lint + lattice freshness + typecheck + test + build)
pre-push: pre-commit lattice-fresh typecheck test build
	@echo "Pre-push checks passed."

# Full CI (same as pre-push with clean install)
ci: install format lint typecheck build test
	@echo "CI passed."

install:
	npm ci

# Auto-fix formatting
format:
	npm run format

# Check formatting without modifying files (used by pre-commit)
format-check:
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
