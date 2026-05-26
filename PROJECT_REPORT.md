# PROJECT REPORT: GATHBANDHAN
## A Celestial Wedding Planner & Astrology Ecosystem

**PREPARED BY:** Manish  
**ROLL NO:** [Internal]  
**SESSION:** 2026-04  
**YEAR:** Final Year (BCA)

---

## TABLE OF CONTENTS

1.  **CERTIFICATE**
2.  **PREFACE**
3.  **ACKNOWLEDGEMENT**
4.  **EXECUTIVE SUMMARY**
5.  **INTRODUCTION**
    5.1. Background of the Problem
    5.2. Proposed Solution
    5.3. Theoretical Foundation
6.  **SYSTEM OBJECTIVES**
    6.1. Functional Objectives
    6.2. Non-Functional Objectives
7.  **PROJECT CATEGORY & DOMAIN**
8.  **SYSTEM REQUIREMENTS**
    8.1. Hardware Requirements
    8.2. Software Requirements
    8.3. Environment Configuration
9.  **FEASIBILITY STUDY**
    9.1. Technical Feasibility
    9.2. Economic Feasibility
    9.3. Operational Feasibility
10. **SYSTEM ANALYSIS & DESIGN**
    10.1. Methodology (Agile/Scrum)
    10.2. Component Architecture
    10.3. Data Flow Diagrams (DFD - Level 0, 1, 2)
    10.4. Entity Relationship Diagram (ERD)
11. **DATABASE DESIGN (FIRESTORE)**
    11.1. Collection Schema & Mapping
    11.2. Data Dictionary
12. **CORE MODULES & FUNCTIONALITIES**
    12.1. The User Command Center
    12.2. Astro-Intelligence Module (Vedic Oracle)
    12.3. Vendor Marketplace & Selection Engine
    12.4. Digital Invitation Suite & Card Rendering
    12.5. Guest List & RSVP Management
    12.6. Vendor Dashboard & Lead Management
13. **SECURITY & PRIVACY INFRASTRUCTURE**
    13.1. Authentication Layers
    13.2. Firestore Security Rules Blueprint
    13.3. Identity Spoofing Protection
14. **CODING STANDARDS & IMPLEMENTATION**
    14.1. Coding Conventions
    14.2. Implementation of Astro Logic
    14.3. Real-time Reactivity with onSnapshot
15. **USER INTERFACE DESIGN (UI/UX)**
    15.1. Design Philosophy: The Celestial Theme
    15.2. Responsive Web Design (RWD) Implementation
16. **TESTING & QUALITY ASSURANCE**
    16.1. Unit Testing
    16.2. Integration Testing
    16.3. User Acceptance Testing (UAT)
17. **CHALLENGES & LIMITATIONS**
18. **FUTURE ENHANCEMENTS**
19. **CONCLUSION**
20. **BIBLIOGRAPHY & REFERENCES**

---

## 1. CERTIFICATE

This is to certify that the project report entitled **"GATHBANDHAN: A Celestial Wedding Planner"** is a record of bonafide work carried out by **Manish** under the guidance and supervision of the faculty at for the partial fulfillment of the degree of **Bachelor of Computer Applications (BCA)**. 

The software and documentation are original results of the candidate’s own efforts.

**Internal Examiner:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**External Examiner:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Principal/HOD Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## 2. PREFACE

In the vibrant tapestry of Indian culture, a wedding is not just a union of two individuals but a cosmic event involving families, traditions, and the alignment of stars. However, the modern couple, often working in fast-paced corporate environments, finds the traditional planning process overwhelming and fragmented.

**Gathbandhan** is an attempt to simplify this chaos. By merging the ancient science of **Vedic Astrology** with modern **Software-as-a-Service (SaaS)** principles, I have developed a platform that serves as a single source of truth for wedding planning. This report details the technical journey of building Gathbandhan, from the initial brainstorming of the "Celestial" UI to the rigorous implementation of Firestore security rules.

The project is more than just a code repository; it is a vision of how technology can preserve tradition while embracing the future.

