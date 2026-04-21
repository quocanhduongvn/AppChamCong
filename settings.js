document.addEventListener('DOMContentLoaded', () => {
    const defaultMultipliers = [100, 150, 30, 200, 270];
    const defaultHeaders = ['100%', '150%', '30%', '200%', '270%'];

    const elements = {
        baseSalary: document.getElementById('base-salary'),
        salaryUnit: document.getElementById('salary-unit'),
        hourlyRateDisplay: document.getElementById('hourly-rate-display'),
        allowance: document.getElementById('allowance'),
        deduction: document.getElementById('deduction'),
        totalSalary: document.getElementById('total-salary'),
        monthDisplay: document.getElementById('month-display')
    };

    const multiInputs = [];
    const colLabels = [];
    for (let i = 1; i <= 5; i++) {
        multiInputs.push(document.getElementById(`multi-${i}`));
        colLabels.push(document.getElementById(`label-col-${i}`));
    }

    // Load data from local storage
    let viewMonth = localStorage.getItem('chamcong_view_month') || new Date().getMonth() + 1;
    let viewYear = localStorage.getItem('chamcong_view_year') || new Date().getFullYear();

    // In case they are strings, make them numbers
    viewMonth = parseInt(viewMonth);
    viewYear = parseInt(viewYear);

    elements.monthDisplay.textContent = `Lương Tháng ${viewMonth}/${viewYear}`;

    elements.baseSalary.value = localStorage.getItem('chamcong_base_salary') || 28000;
    elements.salaryUnit.value = localStorage.getItem('chamcong_salary_unit') || 'hour';
    elements.allowance.value = localStorage.getItem('chamcong_allowance') || 0;
    elements.deduction.value = localStorage.getItem('chamcong_deduction') || 500000;

    for (let i = 0; i < 5; i++) {
        const colNum = i + 1;
        // Load custom labels from index.html (or defaults)
        const customName = localStorage.getItem(`chamcong_col_header_${colNum}`) || defaultHeaders[i];
        if (customName && customName !== '...') {
            colLabels[i].textContent = customName;
        }

        // Load multipliers
        multiInputs[i].value = localStorage.getItem(`chamcong_multi_${colNum}`) || defaultMultipliers[i];
    }

    function calculateSalary() {
        const baseSalaryInput = parseFloat(elements.baseSalary.value) || 0;
        const allowance = parseFloat(elements.allowance.value) || 0;

        let baseSalaryPerHour = baseSalaryInput;
        if (elements.salaryUnit.value === 'day') {
            baseSalaryPerHour = baseSalaryInput / 8;
        } else if (elements.salaryUnit.value === 'month') {
            baseSalaryPerHour = baseSalaryInput / 208; // 26 days * 8 hours = 208 hours
        }

        if (elements.hourlyRateDisplay) {
            const formatHour = new Intl.NumberFormat('vi-VN').format(Math.round(baseSalaryPerHour));
            elements.hourlyRateDisplay.textContent = `(Tương đương: ${formatHour} đ / giờ)`;
        }

        let totalEarned = 0;

        // Calculate total hours exactly how it's done in index.js
        const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
        let colTotals = [0, 0, 0, 0, 0];

        for (let d = 1; d <= daysInMonth; d++) {
            const storageKeyPrefix = `chamcong_data_${viewYear}_${viewMonth}_${d}`;
            for (let c = 1; c <= 5; c++) {
                const val = parseFloat(localStorage.getItem(`${storageKeyPrefix}_col${c}`));
                if (!isNaN(val)) {
                    colTotals[c - 1] += val;
                }
            }
        }

        let breakdownHTML = '';
        const numberFormat = new Intl.NumberFormat('vi-VN');

        // Multiply columns
        for (let i = 0; i < 5; i++) {
            const multi = parseFloat(multiInputs[i].value) || 0;
            const percentage = multi / 100;
            const colMoney = colTotals[i] * baseSalaryPerHour * percentage;
            totalEarned += colMoney;

            if (colTotals[i] > 0) {
                const colName = colLabels[i].textContent;
                breakdownHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${colName} (${colTotals[i]} x ${multi}%):</span>
                    <span style="color: #fff;">${numberFormat.format(colMoney)} đ</span>
                </div>`;
            }
        }

        // Add allowance
        totalEarned += allowance;
        if (allowance > 0) {
            breakdownHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Phụ cấp:</span>
                <span style="color: #00ff00;">+${numberFormat.format(allowance)} đ</span>
            </div>`;
        }

        // Subtract deduction
        const deductionAmount = parseFloat(elements.deduction.value) || 0;
        totalEarned -= deductionAmount;
        if (deductionAmount > 0) {
            breakdownHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Khấu trừ:</span>
                <span style="color: #ff4d4d;">-${numberFormat.format(deductionAmount)} đ</span>
            </div>`;
        }

        document.getElementById('salary-breakdown').innerHTML = breakdownHTML;

        // Formatter -> 1.000.000 đ
        elements.totalSalary.textContent = numberFormat.format(totalEarned) + ' đ';
    }

    // Attach listeners to recalculate on the fly
    [elements.baseSalary, elements.salaryUnit, elements.allowance, elements.deduction, ...multiInputs].forEach(input => {
        input.addEventListener('input', () => {
            // Save settings immediately
            localStorage.setItem('chamcong_base_salary', elements.baseSalary.value);
            localStorage.setItem('chamcong_salary_unit', elements.salaryUnit.value);
            localStorage.setItem('chamcong_allowance', elements.allowance.value);
            localStorage.setItem('chamcong_deduction', elements.deduction.value);

            multiInputs.forEach((mi, idx) => {
                localStorage.setItem(`chamcong_multi_${idx + 1}`, mi.value);
            });

            calculateSalary();
        });
    });

    // Initial calculation when open page
    calculateSalary();
});
