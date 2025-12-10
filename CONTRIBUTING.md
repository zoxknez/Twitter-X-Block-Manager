# Contributing to Block Manager for Twitter/X

First off, thank you for considering contributing to Block Manager! It's people like you that make this tool better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. Please be kind and considerate in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/zoxknez/Twitter-X-Block-Manager.git
   cd twitter-block-manager
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Load the extension** in Chrome for testing (see README.md)

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Numbered list of steps
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Screenshots** - If applicable
- **Environment**:
  - Chrome version
  - Extension version
  - Operating system

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use case** - Why is this enhancement needed?
- **Proposed solution** - How would it work?
- **Alternatives** - Other solutions you've considered
- **Mockups** - Visual representations if applicable

### 📝 Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` - these are perfect for newcomers!

#### Areas Needing Help

- 🌐 **Translations** - Help translate to more languages
- 🎨 **UI/UX improvements** - Better design and user experience
- 🐛 **Bug fixes** - Fix reported issues
- ⚡ **Performance** - Optimize code for better performance
- 📖 **Documentation** - Improve README, add comments, write guides
- 🧪 **Testing** - Add automated tests

## Style Guidelines

### JavaScript Style Guide

This project follows modern ES6+ standards:

- **Use ES6 modules** - `import/export` syntax
- **Use arrow functions** - For concise code
- **Use const/let** - Never use `var`
- **Use template literals** - For string interpolation
- **Use async/await** - For asynchronous code
- **Use meaningful names** - Variables and functions should be self-documenting

**Example:**
```javascript
// Good
const getUserData = async (username) => {
  const result = await chrome.storage.local.get(['blockedUsers']);
  return result.blockedUsers.find(user => user.username === username);
};

// Bad
var x = function(u) {
  chrome.storage.local.get(['blockedUsers'], function(r) {
    return r.blockedUsers.find(function(user) {
      return user.username === u;
    });
  });
};
```

### Code Organization

- **Modular structure** - One module per file
- **Single responsibility** - Each module/function does one thing
- **Dependency injection** - Pass dependencies through constructors
- **Null checks** - Always check if DOM elements exist before manipulating
- **Error handling** - Use try/catch blocks appropriately

### CSS Style Guide

- **Use CSS variables** - For consistent theming
- **Mobile-first** - Write mobile styles first, then desktop
- **BEM naming** - Use Block-Element-Modifier convention
- **Avoid !important** - Use specificity correctly
- **Comment sections** - Add comments for major sections

### Documentation

- **JSDoc comments** - For all public methods
- **Inline comments** - Explain "why", not "what"
- **README updates** - Update if you add features
- **Changelog** - Add entry for significant changes

**Example JSDoc:**
```javascript
/**
 * Blocks a user and adds them to the blocked list
 * @param {string} username - The Twitter/X username to block
 * @param {string} reason - Optional reason for blocking
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function blockUser(username, reason = '') {
  // Implementation
}
```

## Commit Messages

Write clear, descriptive commit messages:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding tests
- **chore**: Build process or auxiliary tool changes

### Examples

```bash
# Good
feat(import): add CSV import support
fix(stats): correct average calculation for weekly stats
docs(readme): add installation screenshots

# Bad
update
fixed stuff
changes
```

### Writing Good Commit Messages

- **First line**: Summary in present tense (50 chars or less)
- **Body**: Explain what and why, not how (72 chars per line)
- **Footer**: Reference issues (`Closes #123`)

**Example:**
```
feat(export): add Excel export format

Users requested the ability to export blocked lists to Excel format 
for easier sharing with team members. This adds XLSX export alongside 
the existing JSON format.

Closes #45
```

## Pull Request Process

### Before Submitting

1. **Test thoroughly** - Verify your changes work
2. **Update documentation** - README, comments, etc.
3. **Follow style guidelines** - Consistent with existing code
4. **Commit messages** - Follow the commit message guidelines
5. **No console.logs** - Remove debug statements
6. **Check for errors** - No errors in browser console

### Submitting

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub with:
   - **Clear title** - Descriptive summary
   - **Description**:
     - What does this PR do?
     - Why is this change needed?
     - How was it tested?
     - Screenshots (if UI changes)
   - **Link issues** - Use "Closes #issue-number"

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How has this been tested?
   
   ## Screenshots
   If applicable, add screenshots
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   - [ ] Tested in Chrome
   ```

### Review Process

1. **Automated checks** - Must pass (if any)
2. **Code review** - At least one approval required
3. **Testing** - Reviewer will test changes
4. **Feedback** - Address requested changes
5. **Merge** - Once approved, will be merged

### After Merge

- Your changes will be included in the next release
- You'll be added to contributors list
- Thank you for your contribution! 🎉

## Development Setup

### Prerequisites
- Chrome browser
- Text editor (VS Code recommended)
- Git

### Recommended VS Code Extensions
- ESLint
- Prettier
- Chrome Extension Developer Tools

### Running Tests

Currently, testing is manual. See the testing checklist in README.md.

Future: We plan to add automated tests using Jest/Puppeteer.

## Questions?

Feel free to:
- Open an issue with the `question` label
- Contact the maintainer via portfolio website
- Check existing discussions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special thanks in major releases

Thank you for contributing to Block Manager! 🚀
