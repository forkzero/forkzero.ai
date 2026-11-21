.PHONY: ci install format format-check lint typecheck build build-ui test smoke-test test-all clean pre-commit pre-push lattice-fresh help infra-install infra-test infra-diff infra-deploy infra-check-env

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

install: infra-install
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

test: infra-test
	npm test

# --- Infrastructure (CDK app in infra/; see docs/MONITORING.md) ---

infra-install:
	cd infra && npm ci

# Typecheck the CDK app, then test the stack and the Lambda checks
infra-test:
	@test -d infra/node_modules || (cd infra && npm ci)
	cd infra && npx tsc --noEmit && npm test

# Values the stack needs at deploy time. Emails stay out of the repo; the
# distribution is looked up by its forkzero.ai alias.
INFRA_ENV = DISTRIBUTION_ID=$$(aws cloudfront list-distributions \
	  --query "DistributionList.Items[?Aliases.Items[?@=='forkzero.ai']].Id | [0]" --output text)

infra-diff: infra-check-env
	cd infra && $(INFRA_ENV) npx cdk diff

# Deploys both stacks. CI (infra.yml) deploys only ForkzeroAi-Monitoring;
# ForkzeroAi-CiBootstrap (the CI role) changes only through this target.
infra-deploy: infra-check-env infra-test
	cd infra && $(INFRA_ENV) npx cdk deploy --all

infra-check-env:
	@test -n "$(REPORT_EMAIL)" || (echo "Set REPORT_EMAIL (and optionally ALERT_EMAIL), e.g. make infra-deploy REPORT_EMAIL=you@example.com"; exit 1)
	@test -d infra/node_modules || (cd infra && npm ci)

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
