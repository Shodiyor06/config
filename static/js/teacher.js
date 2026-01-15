// Teacher Dashboard JavaScript

// Check authentication
if (!auth.requireAuth('TEACHER')) {
    // Will redirect if not authenticated or wrong role
}

// Load teacher data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTeacherData();
    loadGroups();
});

// Load all teacher data
async function loadTeacherData() {
    const user = auth.getCurrentUser();
    document.getElementById('teacherName').textContent = user.name || 'Ustoz';
    
    await loadStats();
    await loadRecentSubmissions();
    await loadHomeworkList();
    await loadAllSubmissions();
}

// Load statistics
async function loadStats() {
    try {
        const response = await auth.authenticatedRequest('/api/homework/teacher-stats/');
        const data = await response.json();
        
        document.getElementById('totalGroups').textContent = data.total_groups || 0;
        document.getElementById('totalStudents').textContent = data.total_students || 0;
        document.getElementById('totalHomework').textContent = data.total_homework || 0;
        document.getElementById('pendingGrades').textContent = data.pending_grades || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent submissions
async function loadRecentSubmissions() {
    const container = document.getElementById('recentSubmissions');
    
    try {
        const response = await auth.authenticatedRequest('/api/homework/recent-submissions/');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Hozircha topshiriqlar yo'q</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="submissions-grid">';
        
        data.slice(0, 6).forEach(submission => {
            const statusClass = submission.status === 'SUBMITTED' ? 'pending' : 'graded';
            const submittedDate = new Date(submission.submitted_at).toLocaleDateString('uz-UZ');
            
            html += `
                <div class="submission-card ${statusClass}">
                    <div class="student-info">
                        <div class="student-avatar">${submission.student_name.charAt(0).toUpperCase()}</div>
                        <div>
                            <strong>${submission.student_name}</strong>
                            <p style="font-size: 0.9rem; color: var(--gray);">${submission.homework_title}</p>
                        </div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--gray);">
                        <i class="fas fa-clock"></i> ${submittedDate}
                    </p>
                    <div class="submission-actions">
                        <a href="${submission.file_url}" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.9rem;" download>
                            <i class="fas fa-download"></i>
                        </a>
                        ${submission.status === 'SUBMITTED' ? `
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;" onclick="openGradeModal(${submission.id}, '${submission.student_name}', '${submission.homework_title}')">
                                <i class="fas fa-star"></i> Baholash
                            </button>
                        ` : `
                            <span class="grade-badge">${submission.grade}</span>
                        `}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading submissions:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Ma'lumotlarni yuklashda xatolik</p>
            </div>
        `;
    }
}

// Load groups
async function loadGroups() {
    const container = document.getElementById('groupsList');
    const select = document.getElementById('homeworkGroup');
    
    try {
        const response = await auth.authenticatedRequest('/api/groups/my-groups/');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Guruhlar yo'q</p>
                    </div>
                `;
            }
            return;
        }
        
        // Populate select dropdown
        if (select) {
            data.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = `${group.name} - ${group.course_name}`;
                select.appendChild(option);
            });
        }
        
        // Display groups list
        if (container) {
            let html = '<div class="homework-list">';
            
            data.forEach(group => {
                html += `
                    <div class="homework-item">
                        <div class="homework-header">
                            <div>
                                <h3 class="homework-title">${group.name}</h3>
                                <p style="color: var(--primary); font-weight: 600;">${group.course_name}</p>
                            </div>
                            <span class="badge badge-course">${group.student_count} o'quvchi</span>
                        </div>
                        <div class="homework-meta">
                            <span><i class="fas fa-calendar"></i> Boshlanish: ${new Date(group.start_date).toLocaleDateString('uz-UZ')}</span>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

// Load homework list
async function loadHomeworkList() {
    const container = document.getElementById('homeworkList');
    
    try {
        const response = await auth.authenticatedRequest('/api/homework/');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Vazifalar yo'q</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="homework-list">';
        
        data.forEach(hw => {
            const deadline = new Date(hw.deadline);
            const submissions = hw.submission_count || 0;
            const total = hw.student_count || 0;
            
            html += `
                <div class="homework-item">
                    <div class="homework-header">
                        <div>
                            <h3 class="homework-title">${hw.title}</h3>
                            <p style="color: var(--gray);">${hw.description.substring(0, 100)}...</p>
                        </div>
                        <span class="badge badge-course">${hw.group_name}</span>
                    </div>
                    <div class="homework-meta">
                        <span><i class="fas fa-clock"></i> Muddat: ${deadline.toLocaleDateString('uz-UZ')}</span>
                        <span><i class="fas fa-clipboard-check"></i> Topshiriqlar: ${submissions}/${total}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading homework:', error);
    }
}

// Load all submissions
async function loadAllSubmissions() {
    const container = document.getElementById('allSubmissions');
    
    try {
        const response = await auth.authenticatedRequest('/api/homework/all-submissions/');
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Topshiriqlar yo'q</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="submissions-grid">';
        
        data.forEach(submission => {
            const statusClass = submission.status === 'SUBMITTED' ? 'pending' : 'graded';
            const submittedDate = new Date(submission.submitted_at).toLocaleDateString('uz-UZ');
            
            html += `
                <div class="submission-card ${statusClass}">
                    <div class="student-info">
                        <div class="student-avatar">${submission.student_name.charAt(0).toUpperCase()}</div>
                        <div>
                            <strong>${submission.student_name}</strong>
                            <p style="font-size: 0.9rem; color: var(--gray);">${submission.homework_title}</p>
                        </div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--gray);">
                        <i class="fas fa-clock"></i> ${submittedDate}
                    </p>
                    <div class="submission-actions">
                        <a href="${submission.file_url}" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.9rem;" download>
                            <i class="fas fa-download"></i> Yuklab olish
                        </a>
                        ${submission.status === 'SUBMITTED' ? `
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;" onclick="openGradeModal(${submission.id}, '${submission.student_name}', '${submission.homework_title}')">
                                <i class="fas fa-star"></i> Baholash
                            </button>
                        ` : `
                            <span class="grade-badge">${submission.grade}</span>
                        `}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.getElementById('overviewSection').style.display = 'none';
    document.getElementById('groupsSection').style.display = 'none';
    document.getElementById('homeworkSection').style.display = 'none';
    document.getElementById('submissionsSection').style.display = 'none';
    
    // Remove active class
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const sectionMap = {
        'overview': 'overviewSection',
        'groups': 'groupsSection',
        'homework': 'homeworkSection',
        'submissions': 'submissionsSection'
    };
    
    document.getElementById(sectionMap[section]).style.display = 'block';
    event.target.classList.add('active');
}

// Create homework modal
function openCreateHomework() {
    document.getElementById('createHomeworkModal').classList.add('active');
}

function closeCreateHomework() {
    document.getElementById('createHomeworkModal').classList.remove('active');
    document.getElementById('createHomeworkForm').reset();
}

// Create homework form submission
document.getElementById('createHomeworkForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('homeworkTitle').value,
        description: document.getElementById('homeworkDescription').value,
        group: document.getElementById('homeworkGroup').value,
        deadline: document.getElementById('homeworkDeadline').value,
        max_grade: document.getElementById('homeworkMaxGrade').value
    };
    
    try {
        const response = await auth.authenticatedRequest('/api/homework/', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Vazifa muvaffaqiyatli yaratildi!', 'success');
            closeCreateHomework();
            loadHomeworkList();
        } else {
            throw new Error('Failed to create homework');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Vazifa yaratishda xatolik!', 'error');
    }
});

// Grade modal
function openGradeModal(submissionId, studentName, homeworkTitle) {
    document.getElementById('submissionId').value = submissionId;
    document.getElementById('gradeStudentName').textContent = studentName;
    document.getElementById('gradeHomeworkTitle').textContent = homeworkTitle;
    document.getElementById('gradeModal').classList.add('active');
}

function closeGradeModal() {
    document.getElementById('gradeModal').classList.remove('active');
    document.getElementById('gradeForm').reset();
}

// Grade form submission
document.getElementById('gradeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submissionId = document.getElementById('submissionId').value;
    const grade = document.getElementById('gradeValue').value;
    const feedback = document.getElementById('gradeFeedback').value;
    
    try {
        const response = await auth.authenticatedRequest(`/api/homework/submission/${submissionId}/grade/`, {
            method: 'POST',
            body: JSON.stringify({ grade, feedback })
        });
        
        if (response.ok) {
            showNotification('Vazifa muvaffaqiyatli baholandi!', 'success');
            closeGradeModal();
            loadRecentSubmissions();
            loadAllSubmissions();
        } else {
            throw new Error('Failed to grade');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Baholashda xatolik!', 'error');
    }
});

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});