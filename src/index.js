'use strict';
const config    = require('./config');
const workspace = require('./workspace');
const soul      = require('./core/soul');
const brain     = require('./core/brain');
const engine    = require('./core/engine');
const heartbeat = require('./core/heartbeat');
const loop      = require('./core/loop');
const tui       = require('./tui');
const telegram  = require('./integrations/telegram');
const discord   = require('./integrations/discord');
// const whatsapp  = require('./integrations/whatsapp');
const { showHelp } = require('./tui/menu');
const { createMenu, prompt } = require('./tui/menu');

// Load core tools
require('./tools/exec');
require('./tools/memory');
require('./tools/realworld');
require('./tools/kiraservice');
require('./tools/semantic_memory');
require('./tools/social');
require('./tools/self_modify');
require('./tools/google');
require('./tools/search');
require('./tools/write_file');
require('./tools/read_file');

// Load new modules
require('./tools/memory/user_profile');
require('./tools/memory/preferences');
require('./tools/memory/secrets');
require('./tools/memory/dreams');
require('./tools/memory/conversation');
require('./tools/memory/inside_jokes');
require('./tools/diary/diary');
require('./tools/diary/relationship');
require('./tools/personality/compliments');
require('./tools/personality/encouragement');
require('./tools/personality/pet_names');
require('./tools/personality/moods');
require('./tools/personality/daily_q');
require('./tools/personality/question_ask');
require('./tools/reputation/trust_meter');
require('./tools/reputation/apology');
require('./tools/reputation/forgiveness');
require('./tools/reputation/rewards');
require('./tools/media/spotify');
require('./tools/media/youtube');
require('./tools/media/movies');
require('./tools/browser');
require('./tools/email');
require('./tools/app_launcher');
require('./tools/clipboard');
require('./tools/file_search');
require('./tools/code_exec');
require('./tools/backup');
require('./tools/greetings');
require('./tools/checkins');
require('./tools/triggers');

// Load Termux tools if on Termux
const { isTermux } = require('./tools/tool_installer');
if (isTermux()) {
  console.log('[kira] Termux detected - loading hacker tools...');
  
  // Core Termux tools
  require('./tools/termux_api');
  
  // Hacker tools - Scanning & Pentesting
  require('./tools/network_scan');
  require('./tools/web_pentest');
  require('./tools/password_attacks');
  require('./tools/wifi_tools');
  require('./tools/osint');
  
  // Reverse engineering
  require('./tools/apk_tools');
  require('./tools/binary_re');
  
  // Additional tools - Social engineering
  require('./tools/social_engineering');
  require('./tools/exploitation');
  
  // Steganography & Forensics
  require('./tools/steganography');
  require('./tools/forensics');
  
  // Advanced network attacks
  require('./tools/advanced_network');
  
  // Vulnerability scanners
  require('./tools/vuln_scanners');
  
  // Mobile-specific tools
  require('./tools/mobile_pentest');
  
  // Threat intelligence
  require('./tools/threat_intel');
  
  // Password analysis
  require('./tools/password_analysis');
  
  // Automation & Reporting
  require('./tools/automation');
  
  // Containers & Virtualization
  require('./tools/containers');
  
  // Malware Analysis
  require('./tools/malware_analysis');
  
  // CTF Tools
  require('./tools/ctf_tools');
  
  // Hardware Tools (Bluetooth/NFC)
  require('./tools/hardware_tools');
  
  // Monitoring Tools
  require('./tools/monitoring');
}

// Load MCP server
let mcpServer = null;
try {
  mcpServer = require('./mcp');
  console.log('[MCP] Server module loaded');
} catch (e) {
  console.log('[MCP] MCP not available:', e.message);
}

// Load skills system (builtin + user installed)
try {
  const skillLoader = require('./tools/skills/loader');
  const count = skillLoader.loadAll();
  if (count > 0) console.log(`[kira] ${count} skills loaded`);
} catch (e) {
  console.error('[kira] skills failed to load:', e.message);
}

