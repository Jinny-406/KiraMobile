# Kira Termux Hacker Tools Documentation

## Overview
Kira has been enhanced with comprehensive Termux (Android) support, adding 30+ hacker tools and reverse engineering capabilities.

## Auto-Detection
Kira automatically detects Termux environment on startup and loads appropriate tools.

## New Commands

### `/hacker`
Main menu for hacker toolkit. Shows categories:
- Network Scanning
- Web Pentesting
- Password Attacks
- WiFi Tools
- OSINT/Info Gathering
- APK Reverse Engineering
- Binary Reverse Engineering
- Termux API Tools

### `/re <apk_path>`
Quick APK reverse engineering:
- `/re app.apk` - Decompile with Apktool
- `/re jadx app.apk` - Decompile with Jadx (to Java)
- `/re apktool app.apk` - Decompile with Apktool
- `/re androguard app.apk` - Full analysis with Androguard

### `/scan <target>`
Quick network scan using Nmap:
```
/scan 192.168.1.1
```

## Tool Categories

### 1. Termux API Tools (Android Features)
Requires: `pkg install termux-api`

| Tool | Description | Command |
|------|-------------|---------|
| SMS Send | Send SMS messages | `termux_sms_send` |
| SMS List | List SMS messages | `termux_sms_list` |
| Location | Get GPS coordinates | `termux_location` |
| Battery | Battery status | `termux_battery` |
| Clipboard Get | Get clipboard | `termux_clipboard_get` |
| Clipboard Set | Set clipboard | `termux_clipboard_set` |
| Notify | Send notification | `termux_notify` |
| TTS | Text-to-speech | `termux_tts` |
| Vibrate | Vibrate device | `termux_vibrate` |
| WiFi | WiFi connection info | `termux_wifi` |
| Device Info | Device details | `termux_device_info` |
| Camera Info | List cameras | `termux_camera_info` |

### 2. Network Scanning
Requires: `pkg install nmap masscan amass`

| Tool | Description | Command |
|------|-------------|---------|
| Nmap | Network scanner | `nmap_scan` |
| Masscan | High-speed port scan | `masscan_scan` |
| Amass | Subdomain enumeration | `amass_enum` |

Examples:
```
nmap_scan target=192.168.1.1 args=-sV -T4
masscan_scan target=192.168.1.0/24
amass_enum domain=example.com
```

### 3. Web Pentesting
Requires: `pkg install sqlmap nikto dirb whatweb` + `pip install sublist3r`

| Tool | Description | Command |
|------|-------------|---------|
| SQLmap | SQL injection tester | `sqlmap_scan` |
| Nikto | Web server scanner | `nikto_scan` |
| Dirb | Directory bruteforce | `dirb_scan` |
| Sublist3r | Subdomain enumeration | `sublist3r_enum` |
| WhatWeb | Web tech identification | `whatweb_scan` |

Examples:
```
sqlmap_scan url=http://example.com/id=1
nikto_scan host=http://example.com
dirb_scan url=http://example.com
```

### 4. Password Attacks
Requires: `pkg install hydra john hashid`

| Tool | Description | Command |
|------|-------------|---------|
| Hydra | Login bruteforce | `hydra_attack` |
| John | Password cracking | `john_crack` |
| HashID | Identify hash types | `hash_id` |

Examples:
```
hydra_attack target=192.168.1.1 service=ssh username=admin
john_crack hashfile=hashes.txt
hash_id hash=$1$abc123...
```

### 5. WiFi Tools (Requires root/external adapter)
Requires: `pkg install aircrack-ng`

| Tool | Description | Command |
|------|-------------|---------|
| Airmon | Enable monitor mode | `airmon_start` |
| Airodump | Capture WiFi handshakes | `airodump_scan` |
| Aircrack | Crack WPA handshakes | `aircrack_crack` |

Examples:
```
airmon_start interface=wlan0
airodump_scan interface=wlan0mon output=capture
aircrack_crack capture=cap-01.cap
```

