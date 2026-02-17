# HTML PHPKOBO Deobfuscator

![License](https://img.shields.io/github/license/KhanhNguyen9872/HTML_PHPKOBO_DEOBF)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## 🌐 Live Demo
**[https://phpkobo-deobf.vercel.app/](https://phpkobo-deobf.vercel.app/)**

A powerful, web-based tool designed to deobfuscate websites protected by [PHPKOBO HTML Obfuscator](https://www.phpkobo.com/html-obfuscator). This tool executes the obfuscated code in a controlled sandbox environment and captures the rendered HTML, effectively reversing the obfuscation.

## ✨ Features

- **Live Deobfuscation**: Instantly view the deobfuscated HTML as it renders.
- **Safe Execution**: Runs obfuscated code within a sandboxed `iframe` to prevent malicious actions.
- **Network Control**: Toggle network access for the sandbox to prevent external tracking or resource loading.
- **Code Beautify**: Built-in formatter for HTML, CSS, and JavaScript using `js-beautify`.
- **Responsive Preview**: Test how the deobfuscated site looks on Desktop, Tablet, and Mobile viewports.
- **Proxy Support**: Includes a built-in proxy (Vercel/Local) to bypass CORS restrictions when fetching external URLs.
- **History & Snapshots**: Automatically saves your work and maintains a history of snapshots.
- **Dark Mode**: Fully supported dark/light theme for comfortable usage.
- **I18n Support**: Interface available in multiple languages.

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/KhanhNguyen9872/HTML_PHPKOBO_DEOBF.git
    cd HTML_PHPKOBO_DEOBF
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 🚀 Usage

1.  **Input Obfuscated Code**:
    - Paste the obfuscated HTML code directly into the **Input Editor**.
    - Or use the **Load from URL** feature to fetch code from a website (proxied to bypass CORS).
    - Or **Upload** a `.html` / `.txt` file.

2.  **Process**:
    - Click the **Process** (Play icon) button.
    - The tool will execute the code in the sandbox.

3.  **View & Export**:
    - The **Preview** pane shows the rendered page.
    - The **Output Editor** displays the recovered, deobfuscated HTML source code.
    - Use code formatting tools (Beautify) to clean up the output.
    - Click **Download** to save the deobfuscated file.

## 🔧 Architecture

- **Frontend**: React, Vite, TailwindCSS.
- **Editor**: Monaco Editor (VS Code's editor) for powerful code editing.
- **Deobfuscation Engine**: 
    - Uses a sandboxed `iframe` to execute the obfuscated scripts.
    - `MutationObserver` monitors DOM changes to capture the final rendered state.
    - Helper scripts inject into the sandbox to assist in capturing dynamic content.
- **API**: Vercel Serverless Function (in `api/proxy.js`) handles CORS proxying.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is intended for **educational purposes and security analysis only**. The author is not responsible for any misuse of this tool. Please respect the intellectual property rights of website owners.