// Load plugins system
let pluginLoader = null;
try {
  pluginLoader = require('./tools/plugins/loader');
  pluginLoader.loadAll();
} catch (e) {
  console.error('[kira] plugins failed to load:', e.message);
}

async function cmd(input, parts) {
  const sub = parts[1];

  switch (parts[0]) {
    case '/help':
    case '/config':
      await showHelp(tui);
      break;

    case '/skills': {
      try {
        const skillLoader = require('./tools/skills/loader');
        const { builtin, user } = skillLoader.listSkills();
        const lines = [];
        if (builtin.length) lines.push(`builtin: ${builtin.join(', ')}`);
        if (user.length)    lines.push(`yours:   ${user.map(s => s.name).join(', ')}`);
        if (!lines.length)  lines.push('no skills loaded.');
        tui.addMessage('system', lines.join('\n'));
      } catch (e) {
        tui.addMessage('error', e.message);
      }
      break;
    }

    case '/status': {
      const hb    = heartbeat.info();
      const stats = engine.stats();
      const cfg   = config.load();
      tui.addMessage('system', [
        `status  : ${hb.status}`,
        `uptime  : ${hb.uptime()}`,
        `turns   : ${stats.turns}`,
        `model   : ${stats.model}`,
        `api     : ${stats.baseUrl}`,
        `user    : ${cfg.name}`,
        `device  : ${cfg.device || 'PC'}`,
        `tg      : ${cfg.telegramToken ? 'connected' : 'off'}`,
        `discord : ${cfg.discordToken ? 'connected' : 'off'}`,
        `whatsapp: ${whatsapp.running ? 'connected' : 'off'}`,
      ].join('\n'));
      break;
    }

    case '/memory': {
      const mem  = require('./tools/memory');
      const data = mem.load();
      if (!sub || sub === 'list') {
        const keys = Object.keys(data);
        tui.addMessage('system', keys.length ? keys.map(k => `${k}: ${data[k].value}`).join('\n') : 'nothing stored');
      } else if (sub === 'get' && parts[2]) {
        tui.addMessage('system', data[parts[2]] ? `${parts[2]}: ${data[parts[2]].value}` : 'not found');
      } else if (sub === 'set' && parts[2] && parts[3]) {
        const updated = { ...data, [parts[2]]: { value: parts.slice(3).join(' '), at: new Date().toISOString() } };
        mem.save(updated);
        tui.addMessage('system', `saved: ${parts[2]}`);
      }
      break;
    }

    case '/workspace': {
      if (!sub) {
        tui.addMessage('system', Object.keys(workspace.DOCS).join('\n'));
      } else {
        const content = workspace.read(sub.toUpperCase());
        tui.addMessage('system', content || 'not found');
      }
      break;
    }

    case '/reload':
      config.invalidate();
      workspace.init();
      engine.init(soul);
      tui.addMessage('system', 'reloaded.');
      break;

    case '/clear':
      engine.clearHistory();
      tui.addMessage('system', 'history cleared.');
      break;

    case '/whatsapp': {
      const cfg = config.load();
      const allowed = cfg.whatsappAllowed || [];
      
      const choice = await createMenu('whatsapp settings', [
        `status: ${whatsapp.running ? 'connected' : 'not connected'}`,
        whatsapp.running ? 'stop bot' : 'start bot',
        'generate QR',
        'add number',
        'view allowed numbers',
        'remove number',
        'back',
      ], tui);

      if (choice === 0) {
        if (whatsapp.running) {
          whatsapp.stop();
          tui.addMessage('system', 'whatsapp stopped.');
        } else {
          const started = await whatsapp.start(msg => tui.addMessage('system', `whatsapp: ${msg}`));
          if (started) {
            tui.addMessage('system', 'whatsapp started.');
          }
        }
      } else if (choice === 1) {
        const started = await whatsapp.generateQRCode(msg => tui.addMessage('system', `whatsapp: ${msg}`));
        if (started) {
          tui.addMessage('system', 'WhatsApp QR generated. Scan it with your phone.');
        }
      } else if (choice === 2) {
        const num = await prompt('phone number (just digits, e.g., 1234567890 or 919876543210)');
        if (num) {
          const cleaned = num.replace(/[^\d]/g, ''); // Remove any non-digits
          if (cleaned) {
            if (!allowed.includes(cleaned)) {
              allowed.push(cleaned);
              config.set('whatsappAllowed', allowed);
              whatsapp.allowed = allowed; // Reload immediately
              tui.addMessage('system', `allowed: ${cleaned}`);
            } else {
              tui.addMessage('system', 'already in allowed list.');
            }
          } else {
            tui.addMessage('system', 'invalid number format.');
          }
        }
      } else if (choice === 3) {
        if (allowed.length > 0) {
          tui.addMessage('system', `Allowed numbers: ${allowed.join(', ')}`);
        } else {
          tui.addMessage('system', 'No allowed numbers yet.');
        }
      } else if (choice === 4) {
        const num = await prompt('phone number to remove');
        if (num) {
          const cleaned = num.replace(/[^\d]/g, '');
          if (allowed.includes(cleaned)) {
            const idx = allowed.indexOf(cleaned);
            allowed.splice(idx, 1);
            config.set('whatsappAllowed', allowed);
            whatsapp.allowed = allowed; // Reload immediately
            tui.addMessage('system', `removed: ${cleaned}`);
          } else {
            tui.addMessage('system', 'not found.');
          }
        }
      }
      break;
    }

    case '/discord': {
      const cfg = config.load();
      if (!cfg.discordToken) {
        process.stdout.write('\n');
        tui.addMessage('system', 'discord token not set.');
        const token = await prompt('bot token (from Discord Developer Portal)');
        if (token) {
          const started = await discord.start(msg => tui.addMessage('system', `discord: ${msg}`), token);
          if (started) {
            config.set('discordToken', token);
            const userId = await prompt('your discord user ID');
            if (userId) {
              config.set('discordAllowed', [userId]);
              discord.allowed = [userId];
            }
            tui.addMessage('system', 'discord started.');
          } else {
            config.set('discordToken', '');
            tui.addMessage('system', 'discord token invalid or connection failed. Please re-enter your token.');
          }
        }
        return;
      }

      const allowed = cfg.discordAllowed || [];
      const choice = await createMenu('discord settings', [
        discord.running ? 'stop bot' : 'start bot',
        'add allowed user',
        'view allowed users',
        'change token',
        'remove token',
        'back',
      ], tui);

      if (choice === 0) {
        if (discord.running) {
          discord.stop();
          tui.addMessage('system', 'discord stopped.');
        } else {
          await discord.start(msg => tui.addMessage('system', `discord: ${msg}`));
          tui.addMessage('system', 'discord started.');
        }
      } else if (choice === 1) {
        const userId = await prompt('user ID');
        if (userId) {
          if (!allowed.includes(userId)) {
            allowed.push(userId);
            config.set('discordAllowed', allowed);
            discord.allowed = allowed; // Reload immediately
            tui.addMessage('system', `allowed: ${userId}`);
          } else {
            tui.addMessage('system', 'already in allowed list.');
          }
        }
      } else if (choice === 2) {
        tui.addMessage('system', allowed.length ? allowed.join(', ') : 'no users set');
        await prompt('press enter', '');
      } else if (choice === 3) {
        const token = await prompt('new bot token');
        if (token) {
          discord.stop();
          const started = await discord.start(msg => tui.addMessage('system', `discord: ${msg}`), token);
          if (started) {
            config.set('discordToken', token);
            tui.addMessage('system', 'discord token updated and restarted.');
          } else {
            config.set('discordToken', '');
            tui.addMessage('system', 'discord token invalid or connection failed. Please re-enter your token.');
          }
        }
      } else if (choice === 4) {
        discord.stop();
        config.set('discordToken', '');
        config.set('discordAllowed', []);
        tui.addMessage('system', 'discord removed.');
      }
      break;
    }

    case '/model': {
      const providers = [
        'OpenAI',
        'Anthropic',
        'Groq',
        'Together AI',
        'Mistral',
        'Ollama',
        'NVIDIA NIM',
        'Custom'
      ];
      const choice = await createMenu('select provider', providers, tui);
      if (choice >= 0 && choice < providers.length) {
        const provider = providers[choice];
        let baseUrl = '';
        let model = '';
        if (choice === 0) { // OpenAI
          baseUrl = 'https://api.openai.com/v1';
          model = 'gpt-4';
        } else if (choice === 1) { // Anthropic
          baseUrl = 'https://api.anthropic.com/v1';
          model = 'claude-3-sonnet-20240229';
        } else if (choice === 2) { // Groq
          baseUrl = 'https://api.groq.com/openai/v1';
          model = 'llama2-70b-4096';
        } else if (choice === 3) { // Together AI
          baseUrl = 'https://api.together.xyz/v1';
          model = 'meta-llama/Llama-2-70b-chat-hf';
        } else if (choice === 4) { // Mistral
          baseUrl = 'https://api.mistral.ai/v1';
          model = 'mistral-medium';
        } else if (choice === 5) { // Ollama
          baseUrl = 'http://localhost:11434/v1';
          model = 'llama2';
        } else if (choice === 6) { // NVIDIA NIM
          baseUrl = 'https://integrate.api.nvidia.com/v1';
          model = 'meta/llama3-70b-instruct';
        } else if (choice === 7) { // Custom
          baseUrl = await prompt('base URL');
          model = await prompt('model name');
        }
        if (baseUrl && model) {
          const key = await prompt('API key');
          if (key) {
            config.set('provider', provider);
            config.set('baseUrl', baseUrl);
            config.set('model', model);
            config.set('apiKey', key);
            config.invalidate();
            workspace.init();
            engine.init(soul);
            tui.addMessage('system', `switched to ${provider} - ${model}`);
          }
        }
      }
      break;
    }

    case '/savechat': {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      const history = engine.getHistory();
      if (!history || history.length === 0) {
        tui.addMessage('system', 'no chat history to save.');
        break;
      }
      const chatText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      const downloadsDir = path.join(os.homedir(), 'Downloads');
      const fileName = `kira_chat_${new Date().toISOString().slice(0, 10)}.txt`;
      const filePath = path.join(downloadsDir, fileName);
      try {
        fs.writeFileSync(filePath, chatText, 'utf8');
        tui.addMessage('system', `chat saved to ${filePath}`);
      } catch (e) {
        tui.addMessage('error', `failed to save chat: ${e.message}`);
      }
      break;
    }

    case '/exit':
      tui.addMessage('system', 'saving...');
      await soul.updateDocs(engine);
      await soul.selfImprove(engine);
      await brain.sleep(engine, engine.getHistory());
      heartbeat.stop(true);
      break;

    case '/mcp': {
      if (!mcpServer) {
        tui.addMessage('system', 'MCP not available');
        break;
      }
      const sub = parts[1];
      if (sub === 'list') {
        const tools = mcpServer.listTools();
        tui.addMessage('system', `MCP Tools (${tools.length}):\n${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}`);
      } else if (sub === 'call' && parts[2]) {
        const toolName = parts[2];
        const args = parts.slice(3).join(' ');
        try {
          const result = await mcpServer.handleToolCall(toolName, JSON.parse(args || '{}'));
          tui.addMessage('system', JSON.stringify(result, null, 2));
        } catch (e) {
          tui.addMessage('error', e.message);
        }
      } else {
        tui.addMessage('system', 'MCP Commands:\n- /mcp list: List tools\n- /mcp call <tool> <args>: Call a tool');
      }
      break;
    }

    case '/hacker': {
      if (!isTermux()) {
        tui.addMessage('error', 'Hacker tools only available on Termux');
        break;
      }
      const choice = await createMenu('hacker toolkit', [
        'network scanning (nmap, masscan, amass)',
        'web pentest (sqlmap, nikto, dirb)',
        'password attacks (hydra, john, hashcat)',
        'wifi tools (aircrack-ng, bettercap)',
        'OSINT (theHarvester, dnsrecon, Shodan)',
        'APK reverse engineering (jadx, apktool, androguard)',
        'binary reverse engineering (radare2, nuclei)',
        'Termux API tools (SMS, GPS, clipboard)',
        'social engineering (qrcode, phishing templates)',
        'steganography (steghide, zsteg, exiftool)',
        'forensics (tcpdump, foremost, binwalk)',
        'vuln scanners (nuclei, exploit-db, sherlock)',
        'mobile pentest (android backup, permissions)',
        'threat intel (virustotal, abuseIP, crt.sh)',
        'password analysis (crackstation, cewl, patterns)',
        'automation (auto-recon, reports, scheduling)',
        'containers (proot, ubuntu, alpile)',
        'malware analysis (quark, mobsf, apkleaks)',
        'CTF tools (gobuster, feroxbuster, seclists)',
        'hardware (bluetooth, nfc)',
        'monitoring (iftop, htop, nethogs)',
        'back',
      ], tui);

      if (choice === 0) {
        tui.addMessage('system', 'Tools: nmap_scan, masscan_scan, amass_enum\nUsage: /cmd nmap_scan target=192.168.1.1');
      } else if (choice === 1) {
        tui.addMessage('system', 'Tools: sqlmap_scan, nikto_scan, dirb_scan, sublist3r_enum, whatweb_scan');
      } else if (choice === 2) {
        tui.addMessage('system', 'Tools: hydra_attack, john_crack, hashcat_benchmark, hash_id');
      } else if (choice === 3) {
        tui.addMessage('system', 'Tools: airmon_start, airodump_scan, aircrack_crack, bettercap_scan');
      } else if (choice === 4) {
        tui.addMessage('system', 'Tools: theharvester, dnsrecon, whois_lookup, shodan_search, crtsh_lookup');
      } else if (choice === 5) {
        tui.addMessage('system', 'Tools: apk_decompile, apk_recompile, jadx_decompile, androguard_analyze, dex2jar, smali_disassemble');
      } else if (choice === 6) {
        tui.addMessage('system', 'Tools: r2_analyze, r2_disassemble, r2_decompile, r2_functions, r2_strings, nuclei_scan');
      } else if (choice === 7) {
        tui.addMessage('system', 'Tools: termux_sms_send, termux_location, termux_battery, termux_clipboard_get/set, termux_notify, termux_tts, termux_vibrate');
      } else if (choice === 8) {
        tui.addMessage('system', 'Tools: qrcode_generate, shorturl_create, email_harvest, phishing_template');
      } else if (choice === 9) {
        tui.addMessage('system', 'Tools: steghide_embed, steghide_extract, zsteg_check, exif_read, file_signature');
      } else if (choice === 10) {
        tui.addMessage('system', 'Tools: tcpdump_capture, file_carve, binwalk_scan, strings_extract, checksum');
      } else if (choice === 11) {
        tui.addMessage('system', 'Tools: nuclei_scan, searchesploit, sherlock_username, searchesploit, gobuster_scan, feroxbuster_scan');
      } else if (choice === 12) {
        tui.addMessage('system', 'Tools: android_backup, apk_permissions, termux_packages, process_list, netstat_termux');
      } else if (choice === 13) {
        tui.addMessage('system', 'Tools: virustotal_file, abuseip_lookup, shodan_search, crtsh_lookup, phone_lookup');
      } else if (choice === 14) {
        tui.addMessage('system', 'Tools: crackstation_lookup, cewl_generate, pattern_generate, keyboard_walk, rules_generate');
      } else if (choice === 15) {
        tui.addMessage('system', 'Tools: auto_recon, report_generate, scan_schedule, security_audit');
      } else if (choice === 16) {
        tui.addMessage('system', 'Tools: proot_status, ubuntu_install, list_containers, ubuntu_exec, x11_status');
      } else if (choice === 17) {
        tui.addMessage('system', 'Tools: quark_scan, mobsf_start, apkleaks_scan, droidlysis_scan, ssdeep_hash');
      } else if (choice === 18) {
        tui.addMessage('system', 'Tools: gobuster_scan, feroxbuster_scan, seclists_install, rustscan_scan, dirsearch_scan');
      } else if (choice === 19) {
        tui.addMessage('system', 'Tools: bluetooth_scan, bluetooth_status, nfc_list, nfc_read, rfid_frequency');
      } else if (choice === 20) {
        tui.addMessage('system', 'Tools: bandwidth_monitor, htop_monitor, nethogs_monitor, sys_monitor, battery_monitor, temp_monitor');
      }
      break;
    }

    case '/re': {
      if (!isTermux()) {
        tui.addMessage('error', 'Reverse engineering tools only available on Termux');
        break;
      }
      if (!parts[1]) {
        tui.addMessage('system', 'Usage: /re <apk_path>\nOr: /re jadx <apk>, /re apktool <apk>, /re androguard <apk>');
        break;
      }
      const subcmd = parts[1];
      const apkPath = parts[2];
      try {
        if (subcmd === 'jadx' && apkPath) {
          const result = await require('./tools/registry').execute('jadx_decompile', { apkPath });
          tui.addMessage('system', result);
        } else if (subcmd === 'apktool' && apkPath) {
          const result = await require('./tools/registry').execute('apk_decompile', { apkPath });
          tui.addMessage('system', result);
        } else if (subcmd === 'androguard' && apkPath) {
          const result = await require('./tools/registry').execute('androguard_analyze', { apkPath });
          tui.addMessage('system', result);
        } else {
          const result = await require('./tools/registry').execute('apk_decompile', { apkPath: subcmd });
          tui.addMessage('system', result);
        }
      } catch (e) {
        tui.addMessage('error', e.message);
      }
      break;
    }

    case '/scan': {
      if (!isTermux()) {
        tui.addMessage('error', 'Scanning tools only available on Termux');
        break;
      }
      if (!parts[1]) {
        tui.addMessage('system', 'Usage: /scan <target>\nTools: nmap_scan, masscan_scan');
        break;
      }
      const target = parts[1];
      try {
        const result = await require('./tools/registry').execute('nmap_scan', { target, args: '-sV -T4' });
        tui.addMessage('system', result);
      } catch (e) {
        tui.addMessage('error', e.message);
      }
      break;
    }

    default:
      tui.addMessage('error', `unknown command: ${parts[0]}`);
  }
}

