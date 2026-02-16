.PHONY: ci install format lint typecheck build test clean pre-commit pre-push

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

typecheck:
	npx tsc --noEmit

build:
	npm run build

test:
	npm test

clean:
	rm -rf dist node_modules

help:
	@echo "Available targets:"
	@echo "  make pre-commit - Check formatting + lint (run before commit)"
	@echo "  make pre-push   - Full check: format + lint + typecheck + test + build (run before push)"
	@echo "  make ci         - Full CI with clean install"
	@echo "  make build      - Build for production"
	@echo "  make test       - Run tests with coverage"
	@echo "  make clean      - Remove dist and node_modules"
