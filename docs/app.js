(function() {
    var table = document.getElementById('pkgTable');
    var rows = Array.from(table.querySelectorAll('tbody tr'));
    var searchInput = document.getElementById('nameSearch');
    var noResults = document.getElementById('noResults');

    // Filter state
    var filters = {
        typeFilter: { col: 1, selected: new Set(), all: [], badge: document.getElementById('typeBadge'), btn: document.getElementById('typeBtnEl') },
        catFilter: { col: 4, selected: new Set(), all: [], badge: document.getElementById('catBadge'), btn: document.getElementById('catBtnEl') }
    };

    // Stats
    var statTotal = document.getElementById('statTotal');
    var statFormula = document.getElementById('statFormula');
    var statCask = document.getElementById('statCask');
    var statShowing = document.getElementById('statShowing');
    var totalFormulas = rows.filter(function(r) { return r.cells[1].textContent.trim() === 'Formula'; }).length;
    var totalCasks = rows.length - totalFormulas;
    statTotal.textContent = rows.length + ' packages';
    statFormula.textContent = totalFormulas + ' formulas';
    statCask.textContent = totalCasks + ' casks';

    // Initialize filters: build option elements once, never destroy them
    Object.keys(filters).forEach(function(id) {
        var f = filters[id];
        var vals = new Set();
        rows.forEach(function(r) { vals.add(r.cells[f.col].textContent.trim()); });
        f.all = Array.from(vals).sort();
        f.selected = new Set(f.all);
        f.checkboxes = {}; // store references to checkbox elements
        f.rows = {};       // store references to row elements

        var container = document.querySelector('#' + id + ' .filter-options');
        f.all.forEach(function(v) {
            var row = document.createElement('div');
            row.className = 'filter-row';
            row.setAttribute('data-value', v.toLowerCase());

            var label = document.createElement('label');
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.addEventListener('change', function() {
                if (this.checked) f.selected.add(v); else f.selected.delete(v);
                applyFilters();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(v));

            var onlyBtn = document.createElement('button');
            onlyBtn.className = 'only-btn';
            onlyBtn.textContent = 'Only';
            onlyBtn.addEventListener('click', function(e) {
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
        var f = filters[id];
        f.all.forEach(function(v) {
            f.checkboxes[v].checked = f.selected.has(v);
        });
    }

    // Show/hide option rows based on search query
    function filterOptionRows(id, query) {
        var f = filters[id];
        var q = query.toLowerCase();
        f.all.forEach(function(v) {
            var match = !q || v.toLowerCase().indexOf(q) !== -1;
            f.rows[v].style.display = match ? '' : 'none';
        });
    }

    function updateBadges() {
        Object.keys(filters).forEach(function(id) {
            var f = filters[id];
            if (f.selected.size < f.all.length) {
                f.badge.innerHTML = '<span class="filter-badge">' + f.selected.size + '/' + f.all.length + '</span>';
                f.btn.classList.add('active');
            } else {
                f.badge.innerHTML = '';
                f.btn.classList.remove('active');
            }
        });
    }

    function applyFilters() {
        var query = searchInput.value.toLowerCase();
        var visible = 0;
        rows.forEach(function(r) {
            var typeVal = r.cells[1].textContent.trim();
            var catVal = r.cells[4].textContent.trim();
            var nameVal = r.cells[0].textContent.toLowerCase();
            var descVal = r.cells[2].textContent.toLowerCase();
            var matchType = filters.typeFilter.selected.has(typeVal);
            var matchCat = filters.catFilter.selected.has(catVal);
            var matchSearch = !query || nameVal.indexOf(query) !== -1 || descVal.indexOf(query) !== -1;
            var show = matchType && matchCat && matchSearch;
            r.classList.toggle('hidden', !show);
            if (show) visible++;
        });
        statShowing.textContent = visible < rows.length ? 'showing ' + visible : '';
        noResults.classList.toggle('show', visible === 0);
        updateBadges();
    }

    // Search
    searchInput.addEventListener('input', applyFilters);

    // Toggle dropdown
    function toggleDropdown(id) {
        var dd = document.getElementById(id);
        var isOpen = dd.classList.contains('show');
        closeAll();
        if (!isOpen) {
            dd.classList.add('show');
            var search = dd.querySelector('.filter-search');
            search.value = '';
            filterOptionRows(id, '');
            search.focus();
        }
    }

    function closeAll() {
        document.querySelectorAll('.filter-dropdown').forEach(function(d) { d.classList.remove('show'); });
    }

    // Wire up filter buttons
    var allDropdowns = [];
    Object.keys(filters).forEach(function(id) {
        var f = filters[id];
        var dd = document.getElementById(id);
        allDropdowns.push({ dd: dd, wrap: dd.parentElement });

        f.btn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown(id);
        });

        dd.querySelector('.filter-search').addEventListener('input', function() {
            filterOptionRows(id, this.value);
        });

        dd.querySelector('.sel-all').addEventListener('click', function(e) {
            e.preventDefault();
            f.selected = new Set(f.all);
            syncCheckboxes(id);
            applyFilters();
        });

        dd.querySelector('.clr-all').addEventListener('click', function(e) {
            e.preventDefault();
            f.selected = new Set();
            syncCheckboxes(id);
            applyFilters();
        });
    });

    // Close dropdowns when clicking outside — uses contains() instead of stopPropagation
    document.addEventListener('click', function(e) {
        allDropdowns.forEach(function(item) {
            if (!item.wrap.contains(e.target)) {
                item.dd.classList.remove('show');
            }
        });
    });

    // Keyboard: Escape closes dropdowns
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAll();
    });

    // --- Column sorting ---
    var tbody = table.querySelector('tbody');
    var currentSort = { col: -1, dir: 'asc' };

    function sortByColumn(colIndex) {
        var allTh = table.querySelectorAll('th.sortable');
        // Toggle direction if same column, otherwise default to asc
        if (currentSort.col === colIndex) {
            currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.col = colIndex;
            currentSort.dir = 'asc';
        }
        // Update header classes
        allTh.forEach(function(th) { th.classList.remove('asc', 'desc'); });
        var activeTh = table.querySelector('th[data-col="' + colIndex + '"]');
        if (activeTh) activeTh.classList.add(currentSort.dir);
        // Also update filter column headers
        if (colIndex === 1) document.getElementById('typeBtnEl').parentElement.parentElement.classList.add(currentSort.dir);
        if (colIndex === 4) document.getElementById('catBtnEl').parentElement.parentElement.classList.add(currentSort.dir);

        var dir = currentSort.dir === 'asc' ? 1 : -1;
        rows.sort(function(a, b) {
            var aVal = a.cells[colIndex].textContent.trim().toLowerCase();
            var bVal = b.cells[colIndex].textContent.trim().toLowerCase();
            if (aVal < bVal) return -1 * dir;
            if (aVal > bVal) return 1 * dir;
            return 0;
        });
        rows.forEach(function(r) { tbody.appendChild(r); });
    }

    // Sortable plain headers
    table.querySelectorAll('th.sortable').forEach(function(th) {
        th.addEventListener('click', function() {
            sortByColumn(parseInt(th.getAttribute('data-col')));
        });
    });

    // Make Formula/Cask and Category column headers also sortable (via right-click area or shift+click)
    // We'll add sort on shift+click for filter columns to avoid conflict with dropdown toggle
    Object.keys(filters).forEach(function(id) {
        var f = filters[id];
        var th = f.btn.closest('th');
        th.classList.add('sortable');
        th.setAttribute('data-col', f.col);
        th.addEventListener('click', function(e) {
            // Only sort if clicking the th itself, not the filter button or dropdown
            if (e.target === th) {
                sortByColumn(f.col);
            }
        });
    });

    // --- Row counts per filter option ---
    function updateFilterCounts() {
        Object.keys(filters).forEach(function(id) {
            var f = filters[id];
            var counts = {};
            f.all.forEach(function(v) { counts[v] = 0; });
            rows.forEach(function(r) {
                var val = r.cells[f.col].textContent.trim();
                // Count only rows visible by the OTHER filter + search (not this filter)
                var otherId = id === 'typeFilter' ? 'catFilter' : 'typeFilter';
                var otherVal = r.cells[filters[otherId].col].textContent.trim();
                var query = searchInput.value.toLowerCase();
                var nameVal = r.cells[0].textContent.toLowerCase();
                var descVal = r.cells[2].textContent.toLowerCase();
                var matchOther = filters[otherId].selected.has(otherVal);
                var matchSearch = !query || nameVal.indexOf(query) !== -1 || descVal.indexOf(query) !== -1;
                if (matchOther && matchSearch) {
                    counts[val]++;
                }
            });
            f.all.forEach(function(v) {
                var row = f.rows[v];
                var countEl = row.querySelector('.filter-count');
                if (!countEl) {
                    countEl = document.createElement('span');
                    countEl.className = 'filter-count';
                    row.insertBefore(countEl, row.querySelector('.only-btn'));
                }
                countEl.textContent = counts[v];
            });
        });
    }

    // Patch applyFilters to also update counts
    var origApplyFilters = applyFilters;
    applyFilters = function() {
        origApplyFilters();
        updateFilterCounts();
    };

    // Initial render
    updateBadges();
    applyFilters();
})();

