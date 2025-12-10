# Privacy Policy for Block Manager for Twitter/X

**Last Updated: December 10, 2025**

## Overview

Block Manager for Twitter/X ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how the Extension handles your data.

## Data Collection

### What Data is Collected

The Extension stores the following data **locally on your device only**:

1. **Blocked Users List**
   - Twitter/X usernames
   - Display names
   - Profile URLs
   - Block timestamps

2. **User-Added Information**
   - Block reasons (notes you add)
   - Custom tags
   - User preferences (theme, language)

3. **Extension Preferences**
   - Selected theme (dark/light)
   - Selected language (Serbian/English)
   - UI state

### What Data is NOT Collected

- ❌ No personal identification information
- ❌ No browsing history
- ❌ No passwords or credentials
- ❌ No Twitter/X authentication tokens
- ❌ No analytics or tracking data
- ❌ No usage statistics
- ❌ No advertising identifiers

## Data Storage

### Local Storage Only

All data is stored **exclusively on your device** using Chrome's built-in Storage API:

- **Location**: Local Chrome storage on your device
- **Size Limit**: Up to 10MB per extension
- **Access**: Only accessible by the Extension on your device
- **Encryption**: Protected by Chrome's security mechanisms

### No External Servers

- ✅ **No data is sent to external servers**
- ✅ **No cloud synchronization** (unless explicitly added in future with user consent)
- ✅ **No third-party services**
- ✅ **No remote storage**

## Data Usage

### How Your Data is Used

Your data is used **only** for the following purposes:

1. **Display blocked users** in the Extension's interface
2. **Search and filter** through your blocked list
3. **Statistics calculation** (total, daily, weekly counts)
4. **Export functionality** (downloading your own data)
5. **Restore preferences** (theme, language) on Extension reload

### No Sharing or Selling

- ✅ Your data is **NEVER shared** with third parties
- ✅ Your data is **NEVER sold** to anyone
- ✅ Your data **NEVER leaves your device** (except when you export it manually)

## Permissions

### Why We Need Permissions

The Extension requests the following permissions for specific purposes:

#### `storage`
- **Purpose**: Store blocked users list and preferences locally
- **Data**: Blocked users, tags, reasons, theme, language
- **Location**: Local device only

#### `activeTab`
- **Purpose**: Access current Twitter/X tab to enable Alt+B blocking
- **Data**: Only when you press Alt+B on a Twitter/X profile
- **Location**: Current tab only, no background access

#### `scripting`
- **Purpose**: Inject content script to detect block buttons on Twitter/X
- **Data**: Read Twitter/X DOM to find profile information
- **Location**: Twitter/X pages only

#### `notifications`
- **Purpose**: Show toast notifications when blocking users
- **Data**: Username of blocked user (temporary, not stored)
- **Location**: Chrome notifications API

#### Host Permissions: `*://twitter.com/*` and `*://x.com/*`
- **Purpose**: Extension only works on Twitter/X websites
- **Data**: Read profile information when you press Alt+B
- **Location**: Twitter.com and X.com domains only

## User Rights

### Your Control Over Data

You have **complete control** over your data:

#### Access
- View all your data anytime in the Extension popup

#### Export
- Download your data as JSON file using Export button
- Data format: Human-readable JSON

#### Modify
- Edit block reasons and tags anytime
- Change preferences (theme, language)

#### Delete
- Delete individual users from list
- Bulk delete multiple users
- Clear all data with "Clear All" button
- Uninstall Extension to remove all data permanently

## Data Retention

### How Long We Keep Data

- Data is kept **indefinitely until you delete it**
- No automatic data deletion
- No expiration dates
- Data persists across Chrome sessions

### Removing All Data

To completely remove all Extension data:

1. **Option 1**: Click "Clear All" in Extension (with confirmation)
2. **Option 2**: Uninstall the Extension from Chrome
3. **Option 3**: Clear Chrome Extension data:
   - Go to `chrome://settings/cookies`
   - Search for the Extension
   - Click "Remove All"

