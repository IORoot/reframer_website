// GitHub Releases API integration for Reframer website
class GitHubReleases {
    constructor() {
        this.repoOwner = 'IORoot';
        this.repoName = 'reframer_gui';
        this.apiBase = 'https://api.github.com';
        this.releases = [];
        this.latestRelease = null;
        this.isLoading = false;
        this.hasError = false;
    }

    async fetchReleases() {
        this.isLoading = true;
        this.hasError = false;
        
        try {
            const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/releases`);
            if (!response.ok) {
                // If GitHub API fails (e.g., private repository), use fallback data
                console.warn('GitHub API failed, using fallback data');
                this.releases = this.getFallbackReleases();
                this.latestRelease = this.releases[0] || null;
                return this.releases;
            }
            
            this.releases = await response.json();
            this.latestRelease = this.releases[0] || null;
            
            return this.releases;
        } catch (error) {
            console.error('Error fetching GitHub releases:', error);
            // Use fallback data on any error
            this.releases = this.getFallbackReleases();
            this.latestRelease = this.releases[0] || null;
            return this.releases;
        } finally {
            this.isLoading = false;
        }
    }

    async fetchLatestRelease() {
        try {
            const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/releases/latest`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            this.latestRelease = await response.json();
            return this.latestRelease;
        } catch (error) {
            console.error('Error fetching latest release:', error);
            return null;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }

    parseReleaseNotes(body) {
        if (!body) return [];
        
        const lines = body.split('\n');
        const sections = [];
        let currentSection = null;
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Check for section headers (## or ###)
            if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
                const title = trimmedLine.replace(/^#+\s*/, '');
                currentSection = {
                    title: title,
                    items: []
                };
                sections.push(currentSection);
            } else if (trimmedLine.startsWith('- ') && currentSection) {
                // Check for list items
                const item = trimmedLine.replace(/^-\s*/, '');
                currentSection.items.push(item);
            } else if (trimmedLine.startsWith('* ') && currentSection) {
                // Alternative list item format
                const item = trimmedLine.replace(/^\*\s*/, '');
                currentSection.items.push(item);
            }
        });
        
        return sections;
    }

    getDownloadUrl(release) {
        if (!release || !release.assets || release.assets.length === 0) {
            return null;
        }
        
        // Look for DMG files first
        const dmgAsset = release.assets.find(asset => 
            asset.name.toLowerCase().includes('.dmg')
        );
        
        if (dmgAsset) {
            return dmgAsset.browser_download_url;
        }
        
        // Fallback to any asset
        return release.assets[0].browser_download_url;
    }

    getAssetName(release) {
        if (!release || !release.assets || release.assets.length === 0) {
            return 'Download';
        }
        
        const asset = release.assets[0];
        return asset.name;
    }

