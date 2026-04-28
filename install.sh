#!/data/data/com.termux/files/usr/bin/bash

RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
BLD='\033[1m'
RST='\033[0m'

echo ""
echo -e "${BLD}     ██╗██╗███╗   ██╗███╗   ██╗██╗   ██╗${RST}"
echo -e "${BLD}     ██║██║████╗  ██║████╗  ██║╚██╗ ██╔╝${RST}"
echo -e "${BLD}     ██║██║██╔██╗ ██║██╔██╗ ██║ ╚████╔╝ ${RST}"
echo -e "${BLD}██   ██║██║██║╚██╗██║██║╚██╗██║  ╚██╔╝  ${RST}"
echo -e "${BLD}╚█████╔╝██║██║ ╚████║██║ ╚████║   ██║   ${RST}"
echo -e "${BLD} ╚════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝   ╚═╝   ${RST}"
echo ""
echo -e "  ${YLW}android. terminal. alive.${RST}"
echo ""

if [ ! -d "/data/data/com.termux" ]; then
  echo -e "${RED}error: run this inside Termux${RST}"
  exit 1
fi

echo -e "${GRN}[1/6]${RST} updating packages..."
pkg update -y || echo "Package update failed, continuing..."

echo -e "${GRN}[1.5/6]${RST} adding unstable repository..."
pkg install -y root-repo 2>/dev/null || true
pkg install -y unstable-repo 2>/dev/null || true
pkg update -y || true

echo -e "${GRN}[2/6]${RST} installing dependencies..."
pkg install -y nodejs git curl wget unzip || {
  echo -e "${RED}Failed to install dependencies${RST}"
  exit 1
}

echo -e "${GRN}[3/6]${RST} cloning kira..."
if [ -d "$HOME/kira" ]; then
  echo "  existing install found — pulling latest..."
  cd "$HOME/kira" && git pull || echo "Git pull failed, trying fresh clone..."
fi

if [ ! -d "$HOME/kira" ]; then
  git clone --depth=1 https://github.com/Jinny-406/KiraMobile.git "$HOME/kira" || {
    echo -e "${RED}Clone failed${RST}"
    exit 1
  }
fi

echo -e "${GRN}[4/6]${RST} installing node modules..."
cd "$HOME/kira" || exit 1
export PUPPETEER_SKIP_DOWNLOAD=true
npm install --no-optional 2>&1 || {
  echo -e "${YLW}Trying npm install with --force...${RST}"
  npm install --force --no-optional 2>&1 || echo -e "${RED}npm install failed - check errors above${RST}"
}

echo -e "${GRN}[5/6]${RST} installing hacker tools (optional)..."
pkg install -y nmap steghide exiftool binwalk qrencode crunch || echo "Some packages failed"

# Try unstable repo for more tools
pkg install -y -t unstable hydra sqlmap nikto dirb sublist3r theharvester dnsrecon whois john aircrack-ng radare2 masscan amass searchsploit exploitdb tcpdump foremost bettercap nuclei cewl hashcat proot proot-distro gobuster feroxbuster rustscan dirsearch iftop nethogs htop bluez-utils seclists 2>/dev/null || echo "Some unstable packages failed"

# Install gems for zsteg
gem install zsteg 2>/dev/null || echo "zsteg install skipped"

echo -e "${GRN}[5.5/6]${RST} installing python tools (optional)..."
pip install androguard sherlock-project phoneutils 2>/dev/null || echo "Python tools install skipped"

echo -e "${GRN}[5.7/6]${RST} installing jadx (optional)..."
if [ ! -f "$HOME/jadx/bin/jadx" ]; then
  wget -q https://github.com/skylot/jadx/releases/latest/download/jadx-*-zip -O /tmp/jadx.zip 2>/dev/null
  unzip -q /tmp/jadx.zip -d $HOME/jadx 2>/dev/null
  rm -f /tmp/jadx.zip 2>/dev/null
  echo "jadx installed"
fi

echo -e "${GRN}[6/6]${RST} setting up kira command..."
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/kira" << 'CMD'
#!/data/data/com.termux/files/usr/bin/bash
cd "$HOME/kira" && node src/index.js "$@"
CMD
chmod +x "$HOME/.local/bin/kira"

# Add to PATH in shell config
SHELL_RC="$HOME/.bashrc"
[ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"
if ! grep -q "\.local/bin" "$SHELL_RC" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
fi
export PATH="$HOME/.local/bin:$PATH"

echo ""
echo -e "${BLD}  done.${RST}"
echo ""
echo -e "  type ${YLW}kira${RST} to start"
echo ""
echo -e "  ${RED}tip:${RST} install Termux:API for full features"
echo -e "  f-droid.org/en/packages/com.termux.api/"
echo ""
echo -e "  ${YLW}If 'kira' command not found, run:${RST}"
echo -e "  ${YLW}export PATH=\$HOME/.local/bin:\$PATH${RST}"
echo ""