## Security

### How We Protect Your Data

1. **Local Storage Only**
   - Data never transmitted over network
   - No server vulnerabilities

2. **Chrome's Security**
   - Protected by Chrome's sandboxed environment
   - Encrypted at rest by Chrome

3. **No Authentication**
   - No passwords to compromise
   - No login credentials stored

4. **Open Source**
   - All code is transparent and auditable
   - Community can review for security issues

5. **Minimal Permissions**
   - Only requests necessary permissions
   - No excessive access

## Third-Party Services

### None Used

- ✅ No analytics services (Google Analytics, Mixpanel, etc.)
- ✅ No advertising networks
- ✅ No crash reporting services
- ✅ No third-party APIs (except Twitter/X itself for blocking)
- ✅ No external dependencies

### External Links

The Extension contains links to:
- Author's portfolio website
- PayPal donation link
- GitHub repository

These are external websites with their own privacy policies.

## Children's Privacy

The Extension does not knowingly collect data from children under 13. Twitter/X requires users to be 13 or older, and this Extension is designed for Twitter/X users.

## Changes to Privacy Policy

### Notification of Changes

If we make changes to this Privacy Policy:

1. **Updated Date** will be changed at the top
2. **Notification** in Extension update notes
3. **GitHub** changelog will document changes
4. **Major changes** will require explicit user consent

### Version History

- v1.0.0 (December 10, 2025) - Initial privacy policy

## International Users

### Data Location

- All data is stored on **your local device**
- No international data transfers
- No servers in any jurisdiction

### GDPR Compliance (EU Users)

If you're in the European Union:

- ✅ **Right to Access**: View all your data in the Extension
- ✅ **Right to Rectification**: Edit your data anytime
- ✅ **Right to Erasure**: Delete all data with "Clear All"
- ✅ **Right to Data Portability**: Export data as JSON
- ✅ **Right to Object**: Uninstall the Extension
- ✅ **No Automated Decision Making**: No AI or algorithms processing your data
- ✅ **Data Protection by Design**: Privacy-first architecture

### CCPA Compliance (California Users)

If you're in California:

- ✅ **No Sale of Personal Information**: We don't sell any data
- ✅ **Right to Know**: All data visible in Extension
- ✅ **Right to Delete**: "Clear All" button
- ✅ **Right to Opt-Out**: Not applicable (we don't sell data)
- ✅ **No Discrimination**: No different treatment based on privacy choices

## Contact Information

### Questions or Concerns

If you have questions about this Privacy Policy or the Extension's privacy practices:

- **GitHub Issues**: [github.com/zoxknez/Twitter-X-Block-Manager/issues](https://github.com/zoxknez/Twitter-X-Block-Manager/issues)
- **Portfolio**: [mojportfolio.vercel.app](https://mojportfolio.vercel.app)
- **Email**: Contact via portfolio website

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Contact privately via portfolio website
3. Include detailed description
4. Allow time for fix before public disclosure

## Consent

By using Block Manager for Twitter/X, you consent to this Privacy Policy.

If you do not agree with this policy, please do not install or use the Extension.

## Open Source

The Extension is open source. You can:

- **Review the code**: [github.com/zoxknez/Twitter-X-Block-Manager](https://github.com/zoxknez/Twitter-X-Block-Manager)
- **Verify privacy claims**: All code is transparent
- **Contribute**: Help improve privacy and security
- **Fork**: Create your own version

## Disclaimer

This Extension is not affiliated with, endorsed by, or officially connected with Twitter, X Corp, or Elon Musk. All trademarks belong to their respective owners.

---

**Summary:**

🔒 **Your data stays on your device**  
🚫 **No tracking, no analytics, no ads**  
✅ **Complete control over your data**  
🌐 **No external servers**  
📖 **100% transparent and open source**

---

**Made with ❤️ and respect for your privacy**
