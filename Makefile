.PHONY: help dev build preview analyze install clean commit push

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	npm run dev

build: ## Build for production
	npm run build

preview: ## Preview production build
	@lsof -ti:4173 | xargs kill -9 2>/dev/null || true
	npm run preview

analyze: ## Analyze bundle size
	npm run analyze

clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules

commit: ## Commit all changes (prompts for message)
	@read -p "Commit message: " msg; \
	git add -A && git commit -m "$$msg"

push: ## Push to remote
	git push

deploy: build ## Build and push (triggers GitHub Pages deploy)
	git add dist -f
	git commit -m "Deploy" || true
	git push