### 6. OSINT/Info Gathering
Requires: `pkg install theharvester dnsrecon whois`

| Tool | Description | Command |
|------|-------------|---------|
| theHarvester | Email/subdomain harvesting | `theharvester` |
| DNSRecon | DNS enumeration | `dnsrecon` |
| Whois | Domain registration info | `whois_lookup` |

Examples:
```
theharvester domain=example.com sources=all
dnsrecon domain=example.com
whois_lookup target=example.com
```

### 7. APK Reverse Engineering
Requires: `pkg install apktool dex2jar baksmali smali` + `pip install androguard`

| Tool | Description | Command |
|------|-------------|---------|
| Apktool Decompile | Decode APK resources | `apk_decompile` |
| Apktool Recompile | Rebuild APK | `apk_recompile` |
| Jadx | Decompile to Java | `jadx_decompile` |
| Androguard | Full APK analysis | `androguard_analyze` |
| Dex2Jar | Convert DEX to JAR | `dex2jar` |
| Smali Disassemble | DEX to smali | `smali_disassemble` |
| Smali Assemble | Smali to DEX | `smali_assemble` |

Examples:
```
apk_decompile apkPath=app.apk outputDir=./decompiled
jadx_decompile apkPath=app.apk
androguard_analyze apkPath=app.apk
dex2jar dexPath=classes.dex
```

### 8. Binary Reverse Engineering
Requires: `pkg install radare2`

| Tool | Description | Command |
|------|-------------|---------|
| R2 Analyze | Analyze binary | `r2_analyze` |
| R2 Disassemble | Disassemble functions | `r2_disassemble` |
| R2 Decompile | Decompile with r2dec | `r2_decompile` |
| R2 Functions | List functions | `r2_functions` |
| R2 Strings | Extract strings | `r2_strings` |

Examples:
```
r2_analyze binaryPath=./binary
r2_disassemble binaryPath=./binary function=main
r2_decompile binaryPath=./binary
```

## Auto-Install Feature
All tools support auto-installation. If a tool is not found, Kira will attempt to install it via `pkg install` or `pip install` automatically.

Example:
```
> nmap_scan target=192.168.1.1
[kira] Installing nmap...
(automatically runs: pkg install nmap)
```

## Installation

### On Termux:
```bash
curl -fsSL https://raw.githubusercontent.com/JinnyChandio/Kira2/main/install.sh | bash
```

The updated install.sh now installs:
- nmap, hydra, sqlmap, nikto, dirb
- sublist3r, theharvester, dnsrecon
- whois, john, aircrack-ng
- radare2, masscan, amass
- androguard (pip)
- jadx (from GitHub releases)

### Post-Install:
1. Install Termux:API from F-Droid
2. Run: `pkg install termux-api`
3. Grant permissions in Android settings

## File Structure

### New Files Created:
1. `src/tools/tool_installer.js` - Auto-install system
2. `src/tools/termux_api.js` - Android API tools
3. `src/tools/network_scan.js` - Network tools
4. `src/tools/web_pentest.js` - Web pentest tools
5. `src/tools/password_attacks.js` - Password attack tools
6. `src/tools/wifi_tools.js` - WiFi hacking tools
7. `src/tools/osint.js` - OSINT tools
8. `src/tools/apk_tools.js` - APK reverse engineering
9. `src/tools/binary_re.js` - Binary reverse engineering

### Modified Files:
1. `src/config/index.js` - Added Termux detection
2. `src/index.js` - Load Termux tools, add /hacker, /re, /scan commands
3. `install.sh` - Added hacker packages installation

## Legal Disclaimer
These tools are for:
- Educational purposes
- Authorized penetration testing
- Security research on systems you own
- CTF competitions

Always obtain explicit written permission before testing any system you do not own. Unauthorized access is illegal.

## Support
- GitHub: https://github.com/JinnyChandio/Kira2
- Issues: https://github.com/JinnyChandio/Kira2/issues