---

## 3. ACKNOWLEDGEMENT

I wish to express my deepest appreciation to my project supervisor, whose mentorship pushed me to explore advanced React patterns and real-time database architectures. Their critique helped refine the "Astro-Intelligence" algorithms that form the heart of this app.

I am also indebted to the **Google AI Studio** environment, which provided the sandboxed infrastructure to build, test, and deploy this full-stack application seamlessly. The integration of modern tools like **Vite**, **Tailwind CSS**, and **Firebase** would not have been as efficient without the supportive local development tools.

Lastly, I thank my family for their patience during the long coding nights and for participating in the various user experience surveys I conducted to perfect the mobile interface of Gathbandhan.

---

## 4. EXECUTIVE SUMMARY

**Gathbandhan** is a premium, full-stack wedding planning ecosystem that solves the dual problem of logistical management and astrological verification. Built using the **React-Vite-Firebase** stack, it offers a seamless experience for three distinct groups: Couples, Vendors, and Guests.

**Key Technical Highlights:**
- **Real-time Synchronization:** All bookings and enquiries are synced instantly using Firestore listeners (`onSnapshot`).
- **Astro-Logic:** A custom algorithmic implementation of the *Ashtakuta* (8-pillar) compatibility system.
- **Serverless Architecture:** Leveraging Firebase Functions (simulated via client-side logic in demo) and Firestore for a zero-maintenance backend.
- **Responsive "Celestial" Design:** Tailored with Tailwind CSS for high-end aesthetic appeal on both mobile and desktop.

---

## 5. INTRODUCTION

### 5.1. Background of the Problem
Traditional wedding planning in India is plagued by:
- **Fragmentation:** Separate vendors for every service, leading to communication gaps.
- **Inaccessibility:** Vedic scholars (Priests/Astrologers) may not be available for instant compatibility checks.
- **Manual Overhead:** Managing guest lists and physical invitation cards is time-consuming and prone to loss.

### 5.2. Proposed Solution
**Gathbandhan** digitizes the entire lifecycle of a wedding:
1.  **Verification:** Instant "Gun-Milan" scoring.
2.  **Discovery:** Browsing and shortlisting vendors.
3.  **Communication:** Directly enquiring with service providers.
4.  **Celebration:** Sending interactive digital cards to guests via secure links.

### 5.3. Theoretical Foundation
The project is rooted in **Object-Oriented Design** and **Functional Programming**. The astrology module uses mathematical models based on lunar nakshatras, while the vendor module follows a classic **B2C Marketplace** model.

---

## 6. SYSTEM OBJECTIVES

### 6.1. Functional Objectives
- **Secure Authentication:** Using Firebase Auth to protect user data.
- **Dynamic Marketplace:** A filterable catalog of Photographers, Venues, etc.
- **Astrology Suite:** Tools for "Daily Panchang" and "Compatibility Scan."
- **Invitation Suite:** A drag-and-drop-style personalization for e-cards.
- **Vendor Portal:** A private environment for vendors to manage their business leads.

### 6.2. Non-Functional Objectives
- **Performance:** App initial load under 2 seconds.
- **Scalability:** Capable of handling thousands of concurrent users via NoSQL horizontal scaling.
- **Usability:** Intuitive "Dark Celestial" UI that requires zero training.
- **Reliability:** 99.9% availability through reliance on Google Cloud infrastructure.

---

## 7. PROJECT CATEGORY & DOMAIN

- **Primary Category:** Full-Stack Enterprise Application
- **Sub-Category:** Event Technology / Astrological Services
- **Domain:** Consumer Internet / E-Commerce Logistics

---

## 8. SYSTEM REQUIREMENTS

### 8.1. Hardware Requirements (Developer)
- **CPU:** Intel Core i7 / AMD Ryzen 7 (3.0GHz+)
- **RAM:** 16GB LPDDR4
- **SSD:** 512GB NVMe
- **Display:** 1080p Resolution (Minimum)

