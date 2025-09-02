class TimetableManager {
    constructor() {
        this.currentStream = '';
        this.currentSemester = '';
        this.timetableData = {};
        this.timeSlots = [
            '9:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM',
            '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'
        ];
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Faculty consistency mapping for AI/ML program
        this.aiMlFaculty = {
            'Dr. Suchit Purohit': 'Python Programming',
            'Ms. Anju Jha': 'Artificial Intelligence',
            'Mr. Vishal Prajapati': 'Mathematical Foundation',
            'Dr. Jigna Satani': 'Object Oriented Programming',
            'Ms.Arpana Sonawane': 'Linear Algebra & Numerical Methods'
        };
        
        this.streamInfo = {
            'MCA': {
                name: 'Master of Computer Applications',
                duration: '2 Years',
                totalSemesters: 4,
                description: 'Advanced computer science and applications program'
            },
            'MSC_AI_ML': {
                name: 'MSc Artificial Intelligence & Machine Learning',
                duration: '2 Years',
                totalSemesters: 4,
                description: 'Specialized program in AI and ML technologies'
            },
            'PGDCSA': {
                name: 'Post Graduate Diploma in Computer Science & Applications',
                duration: '5 Years',
                totalSemesters: 10,
                description: 'Intensive computer science diploma program'
            },
            'INTEGRATED_CS': {
                name: 'Integrated Computer Science',
                duration: '5 Years',
                totalSemesters: 10,
                description: 'Comprehensive integrated computer science program'
            }
        };
        
        this.init();
        this.timetableData = {}; // Clear any existing data
        this.clearSession(); // Clear session data
        this.convertTimeFormat();
        console.log('Initialization complete - Starting with empty timetable');
    }

    generateTimetableGrid() {
        const grid = document.getElementById('timetableGrid');
        if (!grid) return;
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Add empty top-left corner
        const corner = document.createElement('div');
        corner.className = 'time-header';
        corner.textContent = 'Time';
        grid.appendChild(corner);
        
        // Add day headers
        this.days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            grid.appendChild(header);
        });
        
        // Generate time slots and cells
        this.timeSlots.forEach((timeSlot, rowIndex) => {
            // Time slot header
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-slot';
            timeDiv.textContent = timeSlot;
            grid.appendChild(timeDiv);
            
            // Day cells
            this.days.forEach((day, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'class-cell';
                cellDiv.dataset.day = day;
                cellDiv.dataset.time = timeSlot;
                
                // Add empty cell indicator (no text)
                const emptyCell = document.createElement('div');
                emptyCell.className = 'empty-cell';
                cellDiv.appendChild(emptyCell);
                
                grid.appendChild(cellDiv);
            });
        });
    }
    
    // Session management methods
    initSession() {
        // Check for existing session
        const savedSession = localStorage.getItem('timetableSession');
        if (savedSession) {
            try {
                const sessionData = JSON.parse(savedSession);
                this.timetableData = sessionData.timetableData || {};
                this.currentStream = sessionData.currentStream || '';
                this.currentSemester = sessionData.currentSemester || '';
                
                // Restore UI state if we have a saved stream
                if (this.currentStream) {
                    const streamSelect = document.getElementById('streamSelect');
                    if (streamSelect) streamSelect.value = this.currentStream;
                    
                    if (this.currentSemester) {
                        const semesterSelect = document.getElementById('semesterSelect');
                        if (semesterSelect) semesterSelect.value = this.currentSemester;
                        this.renderTimetable();
                    }
                }
                
                // Save the session silently to update the timestamp without showing a notification
                this.saveSession(true);
            } catch (e) {
                console.error('Error parsing saved session:', e);
                this.clearSession();
            }
        }
    }
    
    saveSession(silent = true) {
        const sessionData = {
            timetableData: this.timetableData,
            currentStream: this.currentStream,
            currentSemester: this.currentSemester,
            lastUpdated: new Date().toISOString()
        };

        try {
            localStorage.setItem('timetableSession', JSON.stringify(sessionData));
            if (!silent) {
                this.showNotification('Session saved!', 'success');
            }
        } catch (e) {
            console.error('Error saving session:', e);
            if (!silent) {
                this.showNotification('Error saving session', 'error');
            }
        }
    }
    
    clearSession() {
        localStorage.removeItem('timetableSession');
        this.timetableData = {};
        this.currentStream = '';
        this.currentSemester = '';
    }
    
    init() {
        this.bindEvents();
        this.generateTimetableGrid();
        this.initSession(); // Initialize session
        
        // Don't auto-select any stream on page load
        const streamSelect = document.getElementById('streamSelect');
        if (streamSelect) {
            streamSelect.value = ''; // Ensure no stream is selected by default
        }
    }

    bindEvents() {
        // Stream selection
        document.getElementById('streamSelect').addEventListener('change', (e) => {
            this.selectStream(e.target.value);
        });

        // Semester selection
        document.getElementById('semesterSelect').addEventListener('change', (e) => {
            this.selectSemester(e.target.value);
        });

        // Quick actions
        document.getElementById('clearAllBtn')?.addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveToStorage(false); // Show notification for explicit save
        });

        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadFromStorage();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTimetable();
        });

    }

    selectStream(stream) {
        if (!stream) {
            this.currentStream = '';
            this.saveSession();
            return;
            this.hideSemesterSelect();
            return;
        }
        
        this.currentStream = stream;
        this.currentSemester = '';
        this.populateSemesterOptions(stream);
        this.showSemesterSelect();
        this.updateStreamInfo(stream);
        this.updateTimetableHeader(stream);
        this.renderTimetable();
        
        // Initialize stream data if not exists
        if (!this.timetableData[stream]) {
            this.timetableData[stream] = {};
        }
    }

    async selectSemester(semester) {
        if (!semester) {
            this.currentSemester = '';
            this.saveSession();
            return;
        }
        this.currentSemester = semester;
        this.saveSession();
        this.updateTimetableHeader(this.currentStream, semester);
        
        // Disable UI during load
        this.setUILoadingState(true);
        
        try {
            // Load data from database
            const success = await this.loadTimetableFromDatabase();
            if (success) {
                this.renderTimetable();
            }
        } catch (error) {
            console.error('Error in selectSemester:', error);
            this.showNotification('Error loading timetable', 'error');
        } finally {
            // Re-enable UI
            this.setUILoadingState(false);
        }
    }
    
    setUILoadingState(isLoading) {
        const elements = document.querySelectorAll('button, select, .class-cell');
        elements.forEach(el => {
            el.style.pointerEvents = isLoading ? 'none' : '';
            el.style.opacity = isLoading ? '0.7' : '';
        });
    }

    populateSemesterOptions(stream) {
        const semesterSelect = document.getElementById('semesterSelect');
        const streamInfo = this.streamInfo[stream];
        
        // Clear existing options
        semesterSelect.innerHTML = '<option value="">Select Semester</option>';
        
        if (streamInfo) {
            for (let i = 1; i <= streamInfo.totalSemesters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Semester ${i}`;
                semesterSelect.appendChild(option);
            }
        }
    }

    showSemesterSelect() {
        document.getElementById('semesterSelect').style.display = 'inline-block';
    }

    hideSemesterSelect() {
        document.getElementById('semesterSelect').style.display = 'none';
        this.currentSemester = '';
    }

    updateStreamInfo(stream) {
        const streamDetails = document.getElementById('streamDetails');
        const info = this.streamInfo[stream];
        
        if (info) {
            streamDetails.innerHTML = `
                <h4>${info.name}</h4>
                <p><strong>Duration:</strong> ${info.duration}</p>
                <p><strong>Semesters:</strong> ${info.totalSemesters}</p>
                <p><strong>Description:</strong> ${info.description}</p>
            `;
        }
    }

    updateTimetableHeader(stream, semester = '') {
        const header = document.getElementById('currentStream');
        const info = this.streamInfo[stream];
        let headerText = info ? info.name : stream;
        if (semester) {
            headerText += ` - Semester ${semester}`;
        }
        
        if (header) {
            header.textContent = headerText;
        }
    }

    openModal(day = '', time = '') {
        const modal = document.getElementById('classModal');
        document.getElementById('day').value = day;
        document.getElementById('timeSlot').value = time;
        modal.style.display = 'block';
    }
    
    closeModal() {
        const modal = document.getElementById('classModal');
        modal.style.display = 'none';
        document.getElementById('classForm').reset();
    }
    
    saveClass() {
        const classData = {
            subjectName: document.getElementById('subjectName').value,
            facultyName: document.getElementById('facultyName').value,
            classType: document.getElementById('classType').value,
            room: document.getElementById('room').value,
            day: document.getElementById('day').value,
            timeSlot: document.getElementById('timeSlot').value
        };

        // Validate required fields
        if (!Object.values(classData).every(value => value.trim())) {
            alert('Please fill in all fields!');
            return;
        }

        // Validate faculty for AI/ML semesters
        if (this.currentStream === 'MSC_AI_ML' && (this.currentSemester === '1' || this.currentSemester === '3')) {
            if (!this.validateAiMlFaculty(classData.facultyName)) {
                alert('For AI/ML program, please use only faculty members from Semester 1:\n' + 
                      Object.keys(this.aiMlFaculty).join('\n'));
                return;
            }
        }

        // Use semester-specific data key if semester is selected
        const dataKey = this.currentSemester ? `${this.currentStream}_${this.currentSemester}` : this.currentStream;
        
        // Check for conflicts
        const key = `${classData.day}-${classData.timeSlot}`;
        if (this.timetableData[dataKey] && this.timetableData[dataKey][key]) {
            if (!confirm('A class already exists at this time slot. Do you want to replace it?')) {
                return;
            }
        }

        // Initialize data if not exists
        if (!this.timetableData[dataKey]) {
            this.timetableData[dataKey] = {};
        }

        // Save class data
        this.timetableData[dataKey][key] = classData;
        
        this.renderTimetable();
        this.closeModal();
        this.saveToStorage(true); // Save silently since we show our own notification
        this.showNotification('Class added successfully!', 'success');
    }

    renderTimetable() {
        if (!this.currentStream) return;

        // Use semester-specific data key if semester is selected
        const dataKey = this.currentSemester ? `${this.currentStream}_${this.currentSemester}` : this.currentStream;
        const streamData = this.timetableData[dataKey] || {};
        
        // Clear and reset all cells
        document.querySelectorAll('.class-cell').forEach(cell => {
            cell.innerHTML = '';
            // Add empty cell indicator (no text)
            const emptyCell = document.createElement('div');
            emptyCell.className = 'empty-cell';
            cell.appendChild(emptyCell);
        });

        // Populate cells with classes
        Object.keys(streamData).forEach(key => {
            const classData = streamData[key];
            const cell = document.querySelector(`[data-day="${classData.day}"][data-time="${classData.timeSlot}"]`);
            
            if (cell) {
                cell.innerHTML = ''; // Clear the empty cell
                const classItem = this.createClassItem(classData, key);
                cell.appendChild(classItem);
            }
        });
    }

    createClassItem(classData, key) {
        const div = document.createElement('div');
        
        // Determine class type, default to 'lecture' if not specified
        let classType = (classData.classType || 'lecture').toLowerCase();
        
        // Special handling for BREAK entries
        const isBreak = classData.subjectName === 'BREAK' || 
                       (classData.subjectName && classData.subjectName.toLowerCase().includes('break'));
        
        if (isBreak) {
            classType = 'break';
            div.className = 'class-item break';
            div.innerHTML = `
                <div class="subject">BREAK</div>
            `;
        } else {
            // For lab classes, ensure the classType includes 'lab' (case insensitive)
            const isLab = classType.includes('lab') || 
                         (classData.room && classData.room.toLowerCase().includes('lab')) ||
                         (classData.subjectName && classData.subjectName.toLowerCase().includes('lab'));
            
            if (isLab) {
                classType = 'lab';
            }
            
            div.className = `class-item ${classType}`;
            div.innerHTML = `
                <div class="subject">${classData.subjectName || ''}</div>
                ${classData.facultyName ? `<div class="faculty">${classData.facultyName}</div>` : ''}
                ${classData.room ? `<div class="room">${classData.room}</div>` : ''}
            `;
        }
        
        return div;
    }

    editClass(key) {
        const dataKey = this.currentSemester ? `${this.currentStream}_${this.currentSemester}` : this.currentStream;
        const classData = this.timetableData[dataKey][key];
        if (!classData) return;

        // Populate form with existing data
        document.getElementById('subjectName').value = classData.subjectName;
        document.getElementById('facultyName').value = classData.facultyName;
        document.getElementById('classType').value = classData.classType;
        document.getElementById('room').value = classData.room;
        document.getElementById('day').value = classData.day;
        document.getElementById('timeSlot').value = classData.timeSlot;

        document.getElementById('modalTitle').textContent = 'Edit Class';
        
        // Add delete button
        const formActions = document.querySelector('.form-actions');
        let deleteBtn = document.getElementById('deleteBtn');
        if (!deleteBtn) {
            deleteBtn = document.createElement('button');
            deleteBtn.id = 'deleteBtn';
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this class?')) {
                    const dataKey = this.currentSemester ? `${this.currentStream}_${this.currentSemester}` : this.currentStream;
                    delete this.timetableData[dataKey][key];
                    this.renderTimetable();
                    this.closeModal();
                    this.saveToStorage(true); // Save silently since we show our own notification
                    this.saveSession(false); // Show notification for explicit saves
                    this.showNotification('Class deleted successfully!', 'success');
                }
            });
            formActions.insertBefore(deleteBtn, formActions.firstChild);
        }

        document.getElementById('classModal').style.display = 'block';
    }

    clearAll() {
        if (!this.currentStream) {
            alert('Please select a stream first!');
            return;
        }

        const confirmMessage = this.currentSemester ? 
            `Are you sure you want to clear all classes for ${this.currentStream} - Semester ${this.currentSemester}?` :
            `Are you sure you want to clear all classes for this stream?`;
            
        if (confirm(confirmMessage)) {
            const dataKey = this.currentSemester ? `${this.currentStream}_${this.currentSemester}` : this.currentStream;
            this.timetableData[dataKey] = {};
            this.renderTimetable();
            this.saveToStorage(true); // Save silently since we show our own notification
            this.showNotification('All classes cleared!', 'success');
        }
    }

    saveToStorage(silent = false) {
        localStorage.setItem('timetableData', JSON.stringify(this.timetableData));
        if (!silent) {
            this.showNotification('Timetable saved!', 'success');
        }
    }

    loadFromStorage() {
        const saved = localStorage.getItem('timetableData');
        if (saved) {
            this.timetableData = JSON.parse(saved);
            this.renderTimetable();
            // Removed the notification on load to prevent it from showing on page refresh
        }
    }

    exportTimetable() {
        if (!this.currentStream) {
            alert('Please select a stream first!');
            return;
        }

        const streamData = this.timetableData[this.currentStream] || {};
        const streamInfo = this.streamInfo[this.currentStream];
        
        let html = `
            <html>
            <head>
                <title>Timetable - ${streamInfo.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .class-item { background: #e8f4f8; padding: 4px; margin: 2px 0; border-radius: 4px; }
                    .subject { font-weight: bold; }
                    .faculty { font-size: 0.9em; color: #666; }
                    .room { font-size: 0.8em; color: #888; }
                </style>
            </head>
            <body>
                <h1>${streamInfo.name} - Timetable</h1>
                <table>
                    <tr>
                        <th>Time</th>
                        ${this.days.map(day => `<th>${day}</th>`).join('')}
                    </tr>
        `;

        this.timeSlots.forEach(timeSlot => {
            html += `<tr><td><strong>${timeSlot}</strong></td>`;
            this.days.forEach(day => {
                const key = `${day}-${timeSlot}`;
                const classData = streamData[key];
                
                if (classData) {
                    html += `
                        <td>
                            <div class="class-item">
                                <div class="subject">${classData.subjectName}</div>
                                <div class="faculty">${classData.facultyName}</div>
                                <div class="room">${classData.room}</div>
                            </div>
                        </td>
                    `;
                } else {
                    html += '<td>-</td>';
                }
            });
            html += '</tr>';
        });

        html += `
                </table>
                <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentStream}_timetable.html`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Timetable exported!', 'success');
    }

    async initializeSampleData() {
        // Load data from database instead of localStorage
        await this.loadStreamInfo();
        // Initialize MSc AI/ML Semester 1 schedule - force overwrite to show updated data
        const mscAiMlSem1Key = 'MSC_AI_ML_1';
        if (!this.timetableData[mscAiMlSem1Key] || Object.keys(this.timetableData[mscAiMlSem1Key]).length < 25) {
            this.timetableData[mscAiMlSem1Key] = {};
            
            // Add break time for weekdays only (Monday to Friday)
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            days.forEach(day => {
                this.timetableData[mscAiMlSem1Key][`${day}-1:00 PM - 2:00 PM`] = {
                    subjectName: 'Break',
                    facultyName: 'Lunch Break',
                    classType: 'Tutorial',
                    room: 'Cafeteria',
                    day: day,
                    timeSlot: '1:00 PM - 2:00 PM'
                };
            });
            
            // Monday Schedule
            this.timetableData[mscAiMlSem1Key]['Monday-9:00 AM - 11:00 AM'] = {
                subjectName: 'Python (GPU)',
                facultyName: '-',
                classType: 'Lab',
                room: 'GPU Lab',
                day: 'Monday',
                timeSlot: '9:00 AM - 11:00 AM'
            };
            this.timetableData[mscAiMlSem1Key]['Monday-11:00 AM - 12:00 PM'] = {
                subjectName: 'Python',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Monday',
                timeSlot: '11:00 AM - 12:00 PM'
            };
            this.timetableData[mscAiMlSem1Key]['Monday-12:00 PM - 1:00 PM'] = {
                subjectName: 'Artificial Intelligence',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Monday',
                timeSlot: '12:00 PM - 1:00 PM'
            };
            this.timetableData[mscAiMlSem1Key]['Monday-2:00 PM - 3:00 PM'] = {
                subjectName: 'Mathematical Foundation',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Monday',
                timeSlot: '2:00 PM - 3:00 PM'
            };
            this.timetableData[mscAiMlSem1Key]['Monday-3:00 PM - 4:00 PM'] = {
                subjectName: 'OOCP',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Monday',
                timeSlot: '3:00 PM - 4:00 PM'
            };

            // Tuesday Schedule
            this.timetableData[mscAiMlSem1Key]['Tuesday-09:00-11:00'] = {
                subjectName: 'Python (GPU)',
                facultyName: '-',
                classType: 'Lab',
                room: 'GPU Lab',
                day: 'Tuesday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem1Key]['Tuesday-11:00-12:00'] = {
                subjectName: 'Mathematical Foundation',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Tuesday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem1Key]['Tuesday-12:00-13:00'] = {
                subjectName: 'Linear Algebra & Numerical Methods',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Tuesday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem1Key]['Tuesday-14:00-15:00'] = {
                subjectName: 'Python',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Tuesday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem1Key]['Tuesday-15:00-16:00'] = {
                subjectName: 'Artificial Intelligence',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Tuesday',
                timeSlot: '15:00-16:00'
            };

            // Wednesday Schedule
            this.timetableData[mscAiMlSem1Key]['Wednesday-09:00-11:00'] = {
                subjectName: 'OOCP',
                facultyName: '-',
                classType: 'Lab',
                room: 'GPU Lab',
                day: 'Wednesday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem1Key]['Wednesday-11:00-12:00'] = {
                subjectName: 'Python',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Wednesday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem1Key]['Wednesday-12:00-13:00'] = {
                subjectName: 'Linear Algebra & Numerical Methods',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Wednesday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem1Key]['Wednesday-14:00-15:00'] = {
                subjectName: 'OOCP',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Wednesday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem1Key]['Wednesday-15:00-16:00'] = {
                subjectName: 'Artificial Intelligence',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Wednesday',
                timeSlot: '15:00-16:00'
            };

            // Thursday Schedule
            this.timetableData[mscAiMlSem1Key]['Thursday-09:00-11:00'] = {
                subjectName: 'OOCP',
                facultyName: '-',
                classType: 'Lab',
                room: 'GPU Lab',
                day: 'Thursday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem1Key]['Thursday-11:00-12:00'] = {
                subjectName: 'Mathematical Foundation',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Thursday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem1Key]['Thursday-12:00-13:00'] = {
                subjectName: 'Linear Algebra & Numerical Methods',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Thursday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem1Key]['Thursday-14:00-15:00'] = {
                subjectName: 'OOCP',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Thursday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem1Key]['Thursday-15:00-16:00'] = {
                subjectName: 'Artificial Intelligence',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Thursday',
                timeSlot: '15:00-16:00'
            };

            // Friday Schedule
            this.timetableData[mscAiMlSem1Key]['Friday-09:00-11:00'] = {
                subjectName: 'Project',
                facultyName: '-',
                classType: 'Lab',
                room: 'GPU Lab',
                day: 'Friday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem1Key]['Friday-11:00-12:00'] = {
                subjectName: 'Python',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Friday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem1Key]['Friday-12:00-13:00'] = {
                subjectName: 'Linear Algebra & Numerical Methods',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Friday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem1Key]['Friday-14:00-15:00'] = {
                subjectName: 'OOCP',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Friday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem1Key]['Friday-15:00-16:00'] = {
                subjectName: 'Mathematical Foundation',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 4',
                day: 'Friday',
                timeSlot: '15:00-16:00'
            };
            
            this.saveToStorage(true); // Save silently during initialization
        }

        // Initialize MSc AI/ML Semester 3 schedule
        const mscAiMlSem3Key = 'MSC_AI_ML_3';
        if (!this.timetableData[mscAiMlSem3Key]) {
            this.timetableData[mscAiMlSem3Key] = {};
            
            // Add break time for weekdays only (Monday to Friday)
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            days.forEach(day => {
                this.timetableData[mscAiMlSem3Key][`${day}-13:00-14:00`] = {
                    subjectName: 'Break',
                    facultyName: 'Lunch Break',
                    classType: 'Tutorial',
                    room: 'Cafeteria',
                    day: day,
                    timeSlot: '13:00-14:00'
                };
            });
            
            // Monday Schedule - Semester 3 Advanced Subjects (Using only Sem 1 faculty)
            this.timetableData[mscAiMlSem3Key]['Monday-09:00-11:00'] = {
                subjectName: 'Deep Learning',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lab',
                room: 'AI Lab 1',
                day: 'Monday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem3Key]['Monday-11:00-12:00'] = {
                subjectName: 'Computer Vision',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 5',
                day: 'Monday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem3Key]['Monday-12:00-13:00'] = {
                subjectName: 'Natural Language Processing',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 5',
                day: 'Monday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem3Key]['Monday-14:00-15:00'] = {
                subjectName: 'Machine Learning Algorithms',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 5',
                day: 'Monday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem3Key]['Monday-15:00-16:00'] = {
                subjectName: 'Data Mining',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 5',
                day: 'Monday',
                timeSlot: '15:00-16:00'
            };

            // Tuesday Schedule
            this.timetableData[mscAiMlSem3Key]['Tuesday-09:00-11:00'] = {
                subjectName: 'Computer Vision',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lab',
                room: 'Vision Lab',
                day: 'Tuesday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem3Key]['Tuesday-11:00-12:00'] = {
                subjectName: 'Deep Learning',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 6',
                day: 'Tuesday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem3Key]['Tuesday-12:00-13:00'] = {
                subjectName: 'Big Data Analytics',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 6',
                day: 'Tuesday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem3Key]['Tuesday-14:00-15:00'] = {
                subjectName: 'Natural Language Processing',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 6',
                day: 'Tuesday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem3Key]['Tuesday-15:00-16:00'] = {
                subjectName: 'Machine Learning Algorithms',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 6',
                day: 'Tuesday',
                timeSlot: '15:00-16:00'
            };

            // Wednesday Schedule
            this.timetableData[mscAiMlSem3Key]['Wednesday-09:00-11:00'] = {
                subjectName: 'Natural Language Processing',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lab',
                room: 'NLP Lab',
                day: 'Wednesday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem3Key]['Wednesday-11:00-12:00'] = {
                subjectName: 'Data Mining',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 7',
                day: 'Wednesday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem3Key]['Wednesday-12:00-13:00'] = {
                subjectName: 'Computer Vision',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 7',
                day: 'Wednesday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem3Key]['Wednesday-14:00-15:00'] = {
                subjectName: 'Deep Learning',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 7',
                day: 'Wednesday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem3Key]['Wednesday-15:00-16:00'] = {
                subjectName: 'Big Data Analytics',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 7',
                day: 'Wednesday',
                timeSlot: '15:00-16:00'
            };

            // Thursday Schedule
            this.timetableData[mscAiMlSem3Key]['Thursday-09:00-11:00'] = {
                subjectName: 'Machine Learning Algorithms',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lab',
                room: 'ML Lab',
                day: 'Thursday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem3Key]['Thursday-11:00-12:00'] = {
                subjectName: 'Big Data Analytics',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 8',
                day: 'Thursday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem3Key]['Thursday-12:00-13:00'] = {
                subjectName: 'Data Mining',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 8',
                day: 'Thursday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem3Key]['Thursday-14:00-15:00'] = {
                subjectName: 'Computer Vision',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 8',
                day: 'Thursday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem3Key]['Thursday-15:00-16:00'] = {
                subjectName: 'Natural Language Processing',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lecture',
                room: 'Classroom 8',
                day: 'Thursday',
                timeSlot: '15:00-16:00'
            };

            // Friday Schedule
            this.timetableData[mscAiMlSem3Key]['Friday-09:00-11:00'] = {
                subjectName: 'Research Project',
                facultyName: 'Dr. Suchit Purohit',
                classType: 'Lab',
                room: 'Research Lab',
                day: 'Friday',
                timeSlot: '09:00-11:00'
            };
            this.timetableData[mscAiMlSem3Key]['Friday-11:00-12:00'] = {
                subjectName: 'Deep Learning',
                facultyName: 'Ms. Anju Jha',
                classType: 'Lecture',
                room: 'Classroom 9',
                day: 'Friday',
                timeSlot: '11:00-12:00'
            };
            this.timetableData[mscAiMlSem3Key]['Friday-12:00-13:00'] = {
                subjectName: 'Machine Learning Algorithms',
                facultyName: 'Mr. Vishal Prajapati',
                classType: 'Lecture',
                room: 'Classroom 9',
                day: 'Friday',
                timeSlot: '12:00-13:00'
            };
            this.timetableData[mscAiMlSem3Key]['Friday-14:00-15:00'] = {
                subjectName: 'Data Mining',
                facultyName: 'Dr. Jigna Satani',
                classType: 'Lecture',
                room: 'Classroom 9',
                day: 'Friday',
                timeSlot: '14:00-15:00'
            };
            this.timetableData[mscAiMlSem3Key]['Friday-15:00-16:00'] = {
                subjectName: 'Big Data Analytics',
                facultyName: 'Ms.Arpana Sonawane',
                classType: 'Lecture',
                room: 'Classroom 9',
                day: 'Friday',
                timeSlot: '15:00-16:00'
            };
            
            this.saveToStorage(true); // Save silently during initialization
        }
    }

    clearOldData() {
        // Clear old MSc AI/ML data to force refresh with new schedule
        if (this.timetableData['MSC_AI_ML']) {
            delete this.timetableData['MSC_AI_ML'];
        }
        // Clear semester-specific data to force refresh
        if (this.timetableData['MSC_AI_ML_1']) {
            delete this.timetableData['MSC_AI_ML_1'];
        }
        if (this.timetableData['MSC_AI_ML_3']) {
            delete this.timetableData['MSC_AI_ML_3'];
        }
    }

    convertTimeFormat() {
        // Mapping from 24-hour to 12-hour format
        const timeMapping = {
            '09:00-11:00': '9:00 AM - 11:00 AM',
            '11:00-12:00': '11:00 AM - 12:00 PM',
            '12:00-13:00': '12:00 PM - 1:00 PM',
            '13:00-14:00': '1:00 PM - 2:00 PM',
            '14:00-15:00': '2:00 PM - 3:00 PM',
            '15:00-16:00': '3:00 PM - 4:00 PM',
            '16:00-17:00': '4:00 PM - 5:00 PM'
        };

        // Convert existing timetable data
        Object.keys(this.timetableData).forEach(streamKey => {
            const streamData = this.timetableData[streamKey];
            const newStreamData = {};
            
            Object.keys(streamData).forEach(key => {
                const classData = streamData[key];
                let newKey = key;
                let newTimeSlot = classData.timeSlot;
                
                // Convert key and timeSlot if they use old format
                Object.keys(timeMapping).forEach(oldTime => {
                    if (key.includes(oldTime)) {
                        newKey = key.replace(oldTime, timeMapping[oldTime]);
                    }
                    if (classData.timeSlot === oldTime) {
                        newTimeSlot = timeMapping[oldTime];
                    }
                });
                
                newStreamData[newKey] = {
                    ...classData,
                    timeSlot: newTimeSlot
                };
            });
            
            this.timetableData[streamKey] = newStreamData;
        });
    }

    setupFacultyValidation() {
        const facultyInput = document.getElementById('facultyName');
        
        // Add datalist for AI/ML faculty suggestions
        if (this.currentStream === 'MSC_AI_ML' && (this.currentSemester === '1' || this.currentSemester === '3')) {
            let datalist = document.getElementById('aiMlFacultyList');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'aiMlFacultyList';
                facultyInput.parentNode.appendChild(datalist);
            }
            
            // Clear and populate datalist
            datalist.innerHTML = '';
            Object.keys(this.aiMlFaculty).forEach(faculty => {
                const option = document.createElement('option');
                option.value = faculty;
                datalist.appendChild(option);
            });
            
            facultyInput.setAttribute('list', 'aiMlFacultyList');
            facultyInput.setAttribute('placeholder', 'Select from AI/ML Semester 1 faculty');
        } else {
            facultyInput.removeAttribute('list');
            facultyInput.setAttribute('placeholder', 'Enter faculty name');
        }
    }

    validateAiMlFaculty(facultyName) {
        return Object.keys(this.aiMlFaculty).includes(facultyName);
    }

    async loadStreamInfo() {
        try {
            const response = await fetch('/timetable/api/streams/');
            const streamData = await response.json();
            this.streamInfo = streamData;
        } catch (error) {
            console.error('Error loading stream info:', error);
        }
    }

    async loadTimetableFromDatabase() {
        if (!this.currentStream || !this.currentSemester) return;
        
        const streamKey = `${this.currentStream}_${this.currentSemester}`;
        
        // Show loading state
        const loadingId = `loading-${Date.now()}`;
        this.showNotification('Loading timetable data...', 'info', loadingId);
        
        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`/timetable/api/timetable/?stream=${this.currentStream}&semester=${this.currentSemester}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.timetableData[streamKey] = data;
            
            // Remove loading notification
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();
            
            return true;
        } catch (error) {
            console.error('Error loading timetable:', error);
            
            // Remove loading notification
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();
            
            if (error.name === 'AbortError') {
                this.showNotification('Request timed out. Please try again.', 'error');
            } else {
                this.showNotification('Error loading timetable data', 'error');
            }
            return false;
        }
    }

    showNotification(message, type = 'info', id = '') {
        // Create notification element
        const notification = document.createElement('div');
        if (id) notification.id = id;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#4299e1'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            pointer-events: none;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TimetableManager();
});
