#!/data/data/com.termux/files/usr/bin/bash
set -e

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

echo -e "${GRN}[1/5]${RST} updating packages..."
pkg update -y -q 2>/dev/null || true

echo -e "${GRN}[2/5]${RST} installing dependencies..."
pkg install -y nodejs git 2>/dev/null

echo -e "${GRN}[3/5]${RST} cloning kira..."
if [ -d "$HOME/kira" ]; then
  echo "  existing install found — pulling latest..."
  cd "$HOME/kira" && git pull -q
else
  git clone --depth=1 https://github.com/Jinny-406/KiraMobile.git "$HOME/kira" -q
fi

echo -e "${GRN}[4/5]${RST} installing node modules..."
cd "$HOME/kira" && npm install --silent 2>/dev/null

echo -e "${GRN}[4.5/6]${RST} installing hacker tools..."
pkg install -y nmap hydra sqlmap nikto dirb sublist3r theharvester dnsrecon whois john aircrack-ng radare2 masscan amass searchsploit exploitdb steghide zsteg exiftool tcpdump foremost binwalk bettercap nuclei qrencode cewl crunch hashcat proot proot-distro gobuster feroxbuster rustscan dirsearch iftop nethogs htop bluez-utils seclists 2>/dev/null || true

# Install gems for zsteg
gem install zsteg 2>/dev/null || true

echo -e "${GRN}[5/6]${RST} installing python tools..."
pip install androguard sherlock-project phoneutils quark-engine mobsf apkleaks 2>/dev/null || true

echo -e "${GRN}[5.5/6]${RST} installing jadx..."
if [ ! -f "$HOME/jadx/bin/jadx" ]; then
  wget -q https://github.com/skylot/jadx/releases/latest/download/jadx-*-zip -O /tmp/jadx.zip 2>/dev/null
  unzip -q /tmp/jadx.zip -d $HOME/jadx 2>/dev/null
  rm -f /tmp/jadx.zip 2>/dev/null
fi

echo -e "${GRN}[5.7/6]${RST} installing proot Ubuntu..."
proot-distro install ubuntu 2>/dev/null || true

echo -e "${GRN}[6/6]${RST} setting up kira command..."
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/kira" << 'CMD'
#!/data/data/com.termux/files/usr/bin/bash
cd "$HOME/kira" && node src/index.js "$@"
CMD
chmod +x "$HOME/.local/bin/kira"

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