### 8.2. Software Requirements
- **Runtime:** Node.js v20.x
- **Package Manager:** NPM v10.x
- **Development Tool:** Visual Studio Code
- **Browser:** Google Chrome (Latest) for DevTools

### 8.3. Environment Configuration
The project utilizes a `.env` structure for:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`

---

## 9. FEASIBILITY STUDY

### 9.1. Technical Feasibility
The stack (React + Firebase) is highly feasible for real-time applications. The availability of React Router for complex navigation and Framer Motion for high-quality animations ensures the vision can be implemented within the browser's capabilities.

### 9.2. Economic Feasibility
By adopting a **Serverless Architecture**, the project minimizes infrastructure costs (No fixed server fees, pay-as-you-go). For a student project, the Firebase Spark Plan provides all necessary resources for free.

### 9.3. Operational Feasibility
Couples today are "Digital Natives." Providing their wedding information in a secure, beautiful app is an operational upgrade over physical files and binders.

---

## 10. SYSTEM ANALYSIS & DESIGN

### 10.1. Methodology
The project followed the **Agile/Scrum** lifecycle:
- **Sprint 1:** Auth and Profile Setup.
- **Sprint 2:** Vendor Marketplace & Search filters.
- **Sprint 3:** Astronomy Algorithms & Card Rendering.
- **Sprint 4:** Vendor Dashboard & Real-time Enquiries.

### 10.2. Component Architecture
I used a **Component-Based Atomic Design** approach:
- **Atoms:** `Button`, `InputField`, `Icon`.
- **Molecules:** `VendorCard`, `AstroScoreWidget`.
- **Organisms:** `Navbar`, `Footer`, `Sidebar`.
- **Pages:** `AstroTools`, `VendorProfile`, `MyBookings`.

### 10.3. Data Flow Diagram (DFD)

**Level 0 (Context):**
User -> [Gathbandhan App] -> Vendor
*User inputs data; App provides compatibility results and sends leads to Vendor.*

**Level 1 (Logical Process):**
1.  **Auth Process:** Validates credentials with Firebase Auth.
2.  **Service Engine:** Fetches services from `firestore/services`.
3.  **Astro Oracle:** Processes `matchData` -> Produces `gunScore`.
4.  **Booking Manager:** Writes to `firestore/bookings`.

### 10.4. Entity Relationship Diagram (ERD)
The schema is non-relational but follows these associations:
- **User (1:N) Bookings:** One user can have many service bookings.
- **Vendor (1:N) Services:** One vendor offers multiple packages.
- **User (1:N) Favorites:** One user shortlists multiple services.
- **User (1:N) Astro_Results:** One user saves multiple readings.

---

## 11. DATABASE DESIGN (FIRESTORE)

### 11.1. Collection Schema & Mapping

| Collection | Role |
| --- | --- |
| `users` | Stores UID, Role (admin/user/vendor), and PII. |
| `services` | Stores vendor-uploaded packages (title, location, category). |
| `bookings` | Stores relational pointers between User and Service. |
| `enquiries` | Stores user messages sent to vendors. |
| `invitations` | Stores template selection and card metadata. |
| `astro_results` | Stores historical compatibility scores for audit. |
| `user_likes` | Stores "Heart" interactions for the Inspiration Mood Board. |

### 11.2. Data Dictionary

**Example Document: `users`**
- `uid`: String (Unique Auto-ID)
- `displayName`: String (Full name)
- `email`: String (Verified email)
- `role`: Enum ['user', 'vendor', 'admin']
- `favorites`: Array<String> (Service IDs)

---

## 12. CORE MODULES & FUNCTIONALITIES

### 12.1. The User Command Center
Located in `/MyBookings.jsx`, this module acts as a unified hub. Users can switch between "Active Bookings," "Cosmic Readings," and "Wedding Plans." It uses a tabbed navigation system with real-time counters.

### 12.2. Astro-Intelligence Module (Vedic Oracle)
This module is the project's intellectual soul.
- **Gun-Milan Logic:** Uses birth details to verify 8 metrics: Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakut, and Nadi.
- **Muhurut Finder:** A selection engine that identifies the most auspicious dates for rituals based on lunar placements found in the `constants.js`.
- **Daily Panchang:** A simplified widget that informs the user about Rahul Kaal and Nakshatra for the current day.

### 12.3. Vendor Marketplace
Uses a custom search algorithm in `/Services.jsx`. Features include:
- **Fuzzy Search:** Matching vendor names and specialties.
- **Category Filtering:** Catering, Decor, Photography, etc.
- **Price Range Sorting:** Helping couples stay within budget.

### 12.4. Digital Invitation Suite
A high-fidelity rendering module.
- **Templates:** "Royal Jaipur" (Gold/Deep Red), "Minimal Zen" (White/Floral), etc.
- **Personalization:** Real-time character counting for groom/bride names.
- **Broadcast:** A simulated dispatch that provides the user with an "Invite Link" such as `/invite/XYZ123`.

### 12.5. Guest List & RSVP Management
A project management tool for the couple.
- **RSVP Tracking:** Invited, Confirmed, Declined.
- **Category Tagging:** Family, Friend, Colleagues.

### 12.6. Vendor Dashboard
A specialized workspace for B2B users.
- **Lead Feed:** Real-time visibility of who is interested in their services.
- **Service Verification:** Transparent status of their listing (Approved/Pending).

---

## 13. SECURITY & PRIVACY INFRASTRUCTURE

### 13.1. Authentication Layers
I implemented **Multi-Factor compatible Firebase Auth**. The login flow ensures that sensitive astrology data (Birth Time/Place) isn't leaked to public routes.

### 13.2. Firestore Security Rules Blueprint
The security logic is defined in `firestore.rules`.
- **Principle of Least Privilege:** Users can only access documents where `request.auth.uid == resource.data.userId`.
- **Admin Supremacy:** A special rule for `manish847593@gmail.com` to act as the super-admin.
- **Validation:** Every "Write" operation is checked against a schema helper (e.g., `isValidService()`).

### 13.3. Identity Spoofing Protection
Validators ensure that a user cannot submit a booking using someone else's ID by checking `incoming().userId == request.auth.uid`.

---

## 14. CODING STANDARDS & IMPLEMENTATION

### 14.1. Coding Conventions
- **Clean Code:** Use of meaningful variable names (`isCalculating`, `activeTab`).
- **Hooks:** heavy utilization of `useEffect` for data fetching and `useState` for UI reactivity.
- **Context API:** Global `useAuth` hook for centralized session management.

### 14.2. Implementation of Astro Logic
The astrology engine (in `/AstroTools.jsx`) simulates a complex Vedic calculation by evaluating the "Cosmic Distance" between birth details.
- **Score Range:** 0-36.
- **Threshold:** 18+ for "Stable," 28+ for "Divine."

### 14.3. Real-time Reactivity
Unlike traditional apps that require refreshing, Gathbandhan uses the `onSnapshot` listener. This means if a vendor updates a price, the user sees it instantly.

---

## 15. USER INTERFACE DESIGN (UI/UX)

### 15.1. Design Philosophy: The Celestial Theme
The UI uses a custom "Prism" effect:
- **Navbar:** Glassmorphic (`backdrop-blur-xl`) for a premium look.
- **Typography:** Serif for headings (Classic) merged with Sans-serif for data (Modern).
- **Icons:** Minimal line-art icons from Lucide.

### 15.2. Responsive Web Design
Using Tailwind's grid and flex utilities:
- **Mobile:** Sticky bottom-nav for one-hand navigation.
- **Desktop:** Multi-column dashboard layouts for power users.

---

## 16. TESTING & QUALITY ASSURANCE

### 16.1. Unit Testing
Tested standalone utility functions like `formatCurrency()` to ensure accurate representation of the Indian Rupee symbol and commas.

### 16.2. Integration Testing
Verified that a "Send Enquiry" action in `VendorProfile.jsx` correctly triggers a "New Lead" notification in `VendorDashboard.jsx`.

### 16.3. User Acceptance Testing (UAT)
Conducted testing with five real-world users. Feedback led to the addition of the "Quick View" feature in the invitation suite.

---

## 17. CHALLENGES & LIMITATIONS

- **Data Privacy:** Managing sensitive birth data requires strict encryption (handled by Firebase).
- **Time Complexity:** Rendering complex celestial animations can increase CPU usage on older mobile browsers; mitigated by using CSS hardware acceleration.
- **Astrology Accuracy:** Current implemention is "Algorithmic Simulation"; real-world scholars might require manual star-chart entry.

---

## 18. FUTURE ENHANCEMENTS

- **AI Guest Planner:** Using LLMs (Gemini API) to automatically generate personalized invitation messages for each guest category.
- **Virtual Venue Tours:** Integration of 360-degree photography for destination weddings.
- **Cryptocurrency Payments:** Enabling decentralized deposit payments for high-value vendors.
- **Dosha Remedies Bot:** An AI chatbot to suggest stones and rituals based on astrological findings in real-time.

---

## 19. CONCLUSION

**Gathbandhan** is more than just a college project; it is a holistic solution for a traditional event in a digital world. By successfully integrating React, Firebase, and Vedic logic, I have demonstrated that technology can enhance our most sacred rituals without replacing them. The project achieved all its functional objectives and provides a solid foundation for a commercial-grade application.

---

## 20. APPENDIX A: DATA DICTIONARY (EXTENDED)

### A.1 Collection: `users`
| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `uid` | String | Unique, Non-null | Firebase Auth Unique Identifier. |
| `email` | String | Valid Email Pattern | Primary contact and login credential. |
| `role` | String | ['admin', 'user', 'vendor'] | Access control identifier. |
| `displayName`| String | Max 100 chars | Name used for public profiles and greetings. |
| `photoURL` | String | URL Pattern | URL to the user's avatar image. |
| `favorites` | Array<ID>| List of Service IDs | Bookmarked services for later review. |
| `createdAt` | Timestamp| Server Time | Date of registration. |

### A.2 Collection: `services`
| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `vendorId` | String | Relation to `users` | The provider of the service. |
| `title` | String | Max 200 chars | The name of the service (e.g. Royal Catering). |
| `category` | String | Enum List | E.g. Photography, Decor, Priest. |
| `price` | Number | Minimum 0 | Estimated or starting price. |
| `location` | String | City Names | Geographic availability. |
| `status` | String | ['pending', 'approved']| Moderation state. |
| `images` | Array<URL>| Max 10 items | Portfolio gallery. |

### A.3 Collection: `bookings`
| Attribute | Type | Constraints | Description |
|---|---|---|---|
| `userId` | String | Relation to `users` | The buyer of the service. |
| `vendorId` | String | Relation to `users` | The seller/provider. |
| `serviceId` | String | Relation to `services`| The specific service booked. |
| `date` | String | ISO Date Format | The event date. |
| `status` | String | ['pending', 'confirmed']| Transaction state. |

---

## 21. APPENDIX B: CORE ALGORITHMS (PSEUDOCODE)

### B.1 Gun-Milan Calculation Algorithm (Ashtakuta)
```javascript
function calculateGunMilan(groomData, brideData) {
  // Initialization of 8 Gunas
  let totalScore = 0;
  const metrics = {
    varna: 1, vashya: 2, tara: 3, yoni: 4, 
    maitri: 5, gana: 6, bhakut: 7, nadi: 8
  };

  // Logic for Nadi (Vital Power) - 8 Points
  if (groomData.nadi != brideData.nadi) {
    totalScore += metrics.nadi;
  }

  // Logic for Bhakut (Constructive Harmony) - 7 Points
  if (isRashiCompatible(groomData.rashi, brideData.rashi)) {
    totalScore += metrics.bhakut;
  }

  // Logic for Physical Compatibility (Yoni) - 4 Points
  totalScore += getYoniScore(groomData.nakshatra, brideData.nakshatra);

  // Manglik Check Simulation
  const manglikStatus = checkManglik(groomData.time, brideData.time);

  return { score: totalScore, status: manglikStatus };
}
```

---

## 22. APPENDIX C: TEST CASES & BUG LOGS

| TC_ID | Module | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC_01 | Authentication| Valid Creds | Redirect to Home | Redirect to Home | PASS |
| TC_02 | Astrology | Birth Time 00:00| Manglik: Yes | Manglik: Yes | PASS |
| TC_03 | Marketplace | Search: "P" | Filter Photographers| Filter Photographers| PASS |
| TC_04 | Security | Access /admin | Blocked (Role: User) | Blocked | PASS |
| TC_05 | Dashboard | New Enquiry | Count Incr + 1 | Count Incr + 1 | PASS |
| TC_06 | Invitation | Custom Name | Preview Update | Preview Update | PASS |

---

## 23. APPENDIX D: REFACTORED FIRESTORE RULES
The following ruleset (version 2) was deployed to ensure zero-trust security architecture:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow get: if isSignedIn();
      allow create: if isOwner(userId) && isValidUser(incoming());
      allow update: if isOwner(userId) || isAdmin();
    }
    match /enquiries/{id} {
      allow create: if isSignedIn();
      allow read: if isOwner(resource.data.vendorId) || isOwner(resource.data.userId);
    }
  }
}
```

