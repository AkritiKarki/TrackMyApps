// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9qY9I0RmUkvbEEi46-8KFHgKHqAjuCo0",
    authDomain: "trackmyapps-ba65a.firebaseapp.com",
    projectId: "trackmyapps-ba65a",
    storageBucket: "trackmyapps-ba65a.appspot.com",
    messagingSenderId: "910368309133",
    appId: "1:910368309133:web:0535a991a01c33e5de47c4"
};

// Initialize Firebase with special settings for local development
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable local persistence for Firestore
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Configure Storage settings for local development
const storageRef = storage.ref();

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
const allApplicationsList = document.getElementById('allApplicationsList');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Document Management Elements
const uploadDocumentBtn = document.getElementById('uploadDocumentBtn');
const uploadDocumentForm = document.getElementById('uploadDocumentForm');
const documentForm = document.getElementById('documentForm');
const documentPreviewModal = document.getElementById('documentPreviewModal');
const closeModalBtn = document.querySelector('.close-modal');
const coverLettersContainer = document.getElementById('coverLettersContainer');

// Tab Navigation
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
    });
});

// Show/Hide Application Form
function showApplicationForm() {
    applicationForm.style.display = 'block';
}

function hideApplicationForm() {
    applicationForm.style.display = 'none';
    jobForm.reset();
}

// Show/Hide Upload Document Form
function showUploadForm() {
    uploadDocumentForm.style.display = 'block';
    // Scroll to the form
    uploadDocumentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus on the first input
    document.getElementById('documentType').focus();
}

function hideUploadForm() {
    uploadDocumentForm.style.display = 'none';
    documentForm.reset();
}

// Show/Hide Document Preview Modal
function showDocumentPreview(url) {
    const preview = document.getElementById('documentPreview');
    preview.innerHTML = `<iframe src="${url}" style="width: 100%; height: 80vh; border: none;"></iframe>`;
    documentPreviewModal.style.display = 'block';
}

function hideDocumentPreview() {
    documentPreviewModal.style.display = 'none';
}

