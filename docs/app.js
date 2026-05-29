import { initTable } from './table.js';

function parseTsv(text) {
    const data = [];
    text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const parts = line.split('\t');
        if (parts.length < 2) return;
        data.push({
            type: parts[0],
            name: parts[1],
            desc: (parts[2] || '').trim(),
            url:  parts[3],
            cat:  (parts[4] || '').trim()
        });
    });
    return data;
}

function renderNameCell(item) {
    const code = document.createElement('code');
    const a    = document.createElement('a');
    a.textContent = item.name;
    a.href        = item.url;
    code.appendChild(a);
    return code;
}

const statTotal   = document.getElementById('statTotal');
const statFormula = document.getElementById('statFormula');
const statCask    = document.getElementById('statCask');
const statShowing = document.getElementById('statShowing');

fetch('packages.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .catch(() => fetch('packages.tsv').then(r => r.text()).then(parseTsv))
    .then(data => {
        const totalBrew = data.filter(d => d.type === 'brew').length;
        const totalCask = data.length - totalBrew;
        statTotal.textContent   = `${data.length} packages`;
        statFormula.textContent = `${totalBrew} formulas`;
        statCask.textContent    = `${totalCask} casks`;

        initTable(data, {
            tableId:       'pkgTable',
            searchInputId: 'nameSearch',
            noResultsId:   'noResults',
            searchKeys:    ['name', 'desc'],
            badgeAlwaysShow: true,
            columns: [
                { key: 'name', col: 0, sortable: true, render: renderNameCell },
                { key: 'type', col: 1 },
                { key: 'desc', col: 2, sortable: true },
                { key: 'cat',  col: 3 }
            ],
            filters: [
                { id: 'typeFilter', key: 'type', col: 1, btnId: 'typeBtnEl' },
                { id: 'catFilter',  key: 'cat',  col: 3, btnId: 'catBtnEl' }
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