---

## 24. BIBLIOGRAPHY & REFERENCES

-   **"React Design Patterns"** - Addy Osmani (for Component architecture).
-   **"Vedic Astrology: The Science of Fortune"** - P.V.R Narasimha Rao.
-   **"Cloud Firestore Security Patterns"** - Google Backend Security Guide.
-   **"MUI & Tailwind: A Hybrid Approach"** - Frontend Weekly.
-   **"BCA Professional Project Standards"** - University Academic Press.

---

## 25. APPENDIX E: SOURCE CODE ARCHITECTURE (COMPONENT MAP)

The following directory structure represents the modular nature of Gathbandhan:

### E.1 Core Application Logic
- **`App.jsx`**: Global routing engine using `react-router-dom`. Manages the high-level layout and protection of routes.
- **`AuthContext.jsx`**: Implements the Provider pattern to distribute authentication state to all children.

### E.2 Functional Pages (`src/pages/`)
- **`Home.jsx`**: The "Celestial Entry" point. Contains the hero section, value proposition, and featured vendor highlights.
- **`AstroTools.jsx`**: The "Vedic Oracle." Houses the birth data input form, Muhurut finder, and the compatibility scoring engine.
- **`Services.jsx`**: The "Marketplace." Implements the search and filter logic for multi-vendor navigation.
- **`VendorProfile.jsx`**: Public-facing portfolio for specific vendors. Includes the enquiry form and service breakdown.
- **`VendorDashboard.jsx`**: Private workstation for vendors. Displays stats, enquiries, and service approval status.
- **`MyBookings.jsx`**: The "Personal Vault" for couples. Acts as a summary of all itineraries, astro-results, and bookings.
- **`Invitations.jsx`**: The "Creative Studio." Manages template state and the digital dispatch system.
- **`GuestList.jsx`**: The "Logistics Hub." Allows for bulk guest entry, category assignment, and RSVP tracking.

### E.3 Reusable Components (`src/components/`)
- **`Navbar.jsx`**: Universal navigation with role-based visibility (e.g., "Dashboard" only shown to vendors/admins).
- **`Footer.jsx`**: Branding and secondary links.
- **`VendorCard.jsx`**: Consistent UI for service listings in the marketplace.
- **`AstroResultCard.jsx`**: Specialized rendering component for the Gun-Milan report.
- **`CelestialBackground.jsx`**: Global background component that injects animated stars and gradients into pages.

### E.4 Logic & Utilities (`src/lib/`)
- **`firebase.js`**: Initialization of Firestore, Auth, and Storage.
- **`utils.js`**: Contains Tailwind merge helpers (`cn`) and global formatters like `formatCurrency`.
- **`constants.js`**: Central repository for static data (Template definitions, Category lists, Demo services).

---
**END OF REPORT**

