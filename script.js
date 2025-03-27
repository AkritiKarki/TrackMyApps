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
const jobForm = document.getElementById('jobForm');
const applicationsList = document.getElementById('applicationsList');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authForms = document.getElementById('authForms');
const appContent = document.getElementById('appContent');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

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
        applicationsList.innerHTML = '';
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

// Function to create an application card
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.innerHTML = `
        <h3>${application.jobTitle}</h3>
        <p>${application.companyName}</p>
        <span class="status-badge status-${application.status}">${application.status}</span>
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
    
    try {
        await db.collection('applications').add({
            jobTitle,
            companyName,
            status,
            userId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        jobForm.reset();
        loadApplications();
    } catch (error) {
        console.error('Error adding application:', error);
        alert('Error adding application');
    }
});

// Initial render
loadApplications(); 