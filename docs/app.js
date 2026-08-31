// Use the local build when developing on localhost, an exact-pinned CDN bundle in
// production (GitHub Pages). The pin is what makes a release land: @latest is one
// URL that jsDelivr lets browsers cache for 7 days, which no purge can clear, so a
// tagged version gives each release its own immutable URL. Bump it on every release.
const src = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '../../amazejs/dist/amazejs.js'
    : 'https://cdn.jsdelivr.net/gh/amazebb/amazejs@v0.18.0/dist/amazejs.js';
const { initTable, linkCell } = await import(src);

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
    data: ['data/packages.tsv'],
    tableId: 'pkgTable',
    title: 'Homebrew Packages',
    badgeAlwaysShow: true,
    exportFilename: 'packages.csv',
    striped: true,
    columns: [
        { key: 'name', label: 'Name', render: linkCell('name', 'url', { wrap: 'code' }) },
        { key: 'type', label: 'Type' },
        { key: 'desc', label: 'Description' },
        { key: 'cat', label: 'Category', filter: 'category' }
    ],
    // packages.tsv has no timestamps; these are for the richer files opened through
    // File > Open (brew-info-installed.json), where the install time is epoch seconds under a
    // different key per group: installed_time on casks, installed[].time on formulae.
    formats: {
        installed_time: 'datetime',
        'installed[*].time': 'datetime',
    },
    buttons: [
        { label: 'Copy brew install', onClick: copyBrewInstall }
    ]
});
