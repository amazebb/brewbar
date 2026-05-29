import { initTable } from './amazebb-tv/index.js';

// TSV first row is assumed to be column headers
function parseTsv(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
        const parts = line.split('\t');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (parts[i] || '').trim(); });
        return obj;
    });
}

function renderNameCell(item) {
    const code = document.createElement('code');
    const a = document.createElement('a');
    a.textContent = item.name;
    a.href = item.url;
    code.appendChild(a);
    return code;
}

const tbl = document.getElementById('pkgTable');
const statTotal = document.getElementById('statTotal');
const statFormula = document.getElementById('statFormula');
const statCask = document.getElementById('statCask');
const statShowing = document.getElementById('statShowing');

fetch('packages.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .catch(() => fetch('packages.tsv').then(r => r.text()).then(parseTsv))
    .then(data => {
        // Read column config from data-col-{key} attributes on the table element.
        // Format: "Label" or "Label,true|false"
        // Element 0: display label — overrides auto-capitalized key
        // Element 1: filter toggle — omit to let table.js decide based on numeric detection
        const colConfig = key => {
            const attr = tbl.dataset[`col${key[0].toUpperCase()}${key.slice(1)}`];
            if (!attr) return {};
            const [labelPart, filterPart] = attr.split(',').map(s => s.trim());
            const result = {};
            if (labelPart) result.label = labelPart;
            if (filterPart !== undefined) result.filter = filterPart.toLowerCase() !== 'false';
            return result;
        };

        const totalBrew = data.filter(d => d.type === 'brew').length;
        const totalCask = data.length - totalBrew;
        statTotal.textContent = `${data.length} packages`;
        statFormula.textContent = `${totalBrew} formulas`;
        statCask.textContent = `${totalCask} casks`;

        initTable(data, {
            tableId: 'pkgTable',
            searchInputId: 'nameSearch',
            noResultsId: 'noResults',
            searchKeys: ['name', 'desc'],
            badgeAlwaysShow: true,
            columns: [
                { key: 'name', ...colConfig('name'), render: renderNameCell },
                { key: 'type', ...colConfig('type') },
                { key: 'desc', ...colConfig('desc') },
                { key: 'cat', ...colConfig('cat') }
            ],
            onFilter: visible => {
                statShowing.textContent = `showing ${visible}`;
            }
        });

        // CSV export of current filtered view
        document.getElementById('exportBtn').addEventListener('click', () => {
            const lines = ['Name,Type,Description,Category'];
            data.forEach(item => {
                if (item.tr.classList.contains('hidden')) return;
                const cells = [item.name, item.type, item.desc, item.cat]
                    .map(v => `"${v.replace(/"/g, '""')}"`);
                lines.push(cells.join(','));
            });
            const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'packages.csv';
            a.click();
            URL.revokeObjectURL(a.href);
        });

        // Copy brew install command for current filtered view
        document.getElementById('brewBtn').addEventListener('click', () => {
            const formulas = [], casks = [];
            data.forEach(item => {
                if (item.tr.classList.contains('hidden')) return;
                if (item.type === 'cask') casks.push(item.name); else formulas.push(item.name);
            });
            const parts = [];
            if (formulas.length) parts.push(`brew install ${formulas.join(' ')}`);
            if (casks.length) parts.push(`brew install --cask ${casks.join(' ')}`);
            const btn = document.getElementById('brewBtn');
            navigator.clipboard.writeText(parts.join('\n')).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
            });
        });
    });
