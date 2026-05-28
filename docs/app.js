(function() {
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
                url: parts[3],
                cat: (parts[4] || '').trim()
            });
        });
        return data;
    }

    function buildRows(data) {
        const tbody = document.querySelector('#pkgTable tbody');
        data.forEach(item => {
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            const codeElement = document.createElement('code');
            const codeLink = document.createElement('a');
            codeLink.textContent = item.name;
            codeLink.href = item.url;
            codeElement.appendChild(codeLink);
            tdName.appendChild(codeElement);

            const tdType = document.createElement('td');
            tdType.textContent = item.type;

            const tdDesc = document.createElement('td');
            tdDesc.textContent = item.desc;

            const tdCat = document.createElement('td');
            tdCat.textContent = item.cat;

            tr.appendChild(tdName);
            tr.appendChild(tdType);
            tr.appendChild(tdDesc);
            tr.appendChild(tdCat);
            tbody.appendChild(tr);

            item.tr = tr;
        });
    }

    fetch('packages.json')
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .catch(() => fetch('packages.tsv').then(r => r.text()).then(parseTsv))
        .then(data => { buildRows(data); initTable(data); });

    function initTable(data) {
        const table = document.getElementById('pkgTable');
        const tbody = table.querySelector('tbody');
        const searchInput = document.getElementById('nameSearch');
        const noResults = document.getElementById('noResults');

        // Maps col index (used by sortable th data-col attr) to data key
        const colKeys = ['name', 'type', 'desc', 'cat'];

        // Filter state
        const filters = {
            typeFilter: { key: 'type', col: 1, selected: new Set(), all: [], badge: document.getElementById('typeBadge'), btn: document.getElementById('typeBtnEl') },
            catFilter: { key: 'cat', col: 3, selected: new Set(), all: [], badge: document.getElementById('catBadge'), btn: document.getElementById('catBtnEl') }
        };

        // Stats
        const statTotal = document.getElementById('statTotal');
        const statFormula = document.getElementById('statFormula');
        const statCask = document.getElementById('statCask');
        const statShowing = document.getElementById('statShowing');
        const totalBrew = data.filter(d => d.type === 'brew').length;
        const totalCask = data.length - totalBrew;
        statTotal.textContent = `${data.length} packages`;
        statFormula.textContent = `${totalBrew} formulas`;
        statCask.textContent = `${totalCask} casks`;

        // Initialize filters: build option elements once, never destroy them
        Object.keys(filters).forEach(id => {
            const f = filters[id];
            f.all = [...new Set(data.map(d => d[f.key]))].sort();
            f.selected = new Set(f.all);
            f.checkboxes = {};
            f.rows = {};

            const container = document.querySelector(`#${id} .filter-options`);
            f.all.forEach(v => {
                const row = document.createElement('div');
                row.className = 'filter-row';
                row.setAttribute('data-value', v.toLowerCase());

                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = true;
                cb.addEventListener('change', function() {
                    if (this.checked) f.selected.add(v); else f.selected.delete(v);
                    applyFilters();
                });
                label.appendChild(cb);
                label.appendChild(document.createTextNode(v));

                const onlyBtn = document.createElement('button');
                onlyBtn.className = 'only-btn';
                onlyBtn.textContent = 'Only';
                onlyBtn.addEventListener('click', e => {
                    e.preventDefault();
                    f.selected = new Set([v]);
                    syncCheckboxes(id);
                    applyFilters();
                });

                row.appendChild(label);
                row.appendChild(onlyBtn);
                container.appendChild(row);

                f.checkboxes[v] = cb;
                f.rows[v] = row;
            });
        });

        // Update checkbox checked states to match f.selected, without rebuilding DOM
        function syncCheckboxes(id) {
            const f = filters[id];
            f.all.forEach(v => {
                f.checkboxes[v].checked = f.selected.has(v);
            });
        }

        // Show/hide option rows based on search query
        function filterOptionRows(id, query) {
            const f = filters[id];
            const q = query.toLowerCase();
            f.all.forEach(v => {
                const match = (!q || v.toLowerCase().includes(q)) && f.rows[v].dataset.empty !== 'true';
                f.rows[v].style.display = match ? '' : 'none';
            });
        }

        function updateBadges() {
            Object.keys(filters).forEach(id => {
                const f = filters[id];
                if (f.selected.size < f.all.length) {
                    f.badge.innerHTML = `<span class="filter-badge">${f.selected.size}/${f.all.length}</span>`;
                    f.btn.classList.add('active');
                } else {
                    f.badge.innerHTML = '';
                    f.btn.classList.remove('active');
                }
            });
        }

        function updateFilterCounts() {
            const query = searchInput.value.toLowerCase();
            Object.keys(filters).forEach(id => {
                const f = filters[id];
                const otherId = id === 'typeFilter' ? 'catFilter' : 'typeFilter';
                const otherF = filters[otherId];
                const counts = {};
                f.all.forEach(v => { counts[v] = 0; });
                data.forEach(item => {
                    const matchOther = otherF.selected.has(item[otherF.key]);
                    const matchSearch = !query || item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
                    if (matchOther && matchSearch) counts[item[f.key]]++;
                });
                f.all.forEach(v => {
                    const row = f.rows[v];
                    let countEl = row.querySelector('.filter-count');
                    if (!countEl) {
                        countEl = document.createElement('span');
                        countEl.className = 'filter-count';
                        row.insertBefore(countEl, row.querySelector('.only-btn'));
                    }
                    countEl.textContent = counts[v];
                    row.dataset.empty = counts[v] === 0 ? 'true' : '';
                    row.style.display = counts[v] === 0 ? 'none' : '';
                });
            });
        }

        function applyFilters() {
            const query = searchInput.value.toLowerCase();
            let visible = 0;
            data.forEach(item => {
                const matchType = filters.typeFilter.selected.has(item.type);
                const matchCat = filters.catFilter.selected.has(item.cat);
                const matchSearch = !query || item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query);
                const show = matchType && matchCat && matchSearch;
                item.tr.classList.toggle('hidden', !show);
                if (show) visible++;
            });
            statShowing.textContent = `showing ${visible}`;
            noResults.classList.toggle('show', visible === 0);
            updateBadges();
            updateFilterCounts();
        }

        // Search
        searchInput.addEventListener('input', applyFilters);

        // Toggle dropdown
        function toggleDropdown(id) {
            const dd = document.getElementById(id);
            const isOpen = dd.classList.contains('show');
            closeAll();
            if (!isOpen) {
                const rect = filters[id].btn.parentElement.getBoundingClientRect();
                dd.style.top = `${rect.bottom + 4}px`;
                dd.style.left = `${rect.left}px`;
                dd.classList.add('show');
                const ddRect = dd.getBoundingClientRect();
                if (ddRect.right > window.innerWidth - 8) {
                    dd.style.left = `${Math.max(8, window.innerWidth - ddRect.width - 8)}px`;
                }
                if (ddRect.left < 8) {
                    dd.style.left = '8px';
                }
                const search = dd.querySelector('.filter-search');
                search.value = '';
                filterOptionRows(id, '');
                search.focus();
            }
        }

        function closeAll() {
            document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('show'));
        }

        // Wire up filter buttons — portal each dropdown to <body> so table-wrap overflow never clips it
        const allDropdowns = [];
        Object.keys(filters).forEach(id => {
            const f = filters[id];
            const dd = document.getElementById(id);
            const anchor = f.btn.parentElement; // .filter-wrap, stays in the table
            allDropdowns.push({ dd, wrap: anchor });
            document.body.appendChild(dd); // move out of table DOM

            f.btn.addEventListener('click', e => {
                e.preventDefault();
                toggleDropdown(id);
            });

            dd.querySelector('.filter-search').addEventListener('input', function() {
                filterOptionRows(id, this.value);
            });

            dd.querySelector('.sel-all').addEventListener('click', e => {
                e.preventDefault();
                f.selected = new Set(f.all);
                syncCheckboxes(id);
                applyFilters();
            });

            dd.querySelector('.clr-all').addEventListener('click', e => {
                e.preventDefault();
                f.selected = new Set();
                syncCheckboxes(id);
                applyFilters();
            });
        });

        // Close dropdowns when clicking outside — uses contains() instead of stopPropagation
        document.addEventListener('click', e => {
            allDropdowns.forEach(item => {
                if (!item.wrap.contains(e.target) && !item.dd.contains(e.target)) {
                    item.dd.classList.remove('show');
                }
            });
        });

        // Keyboard: Escape closes dropdowns
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeAll();
        });

        // --- Column sorting ---
        const currentSort = { col: -1, dir: 'asc' };

        function sortByColumn(colIndex) {
            const allTh = table.querySelectorAll('th.sortable');
            if (currentSort.col === colIndex) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.col = colIndex;
                currentSort.dir = 'asc';
            }
            allTh.forEach(th => th.classList.remove('asc', 'desc'));
            const activeTh = table.querySelector(`th[data-col="${colIndex}"]`);
            if (activeTh) activeTh.classList.add(currentSort.dir);
            if (colIndex === 1) document.getElementById('typeBtnEl').parentElement.parentElement.classList.add(currentSort.dir);
            if (colIndex === 3) document.getElementById('catBtnEl').parentElement.parentElement.classList.add(currentSort.dir);

            const key = colKeys[colIndex];
            const dir = currentSort.dir === 'asc' ? 1 : -1;
            data.sort((a, b) => {
                const aVal = a[key].toLowerCase();
                const bVal = b[key].toLowerCase();
                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
            data.forEach(item => tbody.appendChild(item.tr));
        }

        // Sortable plain headers
        table.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                sortByColumn(parseInt(th.getAttribute('data-col')));
            });
        });

        // Make Type and Category column headers also sortable on direct th click
        Object.keys(filters).forEach(id => {
            const f = filters[id];
            const th = f.btn.closest('th');
            th.classList.add('sortable');
            th.setAttribute('data-col', f.col);
            th.addEventListener('click', e => {
                if (e.target === th) sortByColumn(f.col);
            });
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

        // Initial render
        updateBadges();
        applyFilters();
    }
})();
