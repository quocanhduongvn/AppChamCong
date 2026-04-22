document.addEventListener('DOMContentLoaded', () => {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1;
    const todayStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

    const calGrid = document.getElementById('cal-grid');
    const monthSelector = document.getElementById('month-selector');
    const quickTotal = document.getElementById('quick-total');

    const modal = document.getElementById('quick-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalVal = document.getElementById('modal-val');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');

    let activeDay = null;

    // Load saved month from settings if any
    const savedMonth = localStorage.getItem('chamcong_view_month');
    const savedYear = localStorage.getItem('chamcong_view_year');
    if (savedMonth && savedYear) {
        currentMonth = parseInt(savedMonth);
        currentYear = parseInt(savedYear);
    }

    function renderMonthNav() {
        monthSelector.innerHTML = '';
        for (let i = -1; i <= 1; i++) {
            let m = currentMonth + i;
            let y = currentYear;
            if (m < 1) { m += 12; y -= 1; }
            if (m > 12) { m -= 12; y += 1; }

            const div = document.createElement('div');
            div.className = `m-item ${i === 0 ? 'active' : ''}`;
            div.textContent = `${m}/${y}`;
            div.addEventListener('click', () => {
                currentMonth = m;
                currentYear = y;
                localStorage.setItem('chamcong_view_month', currentMonth);
                localStorage.setItem('chamcong_view_year', currentYear);
                renderApp();
            });
            monthSelector.appendChild(div);
        }
    }

    function renderApp() {
        renderMonthNav();
        calGrid.innerHTML = '';

        let totalVal = 0;

        // 1st of month
        const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
        // convert 0=Sun back to standard: Mon=0, Tue=1... Sun=6
        let startDay = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Empty cells before start of month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            calGrid.appendChild(emptyCell);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            const isToday = `${currentYear}-${currentMonth}-${d}` === todayStr;
            cell.className = `cal-cell ${isToday ? 'today' : ''}`;

            // Value in storage. Maps to column 2 (150%) by default
            const storageKey = `chamcong_data_${currentYear}_${currentMonth}_${d}_col2`;
            const val = localStorage.getItem(storageKey) || '';

            if (val && !isNaN(parseFloat(val))) {
                totalVal += parseFloat(val);
            }

            cell.innerHTML = `
                <div class="date-top">${d}</div>
                <div class="cell-value">${val}</div>
            `;

            cell.addEventListener('click', () => {
                activeDay = d;
                modalTitle.textContent = `Nhập công ngày ${d}/${currentMonth}`;
                modalVal.value = val;
                modal.style.display = 'flex';
                // Focus input slightly after modal display
                setTimeout(() => {
                    modalVal.focus();
                    if (modalVal.value) modalVal.select();
                }, 100);
            });

            calGrid.appendChild(cell);
        }

        quickTotal.textContent = totalVal > 0 ? parseFloat(totalVal.toFixed(2)) : '0';
    }

    renderApp();

    modalCancel.addEventListener('click', () => {
        modal.style.display = 'none';
        activeDay = null;
    });

    modalSave.addEventListener('click', () => {
        if (!activeDay) return;
        const val = modalVal.value;
        const storageKey = `chamcong_data_${currentYear}_${currentMonth}_${activeDay}_col1`;

        if (val === '' || val === '0') {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, val);
        }

        modal.style.display = 'none';
        renderApp();
    });

    // Handle enter key in modal
    modalVal.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modalSave.click();
        }
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modalCancel.click();
        }
    });
});
