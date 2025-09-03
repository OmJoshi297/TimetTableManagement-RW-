# College Timetable Management System

A comprehensive web-based timetable management system for college streams including MCA, MSc AI/ML, PGDCSA, and Integrated CS.

## Features

### 🎯 Core Functionality
- **Multi-Stream Support**: Manage timetables for different academic streams
- **Interactive Grid**: Click-to-add classes with intuitive time slot selection
- **CRUD Operations**: Create, Read, Update, and Delete class entries
- **Real-time Updates**: Instant visual feedback for all operations

### 📱 User Interface
- **Modern Design**: Clean, gradient-based UI with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Color-coded Classes**: Different colors for Lectures, Labs, Tutorials, and Seminars
- **Modal Forms**: User-friendly popup forms for adding/editing classes

### 💾 Data Management
- **Local Storage**: Automatic saving and loading of timetable data
- **Export Functionality**: Generate HTML reports of timetables
- **Conflict Detection**: Warns when scheduling overlapping classes
- **Bulk Operations**: Clear all classes for a stream with confirmation

### 🎨 Visual Features
- **Smooth Animations**: Hover effects and transitions throughout
- **Notification System**: Toast notifications for user actions
- **Stream Information**: Detailed information panel for each academic stream
- **Professional Styling**: Modern card-based layout with backdrop blur effects

## Supported Streams

1. **MCA** - Master of Computer Applications (2 Years, 4 Semesters)
2. **MSc AI/ML** - MSc Artificial Intelligence & Machine Learning (2 Years, 4 Semesters)
3. **PGDCSA** - Post Graduate Diploma in Computer Science & Applications (1 Year, 2 Semesters)
4. **Integrated CS** - Integrated Computer Science (5 Years, 10 Semesters)

## Usage Instructions

### Getting Started
1. Open `timetable.html` in your web browser
2. Select a stream from the dropdown menu
3. Click on any time slot to add a new class
4. Fill in the class details and save

### Adding Classes
- Click "Add Class" button or click on an empty time slot
- Fill in required fields:
  - Subject Name
  - Faculty Name
  - Class Type (Lecture/Lab/Tutorial/Seminar)
  - Room/Venue
  - Day and Time Slot

### Managing Classes
- **Edit**: Click on any existing class to modify details
- **Delete**: Use the delete button when editing a class
- **Clear All**: Remove all classes for the current stream

### Data Persistence
- **Auto-save**: Changes are automatically saved to browser storage
- **Manual Save**: Use "Save Timetable" button for explicit saving
- **Load**: Restore previously saved timetables
- **Export**: Download timetable as HTML file for printing

## Technical Details

### File Structure
```
├── timetable.html    # Main HTML structure
├── timetable.css     # Styling and animations
├── timetable.js      # Core functionality
└── README.md         # Documentation
```

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers supported

### Dependencies
- Font Awesome 6.0.0 (CDN)
- No additional frameworks required

## Customization

### Adding New Streams
Edit the `streamInfo` object in `timetable.js`:
```javascript
'NEW_STREAM': {
    name: 'Stream Display Name',
    duration: 'X Years',
    totalSemesters: X,
    description: 'Stream description'
}
```

### Modifying Time Slots
Update the `timeSlots` array in `timetable.js`:
```javascript
this.timeSlots = ['09:00-10:00', '10:00-11:00', ...];
```

### Styling Customization
- Modify CSS variables for colors and spacing
- Update gradient backgrounds in `timetable.css`
- Customize class type colors in `.class-item` styles

## Future Enhancements

- Database integration for multi-user support
- PDF export functionality
- Calendar integration
- Email notifications for schedule changes
- Semester-wise timetable management
- Faculty availability tracking

---

**Developed for College Timetable Management**  
*Modern, Responsive, and User-Friendly*
