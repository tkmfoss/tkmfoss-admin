# TKMFOSS Admin Portal ⚡

Official, standalone administrator control plane for **TKMFOSS** (TKM College of Engineering Free and Open Source Software Cell).

## 🚀 Features

- **📅 Events & Workshops Management**:
  - Full CRUD operations with instant Firestore synchronization.
  - Upload event posters (Cloudinary CDN / Firebase Storage / Base64 fallback).
  - Categorization (`WORKSHOP`, `HACKATHON`, `COMMUNITY`, `TALK`, `MEETUP`, `COMPETITION`).
  - Status management (`UPCOMING`, `COMPLETED`, `CANCELLED`).
  - Interactive highlights tag builder.
  - Registration link tracking & open/close toggle.

- **📢 Announcements & Notifications**:
  - Broadcast club alerts, recruitment drives, and general updates.
  - Priority levels (`PINNED`, `URGENT`, `NORMAL`, `LOW`).
  - 1-click Live / Hidden toggle switch.
  - Call-to-action buttons and external links.

- **👥 Execom Directory (Current & Past Tenures)**:
  - Separate filters for **Active Execom** (e.g. 2025-26) and **Past Execom / Alumni** (2024-25, 2023-24, etc.).
  - Profile photo upload and avatar preview.
  - Role, department, and contact links (GitHub, LinkedIn, Email).
  - Sorting and display order priority.

- **📝 Post-Event Impact Reports**:
  - Document completed events with attendee counts and outcomes.
  - Multi-photo gallery upload for event pictures.
  - Attachments for Google Drive photo albums and official report documents.
  - Key takeaways and deliverables list.

- **☁️ Cloudinary & Firebase Media Integration**:
  - Pre-configured with Firebase project `admin-web-16b4a`.
  - In-app Cloudinary configuration with instant test upload verification.
  - Automatic fallback between Cloudinary, Firebase Storage, and offline caching.

- **💾 Data Export & Seeding**:
  - 1-click **"Seed Initial TKMFOSS Data"** button to populate historical club events and execom into Firestore.
  - Export collections directly as JSON for updating `tkmfoss.github.io`.

---

## 🛠️ Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Custom Cyberpunk / Glassmorphic Vanilla CSS Design System
- **Database & Auth**: Firebase Firestore & Firebase Auth (`admin-web-16b4a`)
- **Media CDN**: Cloudinary REST API & Firebase Storage
- **Icons**: Lucide Icons & Custom SVG Badges

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🔑 Firebase & Cloudinary Setup

### Firebase Configuration
The application is pre-configured with:
- **Project ID**: `admin-web-16b4a`
- **Auth Domain**: `admin-web-16b4a.firebaseapp.com`
- **Storage Bucket**: `admin-web-16b4a.firebasestorage.app`

#### Recommended Firestore Rules:
To enable real-time writes from the admin portal, ensure your Firestore rules in the [Firebase Console](https://console.firebase.google.com/) allow authenticated access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Or restrict to your admin UID
    }
  }
}
```

### Cloudinary Setup
When you have your Cloudinary credentials ready:
1. Navigate to the **Cloud & Settings** tab inside the Admin portal.
2. Enter your **Cloud Name** and **Upload Preset** (create an *Unsigned* upload preset under *Settings > Upload* in your Cloudinary Dashboard).
3. Click **Save Settings** or test with the **Test Upload with Photo** button.
*(Alternatively, you can set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in a `.env` file).*
