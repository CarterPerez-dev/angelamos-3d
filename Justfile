# ©AngelaMos | 2026
# Justfile

# =============================================================================
# Angela 3D AI Assistant | Justfile
# =============================================================================

set dotenv-load
set export
set shell := ["bash", "-uc"]

OLLAMA_MODEL := env("OLLAMA_MODEL", "qwen2.5:7b")

# =============================================================================
# Default
# =============================================================================

default:
    @just --list --unsorted

# =============================================================================
# Setup
# =============================================================================

[group('setup')]
setup: env build start pull
    @echo ""
    @echo "Angela 3D is ready — open http://localhost:${PORT:-7200}"

[group('setup')]
env:
    @if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; else echo ".env already exists"; fi

# =============================================================================
# Docker
# =============================================================================

[group('docker')]
up *ARGS:
    docker compose up -d {{ARGS}} && docker compose logs -f {{ARGS}}

[group('docker')]
start *ARGS:
    docker compose up -d {{ARGS}}

[group('docker')]
down *ARGS:
    docker compose down {{ARGS}}

[group('docker')]
stop:
    docker compose stop

[group('docker')]
build *ARGS:
    docker compose build {{ARGS}}

[group('docker')]
rebuild:
    docker compose build --no-cache

[group('docker')]
logs *SERVICE:
    docker compose logs -f {{SERVICE}}

[group('docker')]
ps:
    docker compose ps

[group('docker')]
shell service='backend':
    docker compose exec -it {{service}} /bin/bash

[group('docker')]
restart *SERVICE:
    docker compose restart {{SERVICE}}

# =============================================================================
# Ollama
# =============================================================================

[group('ollama')]
pull:
    docker compose exec ollama ollama pull {{OLLAMA_MODEL}}

[group('ollama')]
ollama-models:
    docker compose exec ollama ollama list

[group('ollama')]
ollama-run model=OLLAMA_MODEL:
    docker compose exec -it ollama ollama run {{model}}

# =============================================================================
# Backend Linting
# =============================================================================

[group('backend-lint')]
ruff *ARGS:
    cd backend && uv run ruff check . {{ARGS}}

[group('backend-lint')]
ruff-fix:
    cd backend && uv run ruff check . --fix && uv run ruff format .

[group('backend-lint')]
mypy *ARGS:
    cd backend && uv run mypy app {{ARGS}}

[group('backend-lint')]
backend-lint: ruff mypy

# =============================================================================
# Frontend Linting
# =============================================================================

[group('frontend-lint')]
biome *ARGS:
    cd frontend && pnpm biome check . {{ARGS}}

[group('frontend-lint')]
biome-fix:
    cd frontend && pnpm biome check --write .

[group('frontend-lint')]
stylelint *ARGS:
    cd frontend && pnpm stylelint '**/*.scss' {{ARGS}}

[group('frontend-lint')]
stylelint-fix:
    cd frontend && pnpm stylelint '**/*.scss' --fix

[group('frontend-lint')]
tsc *ARGS:
    cd frontend && pnpm tsc --noEmit {{ARGS}}

[group('frontend-lint')]
frontend-lint: biome tsc stylelint

# =============================================================================
# Combined
# =============================================================================

[group('ci')]
lint: backend-lint frontend-lint

[group('ci')]
check: ruff mypy tsc

# =============================================================================
# Health & Status
# =============================================================================

[group('status')]
health:
    @curl -sf http://localhost:${PORT:-7200}/health && echo " healthy" || echo " unhealthy"

[group('status')]
status:
    @echo "=== Containers ===" && docker compose ps
    @echo ""
    @echo "=== Health ===" && curl -sf http://localhost:${PORT:-7200}/health && echo " healthy" || echo " unhealthy"

# =============================================================================
# Utilities
# =============================================================================

[group('util')]
clean:
    @echo "Cleaning backend caches..."
    -rm -rf backend/.mypy_cache
    -rm -rf backend/.pytest_cache
    -rm -rf backend/.ruff_cache
    @echo "Cleaning frontend caches..."
    -rm -rf frontend/node_modules/.vite
    @echo "Done!"

[group('util')]
nuke:
    docker compose down -v --rmi local
    @echo "All containers, volumes, and local images removed"

[group('util')]
info:
    @echo "Angela 3D AI Assistant"
    @echo "Port: ${PORT:-7200}"
    @echo "Ollama Model: {{OLLAMA_MODEL}}"
    @echo "OS: {{os()}} ({{arch()}})"
