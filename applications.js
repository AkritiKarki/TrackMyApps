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

// Get DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authForms = document.getElementById('authForms');
const appContent = document.getElementById('appContent');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const jobForm = document.getElementById('jobForm');
const applicationForm = document.getElementById('applicationForm');
const addApplicationBtn = document.getElementById('addApplicationBtn');
const applicationsList = document.getElementById('applicationsList');

// Check URL parameters for form display
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('action') === 'new') {
    applicationForm.style.display = 'block';
}

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authForms.style.display = 'none';
        appContent.style.display = 'block';
        userEmail.textContent = user.email;
        loadApplications();
    } else {
        // User is signed out
        authForms.style.display = 'grid';
        appContent.style.display = 'none';
        applicationsList.innerHTML = '<div class="no-applications"><p>No applications yet</p></div>';
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
    } catch (error) {
        alert('Error logging out: ' + error.message);
    }
});

// Toggle application form
addApplicationBtn.addEventListener('click', () => {
    applicationForm.style.display = applicationForm.style.display === 'none' ? 'block' : 'none';
});

// Function to create an application card
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.innerHTML = `
        <h3>${application.jobTitle}</h3>
        <p>${application.companyName}</p>
        <span class="status-badge status-${application.status}">${application.status}</span>
        <p>Deadline: ${new Date(application.deadline).toLocaleDateString()}</p>
        <button onclick="deleteApplication('${application.id}')" class="delete-btn">Delete</button>
    `;
    return card;
}

// Function to load applications from Firestore
async function loadApplications() {
    try {
        const snapshot = await db.collection('applications')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            applicationsList.innerHTML = '<div class="no-applications"><p>No applications yet</p></div>';
            return;
        }

        applicationsList.innerHTML = '';
        snapshot.forEach(doc => {
            const application = { id: doc.id, ...doc.data() };
            applicationsList.appendChild(createApplicationCard(application));
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        alert('Error loading applications');
    }
}

// Function to delete an application
async function deleteApplication(id) {
    try {
        await db.collection('applications').doc(id).delete();
        loadApplications();
    } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application');
    }
}

// Handle form submission
jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jobTitle = document.getElementById('jobTitle').value;
    const companyName = document.getElementById('companyName').value;
    const status = document.getElementById('status').value;
    const deadline = document.getElementById('deadline').value;
    
    try {
        await db.collection('applications').add({
            jobTitle,
            companyName,
            status,
            deadline,
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        jobForm.reset();
        applicationForm.style.display = 'none';
        loadApplications();
    } catch (error) {
        console.error('Error adding application:', error);
        alert('Error adding application');
    }
}); 