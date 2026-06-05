# 🌟 DoDesk - Elegant Glassmorphic Task Manager

DoDesk is a premium, serverless task management web application designed with a modern glassmorphic interface and micro-interactions. Operating entirely client-side, it combines automated LocalStorage persistence with an advanced **File System Access Sync** engine that reads and writes directly to local `.json` files.

---

## 🎨 Design & Visual Highlights

*   **Premium Glassmorphic UI:** Styled with deep translucent cards, layout blurs, glowing priority accents, and subtle borders.
*   **Seamless Light/Dark Themes:** Optimized custom HSL color tokens for both themes, supporting instant switching and fluid CSS variable transitions.
*   **Interactive Counter Stats:** Dashboard counters in the sidebar animate counts dynamically using numeric easing functions alongside a smooth progress tracking bar.
*   **Micro-interactions:** Custom CSS animations handle hover states, checklist inputs, card deletion transitions, and modal expansions.
*   **Celebration Particles:** Renders custom canvas-confetti bursts on checkmarks and double-firework explosions upon completing all tasks.

---

## 🚀 Key Features

### 1. Advanced Task Creation & Editing
*   Assign tasks detailed **Titles**, optional **Descriptions**, **Categories**, **Priority Levels** (High, Medium, Low), and due **Dates & Times** (`datetime-local`).
*   Edit active tasks inside a sleek modal with automatic change state triggers.

### 2. Dual-Layer Storage Architecture (Static & Serverless)
*   **Automated LocalStorage Sync:** Updates task records locally in the browser immediately on every user interaction to safeguard data across page refreshes.
*   **Direct `.json` File Auto-Sync:** Link a local file (e.g. `tasks.json`) via the modern **File System Access API**. The app dynamically loads tasks from the file and automatically writes state updates back to it.
*   **Manual JSON Backups:** Export the database to a formatted `.json` backup file or restore it from an existing one with one-click actions.

### 3. Active Reminders & Beep Alarms
*   An active checker daemon inspects deadlines every 5 seconds.
*   Upon deadline, it triggers a custom alternating E5/G5 siren alert (beep alarm) generated dynamically via the **Web Audio API** (requires zero file assets).
*   Displays a persistent overdue toast alert visible for 15 seconds with a manual "X" dismiss button.

### 4. Interactive Search, Filtering, & Sorter
*   **Search Input:** Instantly matches query strings inside titles and descriptions.
*   **Sidebar Filters:** Categorize views into *All Tasks*, *Today*, *Upcoming*, *Completed*, or *Overdue*.
*   **Multi-Sort Options:** Sort task lists by due dates, priorities, or creation date stamps.

---

## 📂 File Architecture

*   📄 **[index.html](file:///H:/OM/Synent%20Technologies%20Internship%20Project/ToDoList/index.html)** - Core DOM layout, sidebar dashboard, models, and toast containers.
*   🎨 **[style.css](file:///H:/OM/Synent%20Technologies%20Internship%20Project/ToDoList/style.css)** - Global glassmorphism variables, color palette themes, layout styles, and animations.
*   ⚡ **[app.js](file:///H:/OM/Synent%20Technologies%20Internship%20Project/ToDoList/app.js)** - State manager, file handles, synthesizer audio engine, alarms, sorting filters, and DOM event bindings.

---

## 🛠️ Technology Stack & CDNs

*   **Core Languages:** HTML5, CSS3 (Vanilla), ES6+ JavaScript (Vanilla).
*   **Icons:** [Lucide Icons](https://unpkg.com/lucide) (served via CDN).
*   **Animations:** [Canvas Confetti](https://cdn.jsdelivr.net/npm/canvas-confetti) (served via CDN).
*   **Sound Synthesis:** Web Audio API (procedurally synthesized).

---

## ⚡ How to Run Locally

Since DoDesk is a serverless application, you do not need to compile or run npm scripts:

1.  Clone the repository or download the project files.
2.  Open the project folder and double-click **[index.html](file:///H:/OM/Synent%20Technologies%20Internship%20Project/ToDoList/index.html)** to load it directly in any modern web browser.
3.  Ensure your device volume is enabled to hear the complete chimes and alarm alerts!
