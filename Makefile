.PHONY: test lint zip clean

# Run all tests across all integrations
test:
	@echo "Running tests for all integrations..."
	@for dir in integration/*/; do \
		echo "Testing $$dir..."; \
		cd $$dir && npx jest --passWithNoTests && cd ../..; \
	done

# Lint all JavaScript files
lint:
	@echo "Linting all integration code..."
	@npx eslint integration/**/*.js --fix

# Create submission zip for Auth0 partner portal
zip: clean
	@echo "Creating submission package..."
	@mkdir -p dist
	@zip -r dist/litesoc-auth0-integration.zip \
		integration/ \
		media/ \
		README.md \
		LICENSE \
		-x "*.spec.js" \
		-x "node_modules/*" \
		-x ".git/*"
	@echo "Created dist/litesoc-auth0-integration.zip"

# Clean build artifacts
clean:
	@rm -rf dist/
	@echo "Cleaned dist/ directory"

# Initialize deployment to test tenant
deploy_init:
	@echo "Initializing deployment..."
	@echo "Create a Machine-to-Machine application in Auth0 with these permissions:"
	@echo "  - read:actions"
	@echo "  - update:actions"
	@echo "  - delete:actions"
	@echo "  - create:actions"
	@echo ""
	@echo "Then set these environment variables:"
	@echo "  export AUTH0_DOMAIN=your-tenant.auth0.com"
	@echo "  export AUTH0_CLIENT_ID=your-m2m-client-id"
	@echo "  export AUTH0_CLIENT_SECRET=your-m2m-client-secret"

# Get access token for deployment
deploy_get_token:
	@curl --request POST \
		--url "https://$$AUTH0_DOMAIN/oauth/token" \
		--header 'content-type: application/json' \
		--data '{"client_id":"'"$$AUTH0_CLIENT_ID"'","client_secret":"'"$$AUTH0_CLIENT_SECRET"'","audience":"https://'"$$AUTH0_DOMAIN"'/api/v2/","grant_type":"client_credentials"}'

# Install dependencies for testing
install:
	@npm install --save-dev jest eslint

# Help
help:
	@echo "Available commands:"
	@echo "  make test          - Run all integration tests"
	@echo "  make lint          - Lint all JavaScript files"
	@echo "  make zip           - Create submission package"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make deploy_init   - Show deployment setup instructions"
	@echo "  make install       - Install dev dependencies"
