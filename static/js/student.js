// Student Dashboard JavaScript

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (!token || role !== 'STUDENT') {
        window.location.href = '/login/';
        return false;
    }
    return true;
}

// API helper function
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token expired
            localStorage.clear();
            window.location.href = '/login/';
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Load student data
async function loadStudentData() {
    const userName = localStorage.getItem('user_name');
    if (userName) {
        document.getElementById('studentName').textContent = userName;
    }
    
    // Load all data
    await loadStats();
    await loadRecentHomework();
    await loadSchedule();
    await loadAllHomework();
    await loadGrades();
}

// Load statistics
async function loadStats() {
    const data = await apiRequest('/api/homework/stats/');
    
    if (data) {
        document.getElementById('totalHomework').textContent = data.total || 0;
        document.getElementById('pendingHomework').textContent = data.pending || 0;
        document.getElementById('submittedHomework').textContent = data.submitted || 0;
        document.getElementById('averageGrade').textContent = data.average_grade || '0';
    }
}

// Load recent homework
async function loadRecentHomework() {
    const data = await apiRequest('/api/homework/recent/');
    const container = document.getElementById('recentHomeworkList');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Hozircha uyga vazifalar yo'q</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="homework-table">
            <thead>
                <tr>
                    <th>Mavzu</th>
                    <th>Kurs</th>
                    <th>Muddat</th>
                    <th>Holat</th>
                    <th>Baho</th>
                    <th>Amallar</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(hw => {
        const deadline = new Date(hw.deadline);
        const statusClass = hw.status === 'PENDING' ? 'status-pending' : 
                           hw.status === 'SUBMITTED' ? 'status-submitted' : 'status-graded';
        const statusText = hw.status === 'PENDING' ? 'Kutilmoqda' : 
                          hw.status === 'SUBMITTED' ? 'Topshirilgan' : 'Baholangan';
        
        html += `
            <tr>
                <td><strong>${hw.title}</strong></td>
                <td>${hw.course}</td>
                <td>${deadline.toLocaleDateString('uz-UZ')}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${hw.grade ? `<span class="grade-badge">${hw.grade}</span>` : '-'}</td>
                <td>
                    <a href="/homework/${hw.id}/" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;">
                        <i class="fas fa-eye"></i> Ko'rish
                    </a>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Load schedule
async function loadSchedule() {
    const data = await apiRequest('/api/schedules/my-schedule/');
    const container = document.getElementById('scheduleList');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>Dars jadvali mavjud emas</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="schedule-table">
            <thead>
                <tr>
                    <th>Kun</th>
                    <th>Kurs</th>
                    <th>Vaqt</th>
                    <th>Ustoz</th>
                    <th>Xona</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const days = {
        'MONDAY': 'Dushanba',
        'TUESDAY': 'Seshanba',
        'WEDNESDAY': 'Chorshanba',
        'THURSDAY': 'Payshanba',
        'FRIDAY': 'Juma',
        'SATURDAY': 'Shanba',
        'SUNDAY': 'Yakshanba'
    };
    
    data.forEach(schedule => {
        html += `
            <tr>
                <td><strong>${days[schedule.day_of_week]}</strong></td>
                <td>${schedule.course_name}</td>
                <td>${schedule.start_time} - ${schedule.end_time}</td>
                <td>${schedule.teacher_name}</td>
                <td>${schedule.room || '-'}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Load all homework
async function loadAllHomework() {
    const data = await apiRequest('/api/homework/');
    const container = document.getElementById('allHomeworkList');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Uyga vazifalar yo'q</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="homework-table">
            <thead>
                <tr>
                    <th>Mavzu</th>
                    <th>Kurs</th>
                    <th>Berilgan sana</th>
                    <th>Muddat</th>
                    <th>Holat</th>
                    <th>Baho</th>
                    <th>Amallar</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(hw => {
        const created = new Date(hw.created_at);
        const deadline = new Date(hw.deadline);
        const statusClass = hw.status === 'PENDING' ? 'status-pending' : 
                           hw.status === 'SUBMITTED' ? 'status-submitted' : 'status-graded';
        const statusText = hw.status === 'PENDING' ? 'Kutilmoqda' : 
                          hw.status === 'SUBMITTED' ? 'Topshirilgan' : 'Baholangan';
        
        html += `
            <tr>
                <td><strong>${hw.title}</strong></td>
                <td>${hw.course}</td>
                <td>${created.toLocaleDateString('uz-UZ')}</td>
                <td>${deadline.toLocaleDateString('uz-UZ')}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${hw.grade ? `<span class="grade-badge">${hw.grade}</span>` : '-'}</td>
                <td>
                    <a href="/homework/${hw.id}/" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;">
                        <i class="fas fa-eye"></i> Ko'rish
                    </a>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Load grades
async function loadGrades() {
    const data = await apiRequest('/api/ratings/my-grades/');
    const container = document.getElementById('gradesList');
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>Baholangan vazifalar yo'q</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="homework-table">
            <thead>
                <tr>
                    <th>Mavzu</th>
                    <th>Kurs</th>
                    <th>Baho</th>
                    <th>Izoh</th>
                    <th>Sana</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(grade => {
        const date = new Date(grade.graded_at);
        html += `
            <tr>
                <td><strong>${grade.homework_title}</strong></td>
                <td>${grade.course}</td>
                <td><span class="grade-badge">${grade.grade}</span></td>
                <td>${grade.feedback || '-'}</td>
                <td>${date.toLocaleDateString('uz-UZ')}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Show section
function showSection(section) {
    // Hide all sections
    document.getElementById('overviewSection').style.display = 'none';
    document.getElementById('scheduleSection').style.display = 'none';
    document.getElementById('homeworkSection').style.display = 'none';
    document.getElementById('gradesSection').style.display = 'none';
    
    // Remove active class from all links
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    if (section === 'overview') {
        document.getElementById('overviewSection').style.display = 'block';
    } else if (section === 'schedule') {
        document.getElementById('scheduleSection').style.display = 'block';
    } else if (section === 'homework') {
        document.getElementById('homeworkSection').style.display = 'block';
    } else if (section === 'grades') {
        document.getElementById('gradesSection').style.display = 'block';
    }
    
    // Add active class to clicked link
    event.target.classList.add('active');
}

// Initialize
if (checkAuth()) {
    document.addEventListener('DOMContentLoaded', loadStudentData);
}