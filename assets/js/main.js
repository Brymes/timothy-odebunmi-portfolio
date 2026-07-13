const PROJECTS = [
  {
    title: "Reusable File Upload Service",
    language: "Go",
    summary:
      "A plug-and-play backend service for applications that need to upload files to AWS S3 or Cloudinary without rebuilding the same infrastructure for every product.",
    capabilities: [
      "Supports AWS S3 and Cloudinary storage providers",
      "Runs as a Docker service with environment-based configuration",
      "Includes published Postman API documentation",
    ],
    image: "assets/images/project-file-upload.png",
    repository: "https://github.com/Brymes/Reusable-File-Upload-Service",
  },
  {
    title: "NFT Sales Discord Bot",
    language: "Go",
    summary:
      "A Discord bot powered by DIA data that tracks NFT collection sales and provides market information through server commands and subscriptions.",
    capabilities: [
      "Subscribes Discord channels to collection sales updates",
      "Tracks transactions above a chosen price threshold",
      "Reports floor price, moving average, and volume information",
    ],
    image: "assets/images/project-nft-bot.png",
    repository: "https://github.com/Brymes/NFT-Sales-Discord-Bot",
  },
  {
    title: "Go-LazerPay",
    language: "Go",
    summary:
      "An unofficial Go SDK for LazerPay that gives Go applications a direct interface for retrieving supported coins and confirming payment transactions.",
    capabilities: [
      "Provides a Go client for LazerPay API operations",
      "Uses environment-based public and secret keys",
      "Documents installation, usage, and test execution",
    ],
    image: "assets/images/project-lazerpay.png",
    repository: "https://github.com/Brymes/Go-LazerPay",
  },
];

const STORAGE_KEY = "timothy-academic-planner";
const DEFAULT_TASKS = [
  {
    id: "seed-study",
    title: "Review Web Technologies notes",
    category: "Study",
    dueDate: "",
    note: "Refresh HTML semantics and layout systems before submission.",
    completed: false,
  },
  {
    id: "seed-project",
    title: "Polish portfolio screenshots",
    category: "Project",
    dueDate: "",
    note: "Check the real repository previews at desktop and mobile sizes.",
    completed: true,
  },
  {
    id: "seed-contact",
    title: "Validate contact form rules",
    category: "Assignment",
    dueDate: "",
    note: "Test empty fields, email format, and digit-only phone numbers.",
    completed: false,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js");
  initSharedUI();
  initProjectGrid();
  initPlanner();
  initContactForm();
});

function initSharedUI() {
  setCurrentYear();
  setActiveNavLink();
  setupNavigationToggle();
  setupRevealAnimations();
}

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear().toString();
  });
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/index.html";
  return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
}

function setActiveNavLink() {
  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    link.toggleAttribute("aria-current", linkPath === currentPath);
    if (linkPath === currentPath) link.setAttribute("aria-current", "page");
  });
}

function setupNavigationToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (!toggle || !panel) return;

  const closeMenu = () => {
    panel.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const shouldOpen = panel.dataset.open !== "true";
    panel.dataset.open = shouldOpen.toString();
    toggle.setAttribute("aria-expanded", shouldOpen.toString());
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

function setupRevealAnimations(scope = document) {
  const revealItems = scope.querySelectorAll(".reveal:not(.is-visible)");
  if (!revealItems.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initProjectGrid() {
  const grid = document.querySelector("[data-project-grid]");
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((project, index) => {
    const capabilities = project.capabilities.map((item) => `<li>${item}</li>`).join("");
    const number = String(index + 1).padStart(2, "0");

    return `
      <article class="project-card reveal">
        <figure class="project-media">
          <img src="${project.image}" alt="GitHub repository preview for ${project.title}">
        </figure>
        <div class="project-content">
          <span class="project-number">Project ${number}</span>
          <div class="project-meta"><span>${project.language}</span><span>Open source</span></div>
          <h3>${project.title}</h3>
          <p>${project.summary}</p>
          <ul>${capabilities}</ul>
          <div class="project-actions">
            <a class="button button-text" href="${project.repository}" target="_blank" rel="noreferrer noopener">View repository</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  setupRevealAnimations(grid);
}

function initPlanner() {
  const form = document.querySelector("[data-task-form]");
  const list = document.querySelector("[data-task-list]");
  if (!form || !list) return;

  const total = document.querySelector("[data-task-total]");
  const completed = document.querySelector("[data-task-completed]");
  const remaining = document.querySelector("[data-task-remaining]");
  const taskInput = form.querySelector("[name='task']");
  const categoryInput = form.querySelector("[name='category']");
  const dueDateInput = form.querySelector("[name='dueDate']");
  const noteInput = form.querySelector("[name='note']");
  const taskError = form.querySelector("[data-task-error]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  let tasks = loadTasks();
  let activeFilter = "all";

  renderTasks();

  taskInput.addEventListener("input", clearTaskError);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();

    if (!title) {
      taskInput.setAttribute("aria-invalid", "true");
      taskError.textContent = "Enter a task name before adding it.";
      taskInput.focus();
      return;
    }

    tasks.unshift({
      id: createId(),
      title,
      category: categoryInput.value.trim(),
      dueDate: dueDateInput.value,
      note: noteInput.value.trim(),
      completed: false,
    });

    persistTasks();
    form.reset();
    clearTaskError();
    activeFilter = "all";
    updateFilterButtons();
    renderTasks();
    taskInput.focus();
  });

  list.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const taskId = actionButton.dataset.id;
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    if (actionButton.dataset.action === "toggle") {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
    } else if (actionButton.dataset.action === "delete") {
      tasks = tasks.filter((task) => task.id !== taskId);
    }

    persistTasks();
    renderTasks();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      updateFilterButtons();
      renderTasks();
    });
  });

  function clearTaskError() {
    taskInput.removeAttribute("aria-invalid");
    taskError.textContent = "";
  }

  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", (button.dataset.filter === activeFilter).toString());
    });
  }

  function loadTasks() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return [...DEFAULT_TASKS];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [...DEFAULT_TASKS];
    } catch {
      return [...DEFAULT_TASKS];
    }
  }

  function persistTasks() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function getVisibleTasks() {
    const ordered = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));
    if (activeFilter === "active") return ordered.filter((task) => !task.completed);
    if (activeFilter === "completed") return ordered.filter((task) => task.completed);
    return ordered;
  }

  function renderTasks() {
    const visibleTasks = getVisibleTasks();
    list.innerHTML = "";

    if (!visibleTasks.length) {
      const emptyState = document.createElement("li");
      emptyState.className = "empty-state";
      emptyState.textContent = tasks.length
        ? `No ${activeFilter} tasks to show.`
        : "Your task list is clear. Add the next piece of work above.";
      list.appendChild(emptyState);
    } else {
      visibleTasks.forEach((task) => list.appendChild(renderTask(task)));
    }

    const completedCount = tasks.filter((task) => task.completed).length;
    if (total) total.textContent = tasks.length.toString();
    if (completed) completed.textContent = completedCount.toString();
    if (remaining) remaining.textContent = (tasks.length - completedCount).toString();
  }

  function renderTask(task) {
    const item = document.createElement("li");
    item.className = `task-card${task.completed ? " is-complete" : ""}`;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "task-toggle";
    toggle.dataset.action = "toggle";
    toggle.dataset.id = task.id;
    toggle.setAttribute("aria-pressed", task.completed.toString());
    toggle.setAttribute("aria-label", task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as complete`);

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("h3");
    title.textContent = task.title;
    content.appendChild(title);

    if (task.note) {
      const note = document.createElement("p");
      note.className = "task-note";
      note.textContent = task.note;
      content.appendChild(note);
    }

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const category = document.createElement("span");
    category.textContent = task.category;
    const dueDate = document.createElement("span");
    dueDate.textContent = task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date";
    meta.append(category, dueDate);
    content.appendChild(meta);

    const destroy = document.createElement("button");
    destroy.type = "button";
    destroy.className = "task-delete";
    destroy.dataset.action = "delete";
    destroy.dataset.id = task.id;
    destroy.setAttribute("aria-label", `Delete ${task.title}`);
    destroy.textContent = "x";

    item.append(toggle, content, destroy);
    return item;
  }
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const success = form.querySelector("[data-contact-success]");
  const fields = {
    name: form.querySelector("#contactName"),
    email: form.querySelector("#contactEmail"),
    phone: form.querySelector("#contactPhone"),
    message: form.querySelector("#contactMessage"),
  };
  const errorNodes = {
    name: form.querySelector("[data-error-for='name']"),
    email: form.querySelector("[data-error-for='email']"),
    phone: form.querySelector("[data-error-for='phone']"),
    message: form.querySelector("[data-error-for='message']"),
  };
  const validators = {
    name: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    phone: (value) => /^\d+$/.test(value.trim()) && value.trim().length >= 7,
    message: (value) => value.trim().length > 0,
  };
  const messages = {
    name: "Please enter your name.",
    email: "Enter a valid email address.",
    phone: "Use digits only and enter at least seven numbers.",
    message: "Please type a message.",
  };

  Object.entries(fields).forEach(([name, field]) => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      errorNodes[name].textContent = "";
      success.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    Object.entries(fields).forEach(([name, field]) => {
      const isValid = validators[name](field.value);
      if (isValid) {
        field.removeAttribute("aria-invalid");
      } else {
        field.setAttribute("aria-invalid", "true");
      }
      errorNodes[name].textContent = isValid ? "" : messages[name];
      if (!isValid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      success.hidden = true;
      firstInvalid.focus();
      return;
    }

    form.reset();
    success.hidden = false;
    success.textContent = "Your message passed validation and is ready to send.";
  });
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