async function main() {
  if (!config.get('setupDone')) {
    const setup = require('./setup');
    await setup.run();
  }

  workspace.init();
  engine.init(soul);
  heartbeat.start();
  
  if (mcpServer) {
    try {
      await mcpServer.initialize({});
      console.log('[MCP] Server initialized');
    } catch (e) {
      console.log('[MCP] Init failed:', e.message);
    }
  }
  
  heartbeat.onProactiveCheckin((message) => {
    tui.addMessage('system', `💬 ${message}`);
  });

  await tui.init(async (input) => {
    if (input.startsWith('/')) {
      await cmd(input, input.trim().split(/\s+/));
      return;
    }

    tui.setThinking(true);
    try {
      await loop.run(
        input,
        () => {},
        (name, args, result) => {
          if (result !== null && result !== undefined && result !== '') {
            tui.addMessage('tool', `${String(result).slice(0, 100)}`);
          }
        },
        (reply) => {
          tui.setThinking(false);
          if (reply) tui.addMessage('agent', reply);
        }
      );
    } catch (e) {
      tui.setThinking(false);
      tui.addMessage('error', e.message);
    }
  });

  // Start scheduler after TUI is ready
  try {
    const scheduler = require('./core/scheduler');
    scheduler.start({ telegram, loop, tui });
  } catch {}

  // Start proactive mode if enabled
  try {
    const proactive = require('./core/proactive');
    proactive.start();
  } catch {}

  // Start integrations after TUI is ready
  const cfg = config.load();
  if (cfg.telegramToken) {
    telegram.start(msg => tui.addMessage('system', `tg: ${msg}`));
  }
  if (cfg.discordToken) {
    discord.start(msg => tui.addMessage('system', `discord: ${msg}`));
  }
  // whatsapp.start(msg => tui.addMessage('system', `whatsapp: ${msg}`));
}

main();