    // Update the main page with latest release info
    updateMainPage() {
        if (!this.latestRelease) {
            this.showNoReleasesState();
            return;
        }

        // Update version number in navigation
        const versionSpans = document.querySelectorAll('.text-xs.text-gray-400');
        versionSpans.forEach(span => {
            // Check if tag_name already has 'v' prefix to avoid duplicates
            const version = this.latestRelease.tag_name.startsWith('v') 
                ? this.latestRelease.tag_name 
                : `v${this.latestRelease.tag_name}`;
            span.textContent = version;
        });

        // Update download buttons with latest release
        const downloadButtons = document.querySelectorAll('a[href="#"]');
        const downloadUrl = this.getDownloadUrl(this.latestRelease);
        
        if (downloadUrl) {
            downloadButtons.forEach(button => {
                if (button.textContent.includes('Loading...') || button.textContent.includes('Download')) {
                    const version = this.latestRelease.tag_name.startsWith('v') 
                        ? this.latestRelease.tag_name 
                        : `v${this.latestRelease.tag_name}`;
                    button.href = downloadUrl;
                    button.textContent = `Download ${version}`;
                }
            });
        } else {
            // If no download URL, show error state
            downloadButtons.forEach(button => {
                if (button.textContent.includes('Loading...') || button.textContent.includes('Download')) {
                    button.href = '#';
                    button.textContent = 'No Download Available';
                    button.classList.add('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    }

    showNoReleasesState() {
        // Update version number to show no releases
        const versionSpans = document.querySelectorAll('.text-xs.text-gray-400');
        versionSpans.forEach(span => {
            // Always replace the entire text content to avoid duplicates
            span.textContent = 'Coming Soon';
        });

        // Update download buttons to show no releases
        const downloadButtons = document.querySelectorAll('a[href="#"]');
        downloadButtons.forEach(button => {
            if (button.textContent.includes('Loading...') || button.textContent.includes('Download')) {
                button.href = '#';
                button.textContent = 'Coming Soon';
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    showErrorState() {
        // Update version number to show error
        const versionSpans = document.querySelectorAll('.text-xs.text-gray-400');
        versionSpans.forEach(span => {
            // Always replace the entire text content to avoid duplicates
            span.textContent = 'v?.?.?';
        });

        // Update download buttons to show error
        const downloadButtons = document.querySelectorAll('a[href="#"]');
        downloadButtons.forEach(button => {
            if (button.textContent.includes('Loading...') || button.textContent.includes('Download')) {
                button.href = '#';
                button.textContent = 'Error Loading';
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    // Generate changelog HTML for all releases
    generateChangelogHTML() {
        if (this.hasError) {
            return `
                <div class="text-center py-8">
                    <div class="inline-flex items-center px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Error loading releases. Please try again later.
                    </div>
                </div>
            `;
        }

        if (this.releases.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="inline-flex items-center px-4 py-2 bg-deepmind-gray rounded-lg text-gray-400">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                        </svg>
                        No releases yet. Check back soon for the first release!
                    </div>
                </div>
            `;
        }

        return this.releases.map(release => {
            const sections = this.parseReleaseNotes(release.body);
            const downloadUrl = this.getDownloadUrl(release);
            
            let sectionsHTML = '';
            if (sections.length > 0) {
                sectionsHTML = sections.map(section => {
                    let itemsHTML = '';
                    if (section.items.length > 0) {
                        itemsHTML = section.items.map(item => `
                            <li class="flex items-center">
                                <svg class="w-5 h-5 mr-3 text-deepmind-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                ${item}
                            </li>
                        `).join('');
                    }
                    
                    return `
                        <div>
                            <h4 class="text-lg font-medium mb-2">${section.title}</h4>
                            ${section.items.length > 0 ? `<ul class="space-y-2 text-gray-400">${itemsHTML}</ul>` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                // Fallback if no structured notes
                sectionsHTML = `
                    <div>
                        <p class="text-gray-400 mb-4">${release.body || 'Release notes not available.'}</p>
                    </div>
                `;
            }

            const downloadButton = downloadUrl ? `
                <div class="mt-6">
                    <a href="${downloadUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-deepmind-blue text-deepmind-dark rounded-lg hover:bg-blue-400 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Download ${this.getAssetName(release)}
                    </a>
                </div>
            ` : '';

            return `
                <div class="changelog-card rounded-xl p-8 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold version-tag">${release.tag_name}</h2>
                        <span class="text-gray-400">${this.formatDate(release.published_at)}</span>
                    </div>
                    
                    <div class="space-y-6">
                        ${sectionsHTML}
                        ${downloadButton}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update the changelog page
    updateChangelogPage() {
        const changelogContainer = document.querySelector('.changelog-container');
        if (changelogContainer) {
            changelogContainer.innerHTML = this.generateChangelogHTML();
            
            // Hide the loading message after content is populated
            const loadingMessage = document.querySelector('.text-center.py-8');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // Initialize and fetch data
    async init() {
        await this.fetchReleases();
        this.updateMainPage();
        
        // If we're on the changelog page, update it too
        if (window.location.pathname.includes('changelog')) {
            this.updateChangelogPage();
        }
    }
}

// Export for use in other files
window.GitHubReleases = GitHubReleases;
