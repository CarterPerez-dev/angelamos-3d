#!/usr/bin/env bash
# ©AngelaMos | 2026
# install.sh

set -euo pipefail

REPO="https://github.com/AngelaMos/angelamos-3d.git"
INSTALL_DIR="${ANGELA_INSTALL_DIR:-$HOME/angela-3d}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

info()   { echo -e "  ${GREEN}+${NC} $1"; }
warn()   { echo -e "  ${YELLOW}!${NC} $1"; }
fail()   { echo -e "  ${RED}x${NC} $1"; }
header() { echo -e "\n${BOLD}${CYAN}--- $1 ---${NC}\n"; }

prompt_yn() {
    local msg="$1" default="${2:-y}"
    if [[ "$default" == "y" ]]; then
        echo -en "  ${BOLD}$msg [Y/n]:${NC} "
    else
        echo -en "  ${BOLD}$msg [y/N]:${NC} "
    fi
    read -r ans
    ans="${ans:-$default}"
    [[ "${ans,,}" == "y" ]]
}

prompt_val() {
    local msg="$1" default="$2"
    echo -en "  ${BOLD}$msg [${default}]:${NC} "
    read -r ans
    echo "${ans:-$default}"
}

echo -e "${BOLD}${CYAN}"
cat << 'EOF'

     _                _       __  __
    / \   _ __   __ _| | __ _|  \/  | ___  ___
   / _ \ | '_ \ / _` | |/ _` | |\/| |/ _ \/ __|
  / ___ \| | | | (_| | | (_| | |  | | (_) \__ \
 /_/   \_|_| |_|\__, |_|\__,_|_|  |_|\___/|___/
                |___/
EOF
echo -e "${NC}"
echo -e "  ${DIM}3D AI Voice Assistant${NC}"

# =========================================================================
# Dependencies
# =========================================================================

header "Checking dependencies"

HAS_GIT=true
HAS_DOCKER=true
HAS_COMPOSE=true

if ! command -v git &>/dev/null; then
    fail "git is not installed"
    HAS_GIT=false
else
    info "git $(git --version | awk '{print $3}')"
fi

if ! command -v docker &>/dev/null; then
    fail "Docker is not installed"
    HAS_DOCKER=false
else
    info "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
fi

if [[ "$HAS_DOCKER" == "true" ]] && ! docker compose version &>/dev/null; then
    fail "Docker Compose v2 not found"
    HAS_COMPOSE=false
else
    if [[ "$HAS_DOCKER" == "true" ]]; then
        info "Docker Compose $(docker compose version --short)"
    fi
fi

if [[ "$HAS_GIT" == "false" ]]; then
    echo ""
    fail "Install git first:"
    echo "    sudo apt install git          # Debian/Ubuntu"
    echo "    sudo dnf install git          # Fedora"
    echo "    sudo pacman -S git            # Arch"
    exit 1
fi

if [[ "$HAS_DOCKER" == "false" ]]; then
    echo ""
    if prompt_yn "Install Docker via get.docker.com?"; then
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker "$USER"
        echo ""
        warn "Log out and back in for Docker group permissions to take effect"
        warn "Then re-run this script"
        exit 0
    else
        fail "Docker is required"
        echo "    https://docs.docker.com/engine/install/"
        exit 1
    fi
fi

if [[ "$HAS_COMPOSE" == "false" ]]; then
    echo ""
    fail "Install Docker Compose v2:"
    echo "    sudo apt install docker-compose-plugin   # Debian/Ubuntu"
    echo "    sudo dnf install docker-compose-plugin   # Fedora"
    echo "    sudo pacman -S docker-compose             # Arch"
    exit 1
fi

if ! docker info &>/dev/null 2>&1; then
    echo ""
    warn "Docker daemon not running or permission denied"
    if prompt_yn "Try starting Docker?"; then
        sudo systemctl start docker
        sudo usermod -aG docker "$USER"
        warn "If this still fails, log out and back in"
    fi
fi

# =========================================================================
# GPU Detection
# =========================================================================

header "Checking GPU"

GPU_MODE="cpu"

if command -v nvidia-smi &>/dev/null && nvidia-smi &>/dev/null 2>&1; then
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1)
    GPU_VRAM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader 2>/dev/null | head -1)
    info "Found: ${GPU_NAME} (${GPU_VRAM})"

    if docker info 2>/dev/null | grep -qi "nvidia"; then
        info "NVIDIA Container Toolkit installed"
        GPU_MODE="gpu"
    else
        warn "NVIDIA Container Toolkit not found"
        echo ""
        echo "  GPU acceleration requires the NVIDIA Container Toolkit:"
        echo "    https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
        echo ""
        if ! prompt_yn "Continue without GPU (CPU-only)?" ; then
            echo "  Install the toolkit and re-run this script."
            exit 0
        fi
    fi
