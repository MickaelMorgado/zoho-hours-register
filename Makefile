.PHONY: help install dev build start lint clean docker-up docker-down docker-build docker-logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ── Dev ──────────────────────────────────────────────

install: ## Install dependencies
	npm install

dev: ## Start dev server (localhost:3000)
	npm run dev

build: ## Production build
	npm run build

start: ## Start production server
	npm run start

lint: ## Run ESLint
	npm run lint

clean: ## Remove build artifacts and node_modules
	rm -rf .next node_modules
