export type SecurityWorkspaceId =
  | 'sec_qr_generator'
  | 'sec_qr_scanner'
  | 'sec_passwords_auth'
  | 'sec_crypto_privacy';

export interface SecurityToolConfig {
  id: number;
  workspaceId: SecurityWorkspaceId;
  title: string;
  subtitle: string;
  mode: string;
  description: string;
  iconName: string;
}

export const SECURITY_TOOLS_CONFIG: Record<number, SecurityToolConfig> = {
  // --- Workspace 1: sec_qr_generator (12 tools) ---
  351: {
    id: 351,
    workspaceId: 'sec_qr_generator',
    title: 'QR Code Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_text',
    description: 'Generate high-resolution offline QR codes for text, links, and payloads.',
    iconName: 'QrCode',
  },
  353: {
    id: 353,
    workspaceId: 'sec_qr_generator',
    title: 'Wi-Fi QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_wifi',
    description: 'Create connect-on-scan QR codes with SSID, security protocol, and password.',
    iconName: 'Wifi',
  },
  354: {
    id: 354,
    workspaceId: 'sec_qr_generator',
    title: 'Contact QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_contact',
    description: 'Generate scannable contact card QR codes compatible with Android and iOS address books.',
    iconName: 'UserCheck',
  },
  355: {
    id: 355,
    workspaceId: 'sec_qr_generator',
    title: 'URL QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_url',
    description: 'Encode website links and web apps into instant launch QR codes.',
    iconName: 'Globe',
  },
  356: {
    id: 356,
    workspaceId: 'sec_qr_generator',
    title: 'Text QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_text',
    description: 'Encode plain text, memos, and instructions into scannable QR matrices.',
    iconName: 'FileText',
  },
  357: {
    id: 357,
    workspaceId: 'sec_qr_generator',
    title: 'Email QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_email',
    description: 'Encode recipient, subject, and pre-composed email bodies into mailto QR codes.',
    iconName: 'Mail',
  },
  358: {
    id: 358,
    workspaceId: 'sec_qr_generator',
    title: 'Phone QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_phone',
    description: 'Create direct one-tap telephone dialer QR codes.',
    iconName: 'Phone',
  },
  359: {
    id: 359,
    workspaceId: 'sec_qr_generator',
    title: 'SMS QR Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_sms',
    description: 'Encode mobile phone numbers and pre-filled text messages into SMS QR codes.',
    iconName: 'MessageSquare',
  },
  360: {
    id: 360,
    workspaceId: 'sec_qr_generator',
    title: 'vCard Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_vcard',
    description: 'Compile comprehensive digital business cards with full organization, title, and address.',
    iconName: 'Contact',
  },
  361: {
    id: 361,
    workspaceId: 'sec_qr_generator',
    title: 'Barcode Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'barcode_gen',
    description: 'Generate standard 1D linear barcodes (Code 128, EAN-13, Code 39) with custom labels.',
    iconName: 'Barcode',
  },
  363: {
    id: 363,
    workspaceId: 'sec_qr_generator',
    title: 'QR Code Customizer',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_customize',
    description: 'Fine-tune QR code foreground/background colors, quiet zones, and error correction levels.',
    iconName: 'Palette',
  },
  364: {
    id: 364,
    workspaceId: 'sec_qr_generator',
    title: 'QR Code Batch Generator',
    subtitle: 'QR & Barcode Utilities',
    mode: 'qr_batch',
    description: 'Generate multiple QR codes in bulk from line-delimited lists or CSV datasets.',
    iconName: 'Layers',
  },

  // --- Workspace 2: sec_qr_scanner (4 tools) ---
  352: {
    id: 352,
    workspaceId: 'sec_qr_scanner',
    title: 'QR Code Scanner',
    subtitle: 'Scanner & Reader Utilities',
    mode: 'scan_qr',
    description: 'Scan and decode 2D QR codes using device camera or gallery images.',
    iconName: 'ScanLine',
  },
  362: {
    id: 362,
    workspaceId: 'sec_qr_scanner',
    title: 'Barcode Scanner',
    subtitle: 'Scanner & Reader Utilities',
    mode: 'scan_barcode',
    description: 'Read and decode linear 1D product barcodes (UPC, EAN, Code 128).',
    iconName: 'Scan',
  },
  365: {
    id: 365,
    workspaceId: 'sec_qr_scanner',
    title: 'QR Code Reader History',
    subtitle: 'Scanner & Reader Utilities',
    mode: 'scan_history',
    description: 'Browse, search, export, and manage local scan logs and captured codes.',
    iconName: 'History',
  },
  366: {
    id: 366,
    workspaceId: 'sec_qr_scanner',
    title: 'URL Safety Checker',
    subtitle: 'Scanner & Reader Utilities',
    mode: 'url_safety',
    description: 'Inspect decoded or pasted URLs for phishing risks, suspicious TLDs, and tracking parameters.',
    iconName: 'ShieldAlert',
  },

  // --- Workspace 3: sec_passwords_auth (4 tools) ---
  367: {
    id: 367,
    workspaceId: 'sec_passwords_auth',
    title: 'Password Strength Checker',
    subtitle: 'Passwords & Authentication',
    mode: 'pwd_strength',
    description: 'Analyze password entropy, character diversity, and estimated brute-force crack time.',
    iconName: 'ShieldCheck',
  },
  368: {
    id: 368,
    workspaceId: 'sec_passwords_auth',
    title: 'Random Password Generator',
    subtitle: 'Passwords & Authentication',
    mode: 'pwd_generate',
    description: 'Generate cryptographically random passwords with custom lengths and symbol sets.',
    iconName: 'Key',
  },
  369: {
    id: 369,
    workspaceId: 'sec_passwords_auth',
    title: 'Passphrase Generator',
    subtitle: 'Passwords & Authentication',
    mode: 'pwd_passphrase',
    description: 'Generate secure yet easy-to-remember multi-word Diceware passphrases.',
    iconName: 'FileKey',
  },
  374: {
    id: 374,
    workspaceId: 'sec_passwords_auth',
    title: 'TOTP Authenticator',
    subtitle: 'Passwords & Authentication',
    mode: 'totp_auth',
    description: 'Generate 30-second two-factor authentication codes (RFC 6238) offline.',
    iconName: 'Clock',
  },

  // --- Workspace 4: sec_crypto_privacy (5 tools) ---
  370: {
    id: 370,
    workspaceId: 'sec_crypto_privacy',
    title: 'Secure Notes',
    subtitle: 'Cryptography & Privacy',
    mode: 'secure_notes',
    description: 'Store and encrypt confidential notes with passphrase protection locally on device.',
    iconName: 'Lock',
  },
  371: {
    id: 371,
    workspaceId: 'sec_crypto_privacy',
    title: 'Secret Redactor',
    subtitle: 'Cryptography & Privacy',
    mode: 'secret_redact',
    description: 'Automatically detect and redact API keys, emails, phone numbers, and secrets from text.',
    iconName: 'EyeOff',
  },
  372: {
    id: 372,
    workspaceId: 'sec_crypto_privacy',
    title: 'File Hash Verifier',
    subtitle: 'Cryptography & Privacy',
    mode: 'file_hash',
    description: 'Compute and verify SHA-256, SHA-1, and MD5 file checksums against expected hashes.',
    iconName: 'CheckCheck',
  },
  373: {
    id: 373,
    workspaceId: 'sec_crypto_privacy',
    title: 'Text Hash Generator',
    subtitle: 'Cryptography & Privacy',
    mode: 'text_hash',
    description: 'Generate cryptographic hash digests (SHA-256, SHA-1, MD5) for raw text strings.',
    iconName: 'Hash',
  },
  375: {
    id: 375,
    workspaceId: 'sec_crypto_privacy',
    title: 'Privacy Metadata Cleaner',
    subtitle: 'Cryptography & Privacy',
    mode: 'metadata_clean',
    description: 'Sanitize hidden trackers, timestamps, and sensitive identifiers from clipboard payloads.',
    iconName: 'Trash2',
  },
};

export function getSecurityToolConfig(toolId: number): SecurityToolConfig | undefined {
  return SECURITY_TOOLS_CONFIG[toolId];
}