else
    warn "No NVIDIA GPU detected"
    info "Running in CPU-only mode (slower but works)"
fi

echo ""
if [[ "$GPU_MODE" == "gpu" ]]; then
    info "Mode: ${GREEN}GPU${NC}"
else
    info "Mode: ${YELLOW}CPU${NC}"
fi

# =========================================================================
# Clone
# =========================================================================

header "Installing"

if [[ -d "$INSTALL_DIR" ]]; then
    warn "Directory exists: $INSTALL_DIR"
    if ! prompt_yn "Use existing directory?"; then
        INSTALL_DIR=$(prompt_val "Install path" "$INSTALL_DIR")
        if [[ -d "$INSTALL_DIR" ]]; then
            fail "That directory also exists. Remove it or pick another path."
            exit 1
        fi
        git clone "$REPO" "$INSTALL_DIR"
    fi
else
    info "Cloning to $INSTALL_DIR"
    git clone "$REPO" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
info "Working in $INSTALL_DIR"

# =========================================================================
# Model Selection
# =========================================================================

header "Choose a model"

echo "  ${DIM}Smaller = faster + less VRAM, larger = smarter${NC}"
echo ""
echo "  1)  qwen2.5:3b     ~2 GB     Lightweight"
echo "  2)  qwen2.5:7b     ~4.5 GB   Recommended"
echo "  3)  qwen2.5:14b    ~9 GB     Higher quality"
echo "  4)  qwen2.5:32b    ~20 GB    Best quality"
echo "  5)  Custom"
echo ""

MODEL_CHOICE=$(prompt_val "Select" "2")

case "$MODEL_CHOICE" in
    1) OLLAMA_MODEL="qwen2.5:3b" ;;
    2) OLLAMA_MODEL="qwen2.5:7b" ;;
    3) OLLAMA_MODEL="qwen2.5:14b" ;;
    4) OLLAMA_MODEL="qwen2.5:32b" ;;
    5)
        OLLAMA_MODEL=$(prompt_val "Model name (e.g. llama3.1:8b)" "qwen2.5:7b")
        ;;
    *) OLLAMA_MODEL="qwen2.5:7b" ;;
esac

info "Model: $OLLAMA_MODEL"

# =========================================================================
# Configure .env
# =========================================================================

header "Configuring"

cp .env.example .env

sed -i "s|^OLLAMA_MODEL=.*|OLLAMA_MODEL=$OLLAMA_MODEL|" .env

PORT_CHOICE=$(prompt_val "Port" "7200")
sed -i "s|^PORT=.*|PORT=$PORT_CHOICE|" .env

if [[ "$GPU_MODE" == "cpu" ]]; then
    echo "COMPOSE_FILE=compose.cpu.yml" >> .env
    info "Compose: compose.cpu.yml (CPU-only)"
else
    info "Compose: compose.yml (GPU)"
fi

info "Port: $PORT_CHOICE"
info "Model: $OLLAMA_MODEL"
info ".env written"

# =========================================================================
# Optional: Local Linting Tools
# =========================================================================

echo ""
if prompt_yn "Install local linting tools? (dev only, not needed to run)" "n"; then
    if command -v uv &>/dev/null; then
        info "Installing backend dev dependencies..."
        (cd backend && uv sync --group dev)
    else
        warn "uv not found — skipping backend linting tools"
    fi

    if command -v pnpm &>/dev/null; then
        info "Installing frontend dependencies..."
        (cd frontend && pnpm install)
    elif command -v npm &>/dev/null; then
        info "Installing frontend dependencies via npm..."
        (cd frontend && npm install)
    else
        warn "pnpm/npm not found — skipping frontend linting tools"
    fi
