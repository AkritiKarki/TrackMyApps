## TrackMyApps

> Job seekers, especially students and early-career professionals, often find it difficult to manage multiple job or internship applications simultaneously. The process can become disorganized, making it harder to track deadlines, follow-up tasks, or application statuses. With many opportunities to keep track of, it becomes overwhelming to stay on top of things.
> My app, **TrackMyApps** helps users organize and manage their job and internship applications. With **TrackMyApps** users can add new applications, track their progress, keep their documents like resume and cover letters organized and make detailed notes about each application. All the data is securely stored, allowing users to have a clear overview of their job search and keep their progress organized.

## Try the App
http://localhost:8000/
>
Video link: https://res.cloudinary.com/dpqh5xjka/video/upload/v1743569538/sib5miq0s8vr9vbwngqu.mov

## Initial Prompt and Cursor Response
**Initial Prompt to Cursor:**
Build a simple job application tracking app. start by allowing user to keep track of job title, company name and application status. please create the app with vanilla html, css and javascript
>
**Cursor's Response:**
It gave me a simple tracking app where you can log in the Job title, company name and status. It then keeps track of all your entries. When I refresh the page, my entry is still there.
>
**Was it what you expected?**
Yes, Cursor built a good functional skeleton layout to start with. It added a delete button on its own, made a clean, easy to navigate interface.

## Followup Prompts Regarding Features, and Cursor Responses
Here are **feature-related prompts** I gave to Cursor and what happened:

1. **Prompt:** Add user registration and login to the app, and change the app to use persistent data with a Firebase Firestore database. Make it so the data is user specific. each user has their own list of persons that they can record. Use the following Firebase project settings:…
    
    **Response:** Opens the app with a opening screen that allows user to sign in or log in using email and password
    
2. **Prompt:** Create a home page that displays a place holder "No applications yet" message. create an application page with a form that includes fields for "Job title", "company name", "Application status" and "deadline”.
    
    **Response:** Made a home page like I wanted that displayed “No application yet” and had a button that navigated to “Add new Application” however, the home page didn’t update with my loggings. “It kept displaying no applications yet”. Was easily fixed by one prompt.
    
3. **Prompt:** allow user to edit their applications 
    
    **Response:** showed a edit button next to delete when you hover over it but it didn’t work. Had to ask it to fix the issue.
    
4. **Prompt:** add undo button when an application is deleted 
    
    **Response:** showed an undo button but didn’t undo the action. had to be more specific and give more instructions to make it work.
    
5. **Prompt:** lets add another tab that allows user to store their portfolio, resume and cover letters. allow the applications to also have a attached notes and cover letter if needed
    
    **Response:** added another tab called document. But didn’t work. The documents were not not being attached because I had exceeded the storage limit of firebase. Had to spend hrs   trying to fix this problem. Every time one was fixed another problem was created. Had to use a different way of storing and opening the files.

## Followup Prompts Regarding User Interface, and Cursor Responses

Here are **UI prompts** I gave to Cursor:

1. **Prompt:** “Add tabs to switch between home and application page. 
    
    **Response:** Cursor added two tabs; home and application. Had to fix some design layout and texts.
    
2. **Prompt:**  Lets add another tab that allows user to store their portfolio, resume and cover letters. allow the applications to also have an attached notes and cover letter if needed
    
    **Response:** It did what I wanted. allows user to add notes and any relevant documents to the application. it also has a document tabs. Had to  fix where the docs aren’t just linked but can also be opened from the website itself 
    
3. **Prompt:** “show user log in info on a top right corner instead of displaying constantly. Make the delete button smaller or hidden if possible 
    
    **Response:** Hid the delete button, now only shows when u hover over the list. Moved login info to the top right corner instead of top middle.
    
4. **Prompt**: “allow users to view the documents they uploaded”
    
    **Response:** Allows user to open the documents they uploaded. 
    
5. **Prompt:** ” keep "my documents" and "upload new docs” in different lines
    
    **Response:**  made it cleaner and in different lines
    
6. **Prompt:** “when add new document is clicked, automatically scroll down to the part where I can attach the document instead of user scrolling down to it”
    
    **Response:** Did what was asked

## Summary

**Final App Description:**

TrackMyApps is a job and internship application tracking app designed to help users stay organized throughout their job search. The app allows users to log their applications, track their progress, store important documents like resumes and cover letters, and make detailed notes for each job opportunity. Users can securely store their data and access it anytime to keep their job search structured and manageable.

**What I liked about Cursor:**

- It runs commands on its own, and even when I needed to run terminal commands or fix issues manually, it provided step-by-step instructions.
- When I couldn't store data due to exceeding Firebase’s free storage limit, it not only identified the issue but also suggested free alternative solutions that didn’t rely on Firebase.
- It allowed me to upload pictures of errors instead of having to explain issues I didn’t fully understand. I could simply submit screenshots of pop-up errors and the developer tool page (F12), and it would diagnose the problem.

**Challenges / Issues:**

- For some reason, it started running Python and executing tasks in a more complicated way than necessary.
- When adding new features, fixing one issue often created new ones, leading to a time-consuming debugging process.
- Certain UI improvements required extra clarification to ensure correct implementation.
- I COULD NOT DEPLOY IT. I followed all the steps and successfully linked my GitHub, Cursor, and Vercel. Vercel deployed the app, but I couldn't open the deployed version. I suspect the issue is that Cursor switched to using Python at some point instead of Node, and I incorporated storage solutions beyond Firebase. As a result, the necessary environment variables might be missing on Vercel, preventing the app from functioning properly.
  
