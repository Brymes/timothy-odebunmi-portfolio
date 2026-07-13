const PROJECTS = [
  {
    title: "Helium Reward Pipeline",
    category: "Backend + Data Engineering",
    summary:
      "Built S3 to ClickHouse ETL pipelines for Helium proto and gRPC reward files, syncing reward metadata and data offload statistics for more than 50,000 devices.",
    impact: [
      "Automated reward ingestion and reconciliation",
      "Improved visibility across IoT and mobile reward streams",
      "Enabled payout-ready analytics for operations teams",
    ],
    stack: ["Rust", "Python", "ClickHouse", "AWS", "S3"],
    image: "assets/images/project-1-helium.svg",
    demo: "https://example.com/helium-pipeline",
    repo: "https://github.com/Brymes",
  },
  {
    title: "Secure Autopilot Chat",
    category: "Product + Systems",
    summary:
      "Designed an encrypted chat flow for autopilot software and migrated internal SDK usage, helping reduce command latency by 40 percent while keeping operations reliable.",
    impact: [
      "Strengthened command security and operator messaging",
      "Reduced runtime latency for MAVLINK commands",
      "Made SDK behavior easier to test and maintain",
    ],
    stack: ["Rust", "SDK Forks", "Encryption", "Telemetry", "Systems"],
    image: "assets/images/project-2-drone.svg",
    demo: "https://example.com/autopilot-chat",
    repo: "https://github.com/Brymes",
  },
  {
    title: "Certification and Incentive Hub",
    category: "Academic Operations",
    summary:
      "Built an automated training and certification system that cut helpdesk costs and supported user growth, proving how internal tools can improve learning and operations at the same time.",
    impact: [
      "Reduced support overhead by 90 percent",
      "Created a smoother path for users to complete certification",
      "Turned routine admin work into a trackable process",
    ],
    stack: ["JavaScript", "Dashboards", "Automation", "Forms", "Reporting"],
    image: "assets/images/project-3-training.svg",
    demo: "https://example.com/certification-hub",
    repo: "https://github.com/Brymes",
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
    note: "Check project mockups and make sure the cards look balanced.",
    completed: true,
  },
  {
    id: "seed-contact",
    title: "Validate contact form rules",
    category: "Assignment",
    dueDate: "",
    note: "Test empty inputs, email format, and digit-only phone numbers.",
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
  if (!pathname || pathname === "/") {
    return "/index.html";
  }

  return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
}

function setActiveNavLink() {
  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkPath = normalizePath(new URL(link.href).pathname);
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupNavigationToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");

  if (!toggle || !panel) {
    return;
  }

  const closeMenu = () => {
    panel.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    panel.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = panel.dataset.open === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) {
      panel.dataset.open = "";
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupRevealAnimations(scope = document) {
  const revealItems = scope.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initProjectGrid() {
  const grid = document.querySelector("[data-project-grid]");
  if (!grid) {
    return;
  }

  grid.innerHTML = PROJECTS.map((project) => {
    const stack = project.stack.map((item) => `<span>${item}</span>`).join("");
    const impact = project.impact.map((item) => `<li>${item}</li>`).join("");

    return `
      <article class="project-card reveal">
        <figure class="project-media">
          <img src="${project.image}" alt="${project.title} visual mockup">
        </figure>
        <div class="project-content">
          <span class="chip">${project.category}</span>
          <div class="project-title-row">
            <div>
              <h3>${project.title}</h3>
              <p class="task-meta">${project.summary}</p>
            </div>
          </div>
          <ul>${impact}</ul>
          <div class="stack">${stack}</div>
          <div class="project-links">
            <a href="${project.demo}" target="_blank" rel="noreferrer noopener">Live demo</a>
            <a href="${project.repo}" target="_blank" rel="noreferrer noopener">Source</a>
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
  const total = document.querySelector("[data-task-total]");
  const completed = document.querySelector("[data-task-completed]");
  const remaining = document.querySelector("[data-task-remaining]");

  if (!form || !list) {
    return;
  }

  const taskInput = form.querySelector("[name='task']");
  const categoryInput = form.querySelector("[name='category']");
  const dueDateInput = form.querySelector("[name='dueDate']");
  const noteInput = form.querySelector("[name='note']");

  let tasks = loadTasks();

  renderTasks();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskInput.value.trim();
    const category = categoryInput.value.trim();
    const dueDate = dueDateInput.value;
    const note = noteInput.value.trim();

    if (!title) {
      taskInput.focus();
      return;
    }

    tasks.unshift({
      id: createId(),
      title,
      category,
      dueDate,
      note,
      completed: false,
    });

    persistTasks();
    form.reset();
    taskInput.focus();
    renderTasks();
  });

  list.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }

    const taskId = actionButton.dataset.id;
    const action = actionButton.dataset.action;
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return;
    }

    if (action === "toggle") {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
    }

    if (action === "delete") {
      tasks = tasks.filter((task) => task.id !== taskId);
    }

    persistTasks();
    renderTasks();
  });

  function loadTasks() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return [...DEFAULT_TASKS];
      }

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [...DEFAULT_TASKS];
    } catch {
      return [...DEFAULT_TASKS];
    }
  }

  function persistTasks() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function renderTasks() {
    const orderedTasks = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));

    list.innerHTML = "";

    if (orderedTasks.length === 0) {
      const emptyState = document.createElement("li");
      emptyState.className = "empty-state";
      emptyState.textContent = "No tasks yet. Add one above and turn the planner into your study board.";
      list.appendChild(emptyState);
    } else {
      orderedTasks.forEach((task) => {
        list.appendChild(renderTask(task));
      });
    }

    const completedCount = tasks.filter((task) => task.completed).length;
    const remainingCount = tasks.length - completedCount;

    if (total) total.textContent = tasks.length.toString();
    if (completed) completed.textContent = completedCount.toString();
    if (remaining) remaining.textContent = remainingCount.toString();
  }

  function renderTask(task) {
    const item = document.createElement("li");
    item.className = `task-card ${task.completed ? "is-complete" : ""}`;

    const head = document.createElement("div");
    head.className = "task-head";

    const content = document.createElement("div");
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
    meta.textContent = task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date";

    content.appendChild(meta);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.dataset.action = "toggle";
    toggle.dataset.id = task.id;
    toggle.className = `button button-secondary ${task.completed ? "is-complete" : ""}`;
    toggle.textContent = task.completed ? "Mark active" : "Mark done";

    head.append(content, toggle);

    const foot = document.createElement("div");
    foot.className = "task-foot";

    const badge = document.createElement("span");
    badge.className = "chip";
    badge.textContent = task.category;

    const destroy = document.createElement("button");
    destroy.type = "button";
    destroy.dataset.action = "delete";
    destroy.dataset.id = task.id;
    destroy.className = "button button-ghost";
    destroy.textContent = "Delete";

    foot.append(badge, destroy);

    item.append(head, foot);
    return item;
  }
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) {
    return;
  }

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
    phone: "Phone number must contain digits only.",
    message: "Please type a message.",
  };

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field.id);
      if (success) {
        success.hidden = true;
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalid = validateForm();

    if (firstInvalid) {
      firstInvalid.focus();
      if (success) {
        success.hidden = true;
      }
      return;
    }

    form.reset();
    if (success) {
      success.hidden = false;
      success.textContent = "Thanks. Your message passed validation and is ready to send.";
    }
  });

  function validateForm() {
    let firstInvalid = null;

    Object.entries(fields).forEach(([key, field]) => {
      const isValid = validators[key](field.value);
      if (!isValid) {
        setFieldError(key, messages[key]);
        field.setAttribute("aria-invalid", "true");
        if (!firstInvalid) {
          firstInvalid = field;
        }
      } else {
        clearFieldError(field.id);
      }
    });

    return firstInvalid;
  }

  function setFieldError(key, message) {
    const field = fields[key];
    const error = errorNodes[key];

    if (field) {
      field.setAttribute("aria-invalid", "true");
    }

    if (error) {
      error.textContent = message;
    }
  }

  function clearFieldError(fieldId) {
    const key = fieldId.replace("contact", "").toLowerCase();
    const error = errorNodes[key];
    const field = fields[key];

    if (field) {
      field.removeAttribute("aria-invalid");
    }

    if (error) {
      error.textContent = "";
    }
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(dateValue) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${dateValue}T00:00:00`));
  } catch {
    return dateValue;
  }
}
