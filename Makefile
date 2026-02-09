# ©AngelaMos | 2026
# Makefile

# =============================================================================
# Angela 3D AI Assistant | Makefile
# =============================================================================

-include .env
export

OLLAMA_MODEL ?= qwen2.5:7b
PORT         ?= 7200

.DEFAULT_GOAL := help

# =============================================================================
# Help
# =============================================================================

.PHONY: help
help:
	@echo "Angela 3D AI Assistant"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          Copy .env, build, start, pull model"
	@echo "  make env            Copy .env.example to .env"
	@echo ""
	@echo "Docker:"
	@echo "  make up             Start all services (foreground)"
	@echo "  make start          Start all services (detached)"
	@echo "  make down           Stop and remove containers"
	@echo "  make stop           Stop containers"
	@echo "  make build          Build images"
	@echo "  make rebuild        Build images (no cache)"
	@echo "  make logs           Follow all logs"
	@echo "  make ps             List containers"
	@echo "  make restart        Restart all services"
	@echo "  make shell          Shell into backend"
	@echo ""
	@echo "Ollama:"
	@echo "  make pull           Pull the configured LLM model"
	@echo "  make ollama-models  List downloaded models"
	@echo ""
	@echo "Linting:"
	@echo "  make lint           Run all linters"
	@echo "  make ruff           Run ruff on backend"
	@echo "  make ruff-fix       Auto-fix ruff issues"
	@echo "  make mypy           Run mypy on backend"
	@echo "  make biome          Run biome on frontend"
	@echo "  make biome-fix      Auto-fix biome issues"
	@echo "  make stylelint      Run stylelint on frontend"
	@echo "  make stylelint-fix  Auto-fix stylelint issues"
	@echo "  make tsc            TypeScript type check"
	@echo "  make check          Quick check (ruff + mypy + tsc)"
	@echo ""
	@echo "Status:"
	@echo "  make health         Check service health"
	@echo "  make status         Full status overview"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          Remove lint/build caches"
	@echo "  make nuke           Remove containers, volumes, images"
	@echo "  make info           Show project info"

# =============================================================================
# Setup
# =============================================================================

.PHONY: setup env
setup: env build start pull
	@echo ""
	@echo "Angela 3D is ready — open http://localhost:$(PORT)"

env:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; else echo ".env already exists"; fi

# =============================================================================
# Docker
# =============================================================================

.PHONY: up start down stop build rebuild logs ps restart shell
up:
	docker compose up -d && docker compose logs -f

start:
	docker compose up -d

down:
	docker compose down

stop:
	docker compose stop

build:
	docker compose build

rebuild:
	docker compose build --no-cache

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose restart

shell:
	docker compose exec -it backend /bin/bash

# =============================================================================
# Ollama
# =============================================================================

.PHONY: pull ollama-models
pull:
	docker compose exec ollama ollama pull $(OLLAMA_MODEL)

ollama-models:
	docker compose exec ollama ollama list

# =============================================================================
# Backend Linting
# =============================================================================

.PHONY: ruff ruff-fix mypy backend-lint
ruff:
	cd backend && uv run ruff check .

ruff-fix:
	cd backend && uv run ruff check . --fix && uv run ruff format .

mypy:
	cd backend && uv run mypy app

backend-lint: ruff mypy

# =============================================================================
# Frontend Linting
# =============================================================================

.PHONY: biome biome-fix stylelint stylelint-fix tsc frontend-lint
biome:
	cd frontend && pnpm biome check .

biome-fix:
	cd frontend && pnpm biome check --write .

stylelint:
	cd frontend && pnpm stylelint '**/*.scss'

stylelint-fix:
	cd frontend && pnpm stylelint '**/*.scss' --fix

tsc:
	cd frontend && pnpm tsc --noEmit

frontend-lint: biome tsc stylelint

# =============================================================================
# Combined
# =============================================================================

.PHONY: lint check
lint: backend-lint frontend-lint

check: ruff mypy tsc

# =============================================================================
# Health & Status
# =============================================================================

.PHONY: health status
health:
	@curl -sf http://localhost:$(PORT)/health && echo " healthy" || echo " unhealthy"

status:
	@echo "=== Containers ===" && docker compose ps
	@echo ""
	@echo "=== Health ===" && curl -sf http://localhost:$(PORT)/health && echo " healthy" || echo " unhealthy"

# =============================================================================
# Utilities
# =============================================================================

.PHONY: clean nuke info
clean:
	@echo "Cleaning backend caches..."
	-rm -rf backend/.mypy_cache
	-rm -rf backend/.pytest_cache
	-rm -rf backend/.ruff_cache
	@echo "Cleaning frontend caches..."
	-rm -rf frontend/node_modules/.vite
	@echo "Done!"

nuke:
	docker compose down -v --rmi local
	@echo "All containers, volumes, and local images removed"

info:
	@echo "Angela 3D AI Assistant"
	@echo "Port: $(PORT)"
	@echo "Ollama Model: $(OLLAMA_MODEL)"
