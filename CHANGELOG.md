# Changelog

All notable changes to Block Manager for Twitter/X will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-10

### 🎉 Initial Release

#### ✨ Added
- **Alt+B Keyboard Shortcut** - Quick block users from profile pages
- **Automatic Blocking** - Auto-navigate through Twitter's block UI
- **Block Manager Interface** - Comprehensive management popup
- **Statistics Dashboard** - Real-time blocking statistics
  - Total blocked users
  - Today's blocks
  - This week's blocks
  - Average per day
- **Search & Filter** - Advanced user search and filtering
  - Search by username, display name, reason, or tags
  - Filter by time period (All, Today, This Week, This Month)
  - Filter by tags
- **Tag System** - Organize blocked users with custom tags
- **Block Reasons** - Add notes explaining why users were blocked
- **Import/Export** - Bulk operations for user management
  - Import users from text file
  - Export list as JSON
  - Backup system with downloadable files
- **History Timeline** - View blocking activity grouped by date
- **Dark/Light Theme** - Beautiful theme switching
- **Bilingual Support** - Serbian and English with auto-detection
- **Edit Functionality** - Modify block reasons and tags
- **Bulk Operations** - Select and delete multiple users
- **Clear All** - Delete all blocked users (with double confirmation)
- **Toast Notifications** - Visual feedback for all actions

#### 🏗️ Architecture
- **Manifest V3** - Latest Chrome Extension API
- **ES6 Modules** - Modern modular architecture
  - 12 specialized modules with single responsibilities
  - 83% reduction in main file size (1268 → 212 lines)
  - Dependency injection pattern
  - Centralized state management
- **Vanilla JavaScript** - No external dependencies
- **Chrome Storage API** - Local data storage (up to 10MB)
- **i18n Support** - Built-in internationalization

#### 📦 Modules Structure
- `translations.js` - i18n translations (186 lines)
- `state.js` - State management (46 lines)
- `theme.js` - Theme handling (49 lines)
- `stats.js` - Statistics calculations (68 lines)
- `modals.js` - Modal management (30 lines)
- `import-export.js` - Import/Export/Backup (118 lines)
- `list-renderer.js` - UI rendering (111 lines)
- `language.js` - Language switching (114 lines)
- `search.js` - Search and filtering (80 lines)
- `tags.js` - Tag management (84 lines)
- `crud.js` - CRUD operations (173 lines)
- `history.js` - Timeline rendering (112 lines)

#### 🔒 Security & Privacy
- All data stored locally
- No external servers
- No tracking or analytics
- No ads
- Open source

#### 🎨 UI/UX
- Clean, modern interface
- Responsive design
- Smooth animations and transitions
- Intuitive navigation
- Accessible keyboard shortcuts

#### 📝 Documentation
- Comprehensive README in English and Serbian
- Code refactoring documentation
- Installation instructions
- Usage guide
- Contributing guidelines

---

## [Unreleased]

### 🔮 Planned Features

#### v1.1.0
- Enhanced statistics with charts and graphs
- Export formats: CSV, Excel
- Scheduled automatic backups
- Keyboard shortcuts customization
- Block/unblock from timeline view
- Better error handling
- Performance optimizations

#### v1.2.0
- Cloud sync (optional, privacy-focused)
- Advanced filtering rules
- Batch operations scheduler
- Browser notification options
- Custom themes
- Import from other blocking tools

#### v2.0.0
- Firefox support
- Edge support
- Multi-account management
- API integration
- Advanced automation rules
- Statistics export
- Data visualization improvements

---

## Version History

### Legend
- 🎉 **Major Release**
- ✨ **Added** - New features
- 🔧 **Changed** - Changes to existing functionality
- 🐛 **Fixed** - Bug fixes
- 🗑️ **Deprecated** - Soon-to-be removed features
- ❌ **Removed** - Removed features
- 🔒 **Security** - Security improvements
- ⚡ **Performance** - Performance improvements
- 📝 **Documentation** - Documentation changes

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for ways to get started.

## Support

If you encounter any issues, please:
1. Check [existing issues](https://github.com/zoxknez/Twitter-X-Block-Manager/issues)
2. Create a new issue with detailed information
3. Contact via [portfolio website](https://mojportfolio.vercel.app)

---

**Made with ❤️ for a better Twitter/X experience**
