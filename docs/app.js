(function() {
    fetch('packages.tsv').then(r => r.text()).then(text => {
        const tbody = document.querySelector('#pkgTable tbody');
        text.split('\n').forEach(line => {
            if (!line.trim()) return;
            const parts = line.split('\t');
            if (parts.length < 2) return;
            const type = parts[0];
            const name = parts[1];
            const desc = (parts[2] || '').trim();
            const cat = (parts[4] || '').trim();

            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            const codeElement = document.createElement('code');
            const codeLink = document.createElement('a');
            codeLink.textContent = name;
            codeLink.href = parts[3];
            codeElement.appendChild(codeLink);
            tdName.appendChild(codeElement);

            const tdType = document.createElement('td');
            tdType.textContent = type;

            const tdDesc = document.createElement('td');
            tdDesc.textContent = desc;

            const tdCat = document.createElement('td');
            tdCat.textContent = cat;

            tr.appendChild(tdName);
            tr.appendChild(tdType);
            tr.appendChild(tdDesc);
            tr.appendChild(tdCat);
            tbody.appendChild(tr);
        });

        initTable();
    });

    function initTable() {
        const table = document.getElementById('pkgTable');
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const searchInput = document.getElementById('nameSearch');
        const noResults = document.getElementById('noResults');

        // Filter state — category is column 3 (no Alternatives column in this table)
        const filters = {
            typeFilter: { col: 1, selected: new Set(), all: [], badge: document.getElementById('typeBadge'), btn: document.getElementById('typeBtnEl') },
            catFilter: { col: 3, selected: new Set(), all: [], badge: document.getElementById('catBadge'), btn: document.getElementById('catBtnEl') }
        };

        // Stats
        const statTotal = document.getElementById('statTotal');
        const statFormula = document.getElementById('statFormula');
        const statCask = document.getElementById('statCask');
        const statShowing = document.getElementById('statShowing');
        const totalBrew = rows.filter(r => r.cells[1].textContent.trim() === 'brew').length;
        const totalCask = rows.length - totalBrew;
        statTotal.textContent = `${rows.length} packages`;
        statFormula.textContent = `${totalBrew} formulas`;
        statCask.textContent = `${totalCask} casks`;

        // Initialize filters: build option elements once, never destroy them
        Object.keys(filters).forEach(id => {
            const f = filters[id];
            const vals = new Set();
            rows.forEach(r => vals.add(r.cells[f.col].textContent.trim()));
            f.all = Array.from(vals).sort();
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
                const match = !q || v.toLowerCase().includes(q);
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
            Object.keys(filters).forEach(id => {
                const f = filters[id];
                const counts = {};
                f.all.forEach(v => { counts[v] = 0; });
                rows.forEach(r => {
                    const val = r.cells[f.col].textContent.trim();
                    // Count only rows visible by the OTHER filter + search (not this filter)
                    const otherId = id === 'typeFilter' ? 'catFilter' : 'typeFilter';
                    const otherVal = r.cells[filters[otherId].col].textContent.trim();
                    const query = searchInput.value.toLowerCase();
                    const nameVal = r.cells[0].textContent.toLowerCase();
                    const descVal = r.cells[2].textContent.toLowerCase();
                    const matchOther = filters[otherId].selected.has(otherVal);
                    const matchSearch = !query || nameVal.includes(query) || descVal.includes(query);
                    if (matchOther && matchSearch) {
                        counts[val]++;
                    }
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
                });
            });
        }

        function applyFilters() {
            const query = searchInput.value.toLowerCase();
            let visible = 0;
            rows.forEach(r => {
                const typeVal = r.cells[1].textContent.trim();
                const catVal = r.cells[3].textContent.trim();
                const nameVal = r.cells[0].textContent.toLowerCase();
                const descVal = r.cells[2].textContent.toLowerCase();
                const matchType = filters.typeFilter.selected.has(typeVal);
                const matchCat = filters.catFilter.selected.has(catVal);
                const matchSearch = !query || nameVal.includes(query) || descVal.includes(query);
                const show = matchType && matchCat && matchSearch;
                r.classList.toggle('hidden', !show);
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
            allDropdowns.push({ dd: dd, wrap: anchor });
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
                if (!item.wrap.contains(e.target)) {
                    item.dd.classList.remove('show');
                }
            });
        });

        // Keyboard: Escape closes dropdowns
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeAll();
        });

        // --- Column sorting ---
        const tbody = table.querySelector('tbody');
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

            const dir = currentSort.dir === 'asc' ? 1 : -1;
            rows.sort((a, b) => {
                const aVal = a.cells[colIndex].textContent.trim().toLowerCase();
                const bVal = b.cells[colIndex].textContent.trim().toLowerCase();
                if (aVal < bVal) return -1 * dir;
                if (aVal > bVal) return 1 * dir;
                return 0;
            });
            rows.forEach(r => tbody.appendChild(r));
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
                if (e.target === th) {
                    sortByColumn(f.col);
                }
            });
        });

        // CSV export of current filtered view
        document.getElementById('exportBtn').addEventListener('click', () => {
            const lines = ['Name,Type,Description,Category'];
            rows.forEach(r => {
                if (r.classList.contains('hidden')) return;
                const cells = Array.from(r.cells).map(td => {
                    const v = td.textContent.trim().replace(/"/g, '""');
                    return `"${v}"`;
                });
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
            rows.forEach(r => {
                if (r.classList.contains('hidden')) return;
                const type = r.cells[1].textContent.trim();
                const name = r.cells[0].textContent.trim();
                if (type === 'cask') casks.push(name); else formulas.push(name);
            });
            const parts = [];
            if (formulas.length) parts.push(`brew install ${formulas.join(' ')}`);
            if (casks.length) parts.push(`brew install --cask ${casks.join(' ')}`);
            const text = parts.join('\n');
            const btn = document.getElementById('brewBtn');
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
            });
        });

        // Initial render
        updateBadges();
        applyFilters();
    }
})();
