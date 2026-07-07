# Doctor Portal Testing Guide

Now that the application is successfully compiling with zero build and type errors, you can test the Doctor Portal! 

Here are the answers to your questions and a complete walkthrough on how to access and test the Doctor Portal:

## 1. How do I log in as a Doctor?
Currently, for development and testing purposes, you don't need a special set of credentials to log in as a doctor. We have implemented a dedicated development endpoint (`POST /api/v1/auth/switch-role`) that lets you swap the role of your existing account on the fly. 
- You can log in with your standard Patient account via Clerk.
- There are already seeded Doctor profiles in the database (`doctor1`, `doctor2`, etc.). When you switch your role to `DOCTOR`, the system temporarily maps your Clerk User ID to the first available Doctor in the database.

## 2. Where is the Doctor Portal entry point?
I have implemented a **Role Switcher** directly in the UI. 
- It is located at the very bottom of the **Sidebar Navigation** on the left.
- You will see a button labeled **"Switch to Doctor View"**.
- Clicking this button will automatically call the backend endpoint, change your role, and reload the application.

## 3. What is the complete testing flow?
Starting from `localhost:3000`, follow these exact steps:

1. **Log in:** Visit `http://localhost:3000` and sign in with your regular Clerk account.
2. **Patient Landing:** The `page.tsx` router will identify you as a `PATIENT` and route you to `/home`.
3. **Switch Roles:** Look at the bottom of the left sidebar and click **"Switch to Doctor View"**.
4. **Doctor Dashboard:** The application will refresh. Because you are now recognized as a `DOCTOR`, the `AuthGuard` and root router will automatically direct you to `/queue` (Today's Queue / Doctor Dashboard).
5. **View Queue:** You should see a list of today's appointments in the queue. 
6. **Patient Directory:** Click **"Patients"** in the sidebar to visit `/patients`. This will show you a directory of all patients you have interacted with.
7. **Consultation Workspace:** From the Queue or the Patient Directory, click **"View Profile"** on any patient. This will take you to `/patients/[id]`, which is the Consultation Workspace (where you can view their Clinical Timeline and Demographics).
8. **Revert Role:** When you are done testing, you can click **"Switch to Patient View"** in the sidebar to instantly revert to a patient.

## 4. Role-Based Routing
I have fully implemented role-based routing as requested:
- **`AuthGuard`** wraps all routes. If a Patient tries to access `/queue`, they are instantly redirected to `/home`. If a Doctor tries to access `/home`, they are redirected to `/queue`.
- **Root Router (`/`)** automatically sends Doctors to their dashboard (`/queue`) and Patients to their dashboard (`/home`) upon login.
- **Next.js Layouts** are segregated into `(patient)` and `(doctor)` route groups, ensuring no UI components (like bottom navigation) accidentally leak between the two portals.
