// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9qY9I0RmUkvbEEi46-8KFHgKHqAjuCo0",
    authDomain: "trackmyapps-ba65a.firebaseapp.com",
    projectId: "trackmyapps-ba65a",
    storageBucket: "trackmyapps-ba65a.firebasestorage.app",
    messagingSenderId: "910368309133",
    appId: "1:910368309133:web:0535a991a01c33e5de47c4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Get DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authForms = document.getElementById('authForms');
const appContent = document.getElementById('appContent');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const jobForm = document.getElementById('jobForm');
const coverLettersContainer = document.getElementById('coverLettersContainer');

// Get application ID from URL
const urlParams = new URLSearchParams(window.location.search);
const applicationId = urlParams.get('id');

// Store application data globally
let currentApplication = null;

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authForms.style.display = 'none';
        appContent.style.display = 'block';
        userEmail.textContent = user.email;
        loadApplication();
    } else {
        // User is signed out
        authForms.style.display = 'grid';
        appContent.style.display = 'none';
    }
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginForm.reset();
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
});

// Register form handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        registerForm.reset();
    } catch (error) {
        alert('Error registering: ' + error.message);
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
});

// Function to load application data
async function loadApplication() {
    if (!applicationId) {
        alert('No application ID provided');
        window.location.href = 'index.html';
        return;
    }

    try {
        const doc = await db.collection('applications').doc(applicationId).get();
        if (!doc.exists) {
            alert('Application not found');
            window.location.href = 'index.html';
            return;
        }

        currentApplication = { id: doc.id, ...doc.data() };
        
        // Populate the form with existing data
        document.getElementById('jobTitle').value = currentApplication.jobTitle;
        document.getElementById('companyName').value = currentApplication.companyName;
        document.getElementById('status').value = currentApplication.status;
        document.getElementById('deadline').value = currentApplication.deadline;
        document.getElementById('notes').value = currentApplication.notes || '';
        
        // Clear existing cover letter inputs
        coverLettersContainer.innerHTML = '';
        
        // Add existing cover letters
        if (currentApplication.coverLetters && currentApplication.coverLetters.length > 0) {
            currentApplication.coverLetters.forEach(letter => {
                const div = document.createElement('div');
                div.className = 'document-upload';
                div.innerHTML = `
                    <input type="file" class="cover-letter-input" accept=".pdf,.doc,.docx">
                    <p class="existing-file">Current: ${letter.name}</p>
                    <button type="button" class="btn-secondary" onclick="this.parentElement.remove()">Remove</button>
                `;
                coverLettersContainer.appendChild(div);
            });
        }
        
        // Add a new cover letter input
        addCoverLetterInput();
    } catch (error) {
        console.error('Error loading application:', error);
        alert('Error loading application: ' + error.message);
        window.location.href = 'index.html';
    }
}

// Function to add cover letter input
function addCoverLetterInput() {
    const div = document.createElement('div');
    div.className = 'document-upload';
    div.innerHTML = `
        <input type="file" class="cover-letter-input" accept=".pdf,.doc,.docx">
        <button type="button" class="btn-secondary" onclick="this.parentElement.remove()">Remove</button>
    `;
    coverLettersContainer.appendChild(div);
}

// Function to convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Function to handle cover letter upload
async function processCoverLetter(file) {
    if (!file) return null;
    
    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
        throw new Error('File size must be less than 1MB');
    }
    
    try {
        const base64Data = await fileToBase64(file);
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data,
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error processing cover letter:', error);
        throw error;
    }
}

// Job form submission handler
jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = jobForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Get form values
        const jobTitle = document.getElementById('jobTitle').value;
        const companyName = document.getElementById('companyName').value;
        const status = document.getElementById('status').value;
        const deadline = document.getElementById('deadline').value;
        const notes = document.getElementById('notes').value;
        
        // Process cover letters
        const coverLetterInputs = document.querySelectorAll('.cover-letter-input');
        const coverLetters = [];
        
        for (const input of coverLetterInputs) {
            if (input.files.length > 0) {
                try {
                    const coverLetter = await processCoverLetter(input.files[0]);
                    if (coverLetter) {
                        coverLetters.push(coverLetter);
                    }
                } catch (error) {
                    console.error('Error with cover letter:', error);
                    alert(`Error processing cover letter ${input.files[0].name}: ${error.message}`);
                }
            }
        }
        
        // Get application ID from URL if editing
        const urlParams = new URLSearchParams(window.location.search);
        const applicationId = urlParams.get('id');
        
        const applicationData = {
            jobTitle,
            companyName,
            status,
            deadline,
            notes,
            coverLetters,
            userId: auth.currentUser.uid,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (applicationId) {
            // Update existing application
            await db.collection('applications').doc(applicationId).update(applicationData);
            console.log('Application updated successfully');
        } else {
            // Add new application
            applicationData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('applications').add(applicationData);
            console.log('Application added successfully with ID:', docRef.id);
        }
        
        // Redirect to home page
        window.location.href = '/';
    } catch (error) {
        console.error('Error saving application:', error);
        alert('Error saving application: ' + error.message);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}); 