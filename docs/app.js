// Use the local build when developing on localhost, an exact-pinned CDN bundle
// in production (GitHub Pages). Pinning the version (not @latest) gives each
// release a unique, immutable URL, sidestepping jsDelivr's 7-day browser cache
// on the floating @latest URL. Bump this on every release.
const src = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '../dist/amazejs.js'
    : 'https://cdn.jsdelivr.net/gh/amazebb/amazejs@v0.8.1/dist/amazejs.js';
const { initTable } = await import(src);

function copyBrewInstall(visibleItems, btn) {
    const formulas = [], casks = [];
    visibleItems.forEach(item => {
        if (item.type === 'cask') casks.push(item.name);
        else formulas.push(item.name);
    });
    const parts = [];
    if (formulas.length) parts.push(`brew install ${formulas.join(' ')}`);
    if (casks.length) parts.push(`brew install --cask ${casks.join(' ')}`);
    navigator.clipboard.writeText(parts.join('\n')).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
    }).catch(() => {
        btn.textContent = 'Failed!';
        setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
    });
}

initTable({
    data: ['data/packages.json', 'data/packages.tsv'],
    tableId: 'pkgTable',
    title: 'Homebrew Packages',
    badgeAlwaysShow: true,
    exportFilename: 'packages.csv',
    striped: true,
    columns: [
        { key: 'name', label: 'Name', render: linkCell('name', 'url', { wrap: 'code' }) },
        { key: 'type', label: 'Type', filter: 'category' },
        { key: 'desc', label: 'Description' },
        { key: 'cat', label: 'Category', filter: 'category' }
    ],
    buttons: [
        { label: 'Copy brew install', onClick: copyBrewInstall }
    ]
});