else
    info "Skipping linting tools"
fi

# =========================================================================
# Build & Start
# =========================================================================

header "Building"

docker compose build

header "Starting"

docker compose up -d

info "Waiting for Ollama to be ready..."
TRIES=0
until docker compose exec ollama ollama list &>/dev/null 2>&1; do
    sleep 2
    TRIES=$((TRIES + 1))
    if [[ $TRIES -ge 60 ]]; then
        fail "Ollama did not start within 2 minutes"
        warn "Try: docker compose logs ollama"
        exit 1
    fi
done

info "Pulling $OLLAMA_MODEL (this may take a while)..."
docker compose exec ollama ollama pull "$OLLAMA_MODEL"

# =========================================================================
# Done
# =========================================================================

echo ""
echo -e "  ${GREEN}${BOLD}Angela 3D is ready${NC}"
echo ""
echo -e "  Open ${BOLD}http://localhost:${PORT_CHOICE}${NC}"
echo ""
echo -e "  ${DIM}Commands (from ${INSTALL_DIR}):${NC}"
echo ""
echo -e "    ${CYAN}make up${NC}       Start with logs"
echo -e "    ${CYAN}make down${NC}     Stop everything"
echo -e "    ${CYAN}make logs${NC}     Follow logs"
echo -e "    ${CYAN}make status${NC}   Check health"
echo -e "    ${CYAN}make pull${NC}     Pull/update model"
echo ""
echo -e "  ${DIM}Or with just:${NC}  just up / just down / just logs"
echo -e "  ${DIM}Or with npm:${NC}   npm run up / npm run down / npm run logs"
echo ""
echo -e "${CYAN}"
cat << 'ART'
  ⡇⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⢁⣿⣿⡏⠉⠉⠉⠉⠉⠉⠉⠉⠉⢹⣇⠉⠉⢳⣌⢉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠇⠀⠀⢸⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣧⠀⠀⢻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣰⠀⠀⢸⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣷⣄⠀⠹⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⢸⢸⣿⡿⠿⢃⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠻⠿⣿⣦⣀⠙⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⣈⣛⣋⡄⢨⣨⣶⣶⣶⣷⡶⡀⠀⠀⠀⠀⠀⢀⠀⢿⣷⣶⣶⣶⣶⣷⣤⣭⡅⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⡄⣇⣟⠿⣿⣿⣷⣱⡀⠀⠀⠀⠀⢸⡄⢸⣿⠿⢛⠛⠛⠻⢿⡟⣽⠆⡀⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠓⠀⠐⠒⠈⠻⣷⣌⠟⣿⣧⣵⡐⡄⠀⠀⠸⡿⠀⠀⠀⢀⡀⠀⠀⠀⠈⠃⢜⡁⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⡐⠀⠀⠠⠤⠀⠀⠈⠻⣦⣽⣿⣿⣷⡜⠆⠀⠀⣵⡆⠀⠈⠛⠁⠀⠀⢢⡀⠘⢿⡇⠀⠀⠀⠀⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⢀⢡⡀⢀⢠⠀⠀⠆⡀⣿⣧⣼⣿⣿⣿⣿⣯⣼⣷⣄⠸⣇⢠⣲⣤⣜⣠⢀⣾⠟⣠⣾⣇⠀⠀⣠⣤⠀⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠈⠆⣩⣈⠻⣿⣿⠞⣡⡿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣜⡢⢝⣻⠛⠋⠵⠖⠖⣢⣿⡇⠀⠀⣭⡹⣇⠀⠀⡇
  ⡇⠀⠀⠀⠀⠀⠀⠀⠀⠰⣶⣭⣛⣓⣂⣭⣵⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡖⢶⠒⠿⠷⢿⣿⣿⡇⠀⠈⣿⢡⣿ ⠀⡇
  ⡇ ⠀⠀⠀⠀⠀⠀⠀⠀⠉⣋⠉⣫⣼⣿⣿⣿⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣶⣶⣾⣿⣿⠀⢀⡠⢟⣼⠏ ⠀⡇
  ⡇⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⢀⣼⡰⢛⣁⣀⣀⣀⡇
ART
echo -e "${NC}"
