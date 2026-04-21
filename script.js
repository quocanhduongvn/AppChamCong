document.addEventListener('DOMContentLoaded', () => {
    // Trạng thái ứng dụng
    const state = {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1, // 1 - 12
        todayDate: new Date().getDate(),
        todayMonth: new Date().getMonth() + 1,
        todayYear: new Date().getFullYear(),
        viewUser: 'NAME'
    };

    // DOM Elements
    const elements = {
        displayMonth: document.getElementById('display-month'),
        timesheetBody: document.getElementById('timesheet-body'),
        monthNav: document.getElementById('month-nav'),
        totalCols: [
            document.getElementById('total-col-1'),
            document.getElementById('total-col-2'),
            document.getElementById('total-col-3'),
            document.getElementById('total-col-4'),
            document.getElementById('total-col-5')
        ],
        userName: document.getElementById('user-name')
    };

    // Khởi tạo user name và col headers từ localStorage
    elements.userName.value = localStorage.getItem('chamcong_user_name') || elements.userName.defaultValue;
    elements.userName.addEventListener('input', (e) => {
        localStorage.setItem('chamcong_user_name', e.target.value);
    });

    for (let i = 1; i <= 5; i++) {
        const hInput = document.getElementById(`col-header-${i}`);
        if (hInput) {
            hInput.value = localStorage.getItem(`chamcong_col_header_${i}`) || hInput.defaultValue;
            hInput.addEventListener('input', (e) => {
                localStorage.setItem(`chamcong_col_header_${i}`, e.target.value);
            });
        }
    }

    // Tên thứ tiếng Việt
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Khởi tạo
    initApp();

    function initApp() {
        renderMonthNav();
        renderTimesheet();
    }

    function renderMonthNav() {
        elements.monthNav.innerHTML = '';
        // Hiển thị tháng hiện tại và vài tháng trước/sau
        for (let i = -2; i <= 3; i++) {
            let m = state.currentMonth + i;
            let y = state.currentYear;

            if (m < 1) {
                m += 12;
                y -= 1;
            } else if (m > 12) {
                m -= 12;
                y += 1;
            }

            const monthStr = `${m}/${y}`;
            const div = document.createElement('div');
            div.className = `month-item ${i === 0 ? 'active' : ''}`;
            div.textContent = monthStr;

            div.addEventListener('click', () => {
                state.currentMonth = m;
                state.currentYear = y;
                renderMonthNav();
                renderTimesheet();
            });

            elements.monthNav.appendChild(div);
        }

        // Croll to active active item
        const activeItem = elements.monthNav.querySelector('.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }

    function renderTimesheet() {
        // Cập nhật header text
        elements.displayMonth.textContent = `${state.currentMonth}.${state.currentYear}`;

        // Tính số ngày trong tháng
        const daysInMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();

        elements.timesheetBody.innerHTML = '';

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(state.currentYear, state.currentMonth - 1, d);
            const dayOfWeek = dateObj.getDay(); // 0 is Sunday
            const dayName = dayNames[dayOfWeek];
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isCurrentDay = (d === state.todayDate && state.currentMonth === state.todayMonth && state.currentYear === state.todayYear);

            const tr = document.createElement('tr');
            tr.className = `day-row ${isWeekend ? 'weekend' : ''} ${isCurrentDay ? 'current-day' : ''}`;

            const storageKeyPrefix = `chamcong_data_${state.currentYear}_${state.currentMonth}_${d}`;

            let html = `
                <td class="col-date">${d}</td>
                <td class="col-day">${dayName}</td>
            `;

            // 5 cột input
            for (let c = 1; c <= 5; c++) {
                const val = localStorage.getItem(`${storageKeyPrefix}_col${c}`) || '';
                html += `
                    <td class="input-cell col-${c}">
                        <input type="number" step="0.5" data-day="${d}" data-col="${c}" value="${val}">
                    </td>
                `;
            }

            tr.innerHTML = html;
            elements.timesheetBody.appendChild(tr);
        }

        attachInputListeners();
        calculateTotals();
    }

    function attachInputListeners() {
        const inputs = elements.timesheetBody.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const day = e.target.getAttribute('data-day');
                const col = e.target.getAttribute('data-col');
                const val = e.target.value;

                const storageKeyPrefix = `chamcong_data_${state.currentYear}_${state.currentMonth}_${day}`;

                if (val !== '') {
                    localStorage.setItem(`${storageKeyPrefix}_col${col}`, val);
                } else {
                    localStorage.removeItem(`${storageKeyPrefix}_col${col}`);
                }

                calculateTotals();
            });
        });
    }

    function calculateTotals() {
        let totals = [0, 0, 0, 0, 0];

        const inputs = elements.timesheetBody.querySelectorAll('input');
        inputs.forEach(input => {
            const col = parseInt(input.getAttribute('data-col'));
            const val = parseFloat(input.value);
            if (!isNaN(val)) {
                totals[col - 1] += val;
            }
        });

        // Hiển thị
        for (let i = 0; i < 5; i++) {
            elements.totalCols[i].textContent = totals[i] > 0 ? totals[i] : '';
        }
    }

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Lưu tháng đang chọn để trang settings tính tổng
            localStorage.setItem('chamcong_view_month', state.currentMonth);
            localStorage.setItem('chamcong_view_year', state.currentYear);
            window.location.href = 'settings.html';
        });
    }
});
