# 🔒 Password Generator + Secure Vault

A simple, fast, and privacy-first password manager built with the Next.js, MongoDB, and Tailwind CSS. All vault data is encrypted/decrypted on the client-side, meaning the server never sees your plaintext passwords.

**Live Demo URL:** [Link will be here after deployment]

---

## Core Features

- **Strong Password Generation:** Customizable length and character sets (uppercase, numbers, symbols).
- **Secure Vault:** Save credentials with a title, username, password, URL, and notes.
- **Client-Side Encryption:** All vault items are encrypted in the browser using AES before being sent to the server. The server only ever stores encrypted blobs.
- **Simple Authentication:** Secure user sign-up and login (email/password).
- **Protected Routes:** The user dashboard is protected and accessible only to authenticated users.
- **Copy to Clipboard:** Easily copy passwords, which automatically clears from the clipboard after a short period (a browser feature).
- **Minimalist UI:** A clean and fast interface built with Tailwind CSS.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **Styling:** Tailwind CSS
- **Authentication:** JWT (JSON Web Tokens) with Cookies
- **Client-Side Encryption:** `crypto-js` (AES)
- **Deployment:** Vercel

---

## Running the Project Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- A free MongoDB Atlas account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/The-morning-star23/password-vault-app.git](https://github.com/The-morning-star23/password-vault-app.git)
    cd password-vault-app
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following variables.
    ```env
    MONGODB_URI="your_mongodb_connection_string"
    JWT_SECRET="your_super_secret_random_string_for_jwt"
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Note on Cryptography

For this project, I used the **`crypto-js`** library to perform client-side **AES (Advanced Encryption Standard)** encryption. The user's master password serves as the secret key for encryption and decryption. This approach ensures maximum privacy, as unencrypted, sensitive data **never leaves the user's browser** and is never stored on the server or in logs.