// Add Cover Letter Input
function addCoverLetterInput() {
    const div = document.createElement('div');
    div.className = 'document-upload';
    div.innerHTML = `
        <input type="file" class="cover-letter-input" accept=".pdf,.doc,.docx">
        <button type="button" class="btn-secondary" onclick="this.parentElement.remove()">Remove</button>
    `;
    coverLettersContainer.appendChild(div);
}

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authForms.style.display = 'none';
        appContent.style.display = 'block';
        userEmail.textContent = user.email;
        loadApplications();
        loadDocuments();
    } else {
        // User is signed out
        authForms.style.display = 'grid';
        appContent.style.display = 'none';
        allApplicationsList.innerHTML = '<div class="no-applications"><p>No applications yet</p></div>';
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
    card.setAttribute('data-application-id', application.id);
    const deadline = new Date(application.deadline);
    const isPast = deadline < new Date();
    
    let notesHtml = '';
    if (application.notes) {
        notesHtml = `<p class="notes">${application.notes}</p>`;
    }

    let coverLettersHtml = '';
    if (application.coverLetters && application.coverLetters.length > 0) {
        coverLettersHtml = `
            <div class="cover-letters">
                <p>Cover Letters:</p>
                <ul>
                    ${application.coverLetters.map(letter => `
                        <li>
                            <button onclick="viewCoverLetter('${application.id}', '${letter.name}')" class="link-button">
                                ${letter.name}
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    card.innerHTML = `
        <h3>${application.jobTitle}</h3>
        <p>${application.companyName}</p>
        <span class="status-badge status-${application.status}">${application.status}</span>
        <p class="deadline ${isPast ? 'past' : ''}">Deadline: ${deadline.toLocaleDateString()}</p>
        ${notesHtml}
        ${coverLettersHtml}
        <div class="card-actions">
            <a href="application.html?id=${application.id}" class="edit-btn">Edit</a>
            <button onclick="deleteApplication('${application.id}')" class="delete-btn">Remove Application</button>
        </div>
    `;
    return card;
}

// Function to load applications from Firestore
async function loadApplications() {
    try {
        console.log('Loading applications for user:', auth.currentUser.uid);
        const snapshot = await db.collection('applications')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        console.log('Found applications:', snapshot.size);

        // Get the applications list element
        const allApplicationsList = document.getElementById('allApplicationsList');
        if (!allApplicationsList) {
            console.error('Applications list element not found');
            return;
        }

        if (snapshot.empty) {
            allApplicationsList.innerHTML = '<div class="no-applications"><p>No applications yet</p></div>';
            return;
        }

        // Clear list
        allApplicationsList.innerHTML = '';

        // Add applications to list
        snapshot.forEach(doc => {
            const application = { id: doc.id, ...doc.data() };
            console.log('Adding application:', application);
            const card = createApplicationCard(application);
            allApplicationsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        alert('Error loading applications: ' + error.message);
    }
}

// Function to delete an application
async function deleteApplication(id) {
    try {
        // Get the application data before deleting
        const doc = await db.collection('applications').doc(id).get();
        if (!doc.exists) {
            throw new Error('Application not found');
        }
        const application = doc.data();
        
        // Delete the application
        await db.collection('applications').doc(id).delete();
        
        // Create and show undo notification
        const undoNotification = document.createElement('div');
        undoNotification.className = 'undo-notification';
        undoNotification.innerHTML = `
            <p>Application removed</p>
            <button onclick="undoDelete('${id}', ${JSON.stringify(application)})" class="undo-btn">Undo</button>
        `;
        document.body.appendChild(undoNotification);
        
        // Remove the undo notification after 5 seconds
        setTimeout(() => {
            undoNotification.remove();
        }, 5000);
        
        // Reload applications
        loadApplications();
    } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application: ' + error.message);
    }
}

// Function to undo application deletion
async function undoDelete(id, application) {
    try {
        // Remove the undo notification
        const notification = document.querySelector('.undo-notification');
        if (notification) {
            notification.remove();
        }
        
        // Restore the application
        await db.collection('applications').doc(id).set({
            ...application,
            restoredAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Reload applications
        loadApplications();
    } catch (error) {
        console.error('Error restoring application:', error);
        alert('Error restoring application: ' + error.message);
    }
}

// Function to load documents from Firestore
async function loadDocuments() {
    try {
        console.log('Loading documents for user:', auth.currentUser.uid);
        
        // Clear all document lists
        const resumeList = document.getElementById('resumeList');
        const portfolioList = document.getElementById('portfolioList');
        const coverLetterList = document.getElementById('coverLetterList');

        if (!resumeList || !portfolioList || !coverLetterList) {
            console.error('Document list elements not found');
            return;
        }

        // Reset lists to default state
        resumeList.innerHTML = '<div class="no-documents"><p>No resume uploaded</p></div>';
        portfolioList.innerHTML = '<div class="no-documents"><p>No portfolio items uploaded</p></div>';
        coverLetterList.innerHTML = '<div class="no-documents"><p>No cover letters uploaded</p></div>';

        // Group documents by type
        const documents = {
            resume: [],
            portfolio: [],
            coverLetter: []
        };

        // Load standalone documents from documents collection
        try {
            // First, get all documents without sorting
            const docsQuery = db.collection('documents')
                .where('userId', '==', auth.currentUser.uid);
            
            const docsSnapshot = await docsQuery.get();
            console.log('Found standalone documents:', docsSnapshot.size);

            // Process documents and sort them in memory
            const allDocs = [];
            docsSnapshot.forEach(doc => {
                allDocs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort documents by createdAt timestamp (if it exists)
            allDocs.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.seconds : 0;
                const timeB = b.createdAt ? b.createdAt.seconds : 0;
                return timeB - timeA; // Descending order (newest first)
            });

            // Add sorted documents to their respective types
            allDocs.forEach(doc => {
                if (doc.type && documents[doc.type]) {
                    documents[doc.type].push({
                        ...doc,
                        isStandalone: true
                    });
                }
            });
        } catch (error) {
            console.error('Error loading standalone documents:', error);
        }

        // Load cover letters from applications
        try {
            const appsSnapshot = await db.collection('applications')
                .where('userId', '==', auth.currentUser.uid)
                .get();

            appsSnapshot.forEach(doc => {
                const application = doc.data();
                if (application.coverLetters && application.coverLetters.length > 0) {
                    application.coverLetters.forEach(letter => {
                        documents.coverLetter.push({
                            id: doc.id,
                            type: 'coverLetter',
                            title: `${letter.name} (${application.companyName})`,
                            description: `Cover letter for ${application.jobTitle} at ${application.companyName}`,
                            fileName: letter.name,
                            fileType: letter.type,
                            fileData: letter.data,
                            isStandalone: false,
                            applicationId: doc.id
                        });
                    });
                }
            });
        } catch (error) {
            console.error('Error loading application documents:', error);
        }

        // Update each document list
        if (documents.resume.length > 0) {
            resumeList.innerHTML = '';
            documents.resume.forEach(doc => {
                resumeList.appendChild(createDocumentItem(doc));
            });
        }

        if (documents.portfolio.length > 0) {
            portfolioList.innerHTML = '';
            documents.portfolio.forEach(doc => {
                portfolioList.appendChild(createDocumentItem(doc));
            });
        }

        if (documents.coverLetter.length > 0) {
            coverLetterList.innerHTML = '';
            documents.coverLetter.forEach(doc => {
                coverLetterList.appendChild(createDocumentItem(doc));
            });
        }

        console.log('Document counts:', {
            resume: documents.resume.length,
            portfolio: documents.portfolio.length,
            coverLetter: documents.coverLetter.length
        });
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Function to create a document item
function createDocumentItem(doc) {
    const item = document.createElement('div');
    item.className = 'document-item';
    
    item.innerHTML = `
        <div class="document-info">
            <h4>${doc.title || doc.fileName}</h4>
            ${doc.description ? `<p>${doc.description}</p>` : ''}
            <p class="file-info">Type: ${doc.fileType || 'Document'}</p>
        </div>
        <div class="document-actions">
            ${doc.isStandalone ? 
                `<button onclick="viewDocument('${doc.id}')" class="document-btn">View</button>
                 <button onclick="deleteDocument('${doc.id}')" class="document-btn delete">Delete</button>` :
                `<button onclick="viewCoverLetter('${doc.applicationId}', '${doc.fileName}')" class="document-btn">View</button>`
            }
        </div>
    `;
    
    return item;
}

// Function to view a document
async function viewDocument(docId) {
    try {
        const doc = await db.collection('documents').doc(docId).get();
        if (!doc.exists) {
            alert('Document not found');
            return;
        }
        
        const data = doc.data();
        
        // For PDFs, create a blob and open in new tab
        if (data.fileType === 'application/pdf') {
            // Convert Base64 to Blob
            const byteCharacters = atob(data.fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // Create object URL and open in new tab
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            
            // Clean up the object URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } else {
            // For other files, trigger download
            const link = document.createElement('a');
            link.href = data.fileData;
            link.download = data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Error viewing document:', error);
        alert('Error viewing document: ' + error.message);
    }
}

// Function to delete a document
async function deleteDocument(id) {
    try {
        const doc = await db.collection('documents').doc(id).get();
        if (doc.exists) {
            // Delete from Firestore
            await db.collection('documents').doc(id).delete();
            
            // Reload documents
            loadDocuments();
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document: ' + error.message);
    }
}

// Function to handle cover letter uploads
async function uploadCoverLetter(file) {
    try {
        // Check file size
        if (file.size > 1024 * 1024) {
            throw new Error('File size must be less than 1MB');
        }
        
        // Convert to Base64
        const base64String = await fileToBase64(file);
        
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64String
        };
    } catch (error) {
        console.error('Error uploading cover letter:', error);
        throw error;
    }
}

// Function to view a cover letter
async function viewCoverLetter(applicationId, fileName) {
    try {
        const doc = await db.collection('applications').doc(applicationId).get();
        if (!doc.exists) {
            alert('Application not found');
            return;
        }

        const application = doc.data();
        const coverLetter = application.coverLetters.find(letter => letter.name === fileName);
        
        if (!coverLetter) {
            alert('Cover letter not found');
            return;
        }

        // For PDFs, create a blob and open in new tab
        if (coverLetter.type === 'application/pdf') {
            // Convert Base64 to Blob
            const byteCharacters = atob(coverLetter.data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // Create object URL and open in new tab
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            
            // Clean up the object URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } else {
            // For other files, trigger download
            const link = document.createElement('a');
            link.href = coverLetter.data;
            link.download = coverLetter.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Error viewing cover letter:', error);
        alert('Error viewing cover letter: ' + error.message);
    }
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

// Document form submission
if (documentForm) {
    documentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('documentType').value;
        const title = document.getElementById('documentTitle').value;
        const description = document.getElementById('documentDescription').value;
        const fileInput = document.getElementById('documentFile');
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file to upload');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Check file size (limit to 1MB)
        if (file.size > 1024 * 1024) {
            alert('File size must be less than 1MB');
            return;
        }
        
        const submitBtn = documentForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.textContent = 'Converting...';
            submitBtn.disabled = true;
            
            // Convert file to Base64
            const base64String = await fileToBase64(file);
            
            // Prepare the document data
            const documentData = {
                type,
                title: title || file.name,
                description,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileData: base64String,
                userId: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            console.log('Attempting to add document with type:', type);
            
            // Add document to Firestore
            const docRef = await db.collection('documents').add(documentData);
            console.log('Document added with ID:', docRef.id);
            
            // Reset form and hide it
            documentForm.reset();
            hideUploadForm();
            
            // Force refresh the documents list
            await loadDocuments();
            
            // Show success message
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            if (error.code === 'permission-denied') {
                alert('Please make sure you are logged in. If the problem persists, try logging out and back in.');
            } else {
                alert('Error uploading document. Please try again.');
            }
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Application form listeners
    if (addApplicationBtn) {
        addApplicationBtn.addEventListener('click', showApplicationForm);
    }
    
    // Document form listeners
    if (uploadDocumentBtn) {
        uploadDocumentBtn.addEventListener('click', showUploadForm);
    }
    
    // Modal listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideDocumentPreview);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === documentPreviewModal) {
            hideDocumentPreview();
        }
    });

    // Application form submission
    if (jobForm) {
        jobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const jobTitle = document.getElementById('jobTitle').value;
            const companyName = document.getElementById('companyName').value;
            const status = document.getElementById('status').value;
            const deadline = document.getElementById('deadline').value;
            const notes = document.getElementById('notes').value;
            
            try {
                // Show loading state
                const submitBtn = jobForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Adding...';
                submitBtn.disabled = true;
                
                // Upload cover letters if any
                const coverLetterInputs = document.querySelectorAll('.cover-letter-input');
                const coverLetters = [];
                
                for (const input of coverLetterInputs) {
                    if (input.files.length > 0) {
                        const file = input.files[0];
                        try {
                            const coverLetter = await uploadCoverLetter(file);
                            coverLetters.push(coverLetter);
                        } catch (uploadError) {
                            console.error('Error uploading cover letter:', uploadError);
                            alert(`Error uploading cover letter ${file.name}: ${uploadError.message}`);
                        }
                    }
                }
                
                // Add application to Firestore
                const docRef = await db.collection('applications').add({
                    jobTitle,
                    companyName,
                    status,
                    deadline,
                    notes,
                    coverLetters,
                    userId: auth.currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('Application added with ID:', docRef.id);
                
                // Reset form and hide it
                jobForm.reset();
                hideApplicationForm();
                
                // Reload applications
                await loadApplications();
                
                // Show success message
                alert('Application added successfully!');
            } catch (error) {
                console.error('Error adding application:', error);
                alert('Error adding application: ' + error.message);
            } finally {
                // Reset button state
                const submitBtn = jobForm.querySelector('button[type="submit"]');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}); 