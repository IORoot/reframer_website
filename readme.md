# Reframer Website

A modern, responsive website for Reframer - an AI-powered video reframing application for macOS.

## Features

- **Dynamic GitHub Releases Integration**: Automatically fetches and displays the latest releases from the [reframer_gui repository](https://github.com/IORoot/reframer_gui)
- **Real-time Updates**: Version numbers and download links automatically update when new releases are published
- **Automatic Changelog**: Generates a complete changelog page from GitHub release notes
- **Responsive Design**: Built with Tailwind CSS for all device sizes
- **Modern Animations**: Smooth GSAP animations and transitions

## GitHub Releases Integration

The website automatically connects to the GitHub API to fetch releases from the `IORoot/reframer_gui` repository. This provides:

### Automatic Updates
- Version numbers in navigation and headers
- Download links for the latest release
- Complete changelog with all past releases

### How It Works
1. **API Integration**: Uses GitHub's public API to fetch release data
2. **Smart Parsing**: Automatically parses release notes from markdown format
3. **Dynamic Content**: Updates the website content without manual intervention
4. **Error Handling**: Gracefully handles API failures and missing releases

### Release Note Format
The system automatically parses GitHub release notes that follow this format:

```markdown
## ✨ New Features
- Feature 1 description
- Feature 2 description

## 🐛 Bug Fixes
- Fixed issue 1
- Fixed issue 2

## 🔧 Technical Improvements
- Performance improvements
- Code refactoring
```

## File Structure

```
reframer_website/
├── index.html              # Main landing page
├── changelog.html          # Dynamic changelog page
├── test.html              # Test page for GitHub integration
├── src/
│   ├── js/
│   │   └── github-releases.js  # GitHub API integration
│   ├── img/               # Website images
│   └── svg/               # SVG assets
└── README.md              # This file
```

## Setup and Development

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. The GitHub integration will automatically fetch the latest releases

### Testing
Use `test.html` to test the GitHub releases integration:
- Test API calls
- Verify data parsing
- Check page element updates

### Customization
To connect to a different GitHub repository, modify the `GitHubReleases` class in `src/js/github-releases.js`:

```javascript
constructor() {
    this.repoOwner = 'YourUsername';
    this.repoName = 'YourRepoName';
    // ... rest of the code
}
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Responsive design works on all screen sizes

## API Rate Limits

GitHub's public API has rate limits:
- **Unauthenticated**: 60 requests per hour
- **Authenticated**: 5,000 requests per hour

For high-traffic websites, consider:
- Implementing caching
- Using GitHub tokens for authenticated requests
- Adding a CDN layer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
