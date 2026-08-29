import { useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Circle,
  Clock3,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  SendHorizonal,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   SAMPLE DATA
========================================================= */

const initialTenants = [
  {
    id: "tenant-aurora",
    name: "Aurora Labs",
    status: "Active",
  },
  {
    id: "tenant-nova",
    name: "Nova Systems",
    status: "Active",
  },
  {
    id: "tenant-echo",
    name: "Echo Works",
    status: "Pending",
  },
];

const initialTasks = [
  {
    id: 1,
    title: "Website Redesign",
    description:
      "Redesign the company website with a cleaner layout, improved navigation, and responsive design.",
    assignee: "Nicole Gabutan",
    initials: "NG",
    priority: "High",
    status: "In Progress",
    due: "Aug 30, 2026",
    category: "Design",
    tenantId: "tenant-aurora",
  },
  {
    id: 2,
    title: "API Integration",
    description:
      "Connect the frontend task system to the REST API and prepare the required data structures.",
    assignee: "Maria Santos",
    initials: "MS",
    priority: "Medium",
    status: "To Do",
    due: "Aug 31, 2026",
    category: "Development",
    tenantId: "tenant-nova",
  },
  {
    id: 3,
    title: "System Testing",
    description:
      "Perform functional and usability testing for the task management system.",
    assignee: "John Cruz",
    initials: "JC",
    priority: "Low",
    status: "Completed",
    due: "Sep 02, 2026",
    category: "Testing",
    tenantId: "tenant-aurora",
  },
  {
    id: 4,
    title: "Database Setup",
    description:
      "Prepare the database structure required by the task management application.",
    assignee: "Nicole Gabutan",
    initials: "NG",
    priority: "High",
    status: "In Progress",
    due: "Sep 04, 2026",
    category: "Database",
    tenantId: "tenant-aurora",
  },
  {
    id: 5,
    title: "User Documentation",
    description:
      "Create documentation explaining how users can navigate and use the system.",
    assignee: "Maria Santos",
    initials: "MS",
    priority: "Medium",
    status: "To Do",
    due: "Sep 06, 2026",
    category: "Documentation",
    tenantId: "tenant-nova",
  },
];

const initialMembers = [
  {
    name: "Nicole Gabutan",
    role: "Administrator",
    initials: "NG",
    tasks: 8,
    email: "nicole.gabutan@taskflow.com",
    phone: "+63 912 345 6789",
    department: "Operations",
    tenantId: "tenant-aurora",
  },
  {
    name: "Maria Santos",
    role: "Project Manager",
    initials: "MS",
    tasks: 5,
    email: "maria.santos@taskflow.com",
    phone: "+63 917 123 4567",
    department: "Product",
    tenantId: "tenant-nova",
  },
  {
    name: "John Cruz",
    role: "Developer",
    initials: "JC",
    tasks: 4,
    email: "john.cruz@taskflow.com",
    phone: "+63 918 765 4321",
    department: "Engineering",
    tenantId: "tenant-aurora",
  },
];

/* =========================================================
   APP
========================================================= */

function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const [members, setMembers] = useState(initialMembers);

  const [tenants] = useState(initialTenants);

  const [activePage, setActivePage] = useState("Dashboard");

  const [selectedTask, setSelectedTask] = useState(null);

  const [showCreate, setShowCreate] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [toast, setToast] = useState(null);

  const toastIdRef = useRef(1);

  const taskIdRef = useRef(1);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("taskflow-auth") === "true";
    } catch {
      return false;
    }
  });

  const [sessionUser, setSessionUser] = useState(() => {
    try {
      const saved = localStorage.getItem("taskflow-session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({
    role: "Admin",
    account: "Nicole Gabutan",
    email: "nicole.gabutan@taskflow.com",
    password: "admin123",
  });

  const [loginError, setLoginError] = useState("");

  const [currentUserRole, setCurrentUserRole] = useState(
    sessionUser?.role || "Admin"
  );

  const [currentTenantId, setCurrentTenantId] = useState(
    sessionUser?.tenantId || "tenant-aurora"
  );

  const [settings, setSettings] = useState({
    notifications: true,
    compactMode: true,
    autoRefresh: false,
    tenantOnlyView: true,
  });

  const [chatInput, setChatInput] = useState("");

  const [isChatLoading, setIsChatLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text:
        "I'm ready to help with tasks, tenant access, and workflow guidance.",
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "Nicole Gabutan",
    priority: "Medium",
    status: "To Do",
    due: "",
    category: "General",
    tenantId: "tenant-aurora",
  });

  const [newMember, setNewMember] = useState({
    name: "",
    role: "Developer",
    email: "",
    phone: "",
    department: "Engineering",
    tenantId: "tenant-aurora",
  });

  const roleAccounts = {
    "Super Admin": [
      {
        name: "System Owner",
        email: "owner@taskflow.com",
        tenantId: "tenant-aurora",
      },
    ],
    Admin: [
      {
        name: "Nicole Gabutan",
        email: "nicole.gabutan@taskflow.com",
        tenantId: "tenant-aurora",
      },
      {
        name: "Maria Santos",
        email: "maria.santos@taskflow.com",
        tenantId: "tenant-nova",
      },
    ],
    Staff: [
      {
        name: "John Cruz",
        email: "john.cruz@taskflow.com",
        tenantId: "tenant-aurora",
      },
      {
        name: "Maria Santos",
        email: "maria.santos@taskflow.com",
        tenantId: "tenant-nova",
      },
    ],
  };

  const formatRoleLabel = (role) =>
    role === "Admin" ? "Administrator" : role;

  const currentUser = useMemo(
    () => ({
      name: sessionUser?.name || "Nicole Gabutan",
      role: currentUserRole,
      tenantId:
        currentUserRole === "Super Admin"
          ? "all"
          : currentTenantId,
    }),
    [currentUserRole, currentTenantId, sessionUser]
  );

  const currentTenant =
    tenants.find((tenant) => tenant.id === currentTenantId) || tenants[0];

  const canManageTenants = currentUserRole === "Super Admin";
  const canManageUsers = currentUserRole !== "Staff";
  const canCreateTasks = currentUserRole !== "Staff";
  const canDeleteTasks = currentUserRole !== "Staff";

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const matchesTenant =
        currentUser.role === "Super Admin"
          ? true
          : currentUser.role === "Admin"
          ? task.tenantId === currentUser.tenantId
          : task.tenantId === currentUser.tenantId &&
            task.assignee === currentUser.name;

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query);

      return matchesTenant && matchesSearch;
    });
  }, [tasks, search, currentUser]);

  const visibleMembers = useMemo(() => {
    return members.filter((member) => {
      if (currentUser.role === "Super Admin") {
        return true;
      }

      return member.tenantId === currentUser.tenantId;
    });
  }, [members, currentUser]);

  const totalTasks = filteredTasks.length;

  const todoTasks = filteredTasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const progressTasks = filteredTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  /* -------------------------------------------------------
     Toast
  ------------------------------------------------------- */

  const notify = (message, type = "success") => {
    setToast({
      id: toastIdRef.current++,
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const account =
      roleAccounts[loginForm.role]?.find(
        (item) => item.name === loginForm.account
      ) || roleAccounts[loginForm.role]?.[0];

    if (!account) {
      setLoginError("Please select a valid account.");
      return;
    }

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }

    const nextRole = loginForm.role;
    const nextTenantId =
      nextRole === "Super Admin"
        ? "tenant-aurora"
        : account.tenantId || currentTenantId;

    const nextUser = {
      name: account.name,
      email: loginForm.email.trim(),
      role: nextRole,
      tenantId: nextTenantId,
    };

    setSessionUser(nextUser);
    setCurrentUserRole(nextRole);
    setCurrentTenantId(nextTenantId);
    setIsLoggedIn(true);
    setLoginError("");

    try {
      localStorage.setItem("taskflow-session", JSON.stringify(nextUser));
      localStorage.setItem("taskflow-auth", "true");
    } catch {
      // Ignore storage issues in non-persistent environments.
    }

    notify(`Signed in as ${account.name}.`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSessionUser(null);
    setShowProfile(false);
    setShowProfileDetails(false);
    setShowNotifications(false);
    setShowAiAssistant(false);
    setLoginError("");

    try {
      localStorage.removeItem("taskflow-session");
      localStorage.setItem("taskflow-auth", "false");
    } catch {
      // Ignore storage issues in non-persistent environments.
    }

    notify("You have been logged out.");
  };

  const sendAiMessage = async () => {
    const prompt = chatInput.trim();

    if (!prompt || isChatLoading) {
      return;
    }

    const userMessage = {
      id: toastIdRef.current++,
      sender: "user",
      text: prompt,
    };

    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await axios.post(
        "/api/ai/chat",
        {
          prompt,
          role: currentUser.role,
          tenantId: currentUser.tenantId,
          tenantName: currentTenant?.name || "Current tenant",
          userName: currentUser.name,
        }
      );

      const aiReply =
        response?.data?.answer ||
        response?.data?.message ||
        "The AI service is responding. Please retry in a moment.";

      setChatMessages((current) => [
        ...current,
        {
          id: toastIdRef.current++,
          sender: "ai",
          text: aiReply,
        },
      ]);
    } catch {
      setChatMessages((current) => [
        ...current,
        {
          id: toastIdRef.current++,
          sender: "ai",
          text:
            "Unable to reach the AI endpoint at /api/ai/chat. Confirm the backend is running before sending prompts.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* -------------------------------------------------------
     Create Task
  ------------------------------------------------------- */

  const createTask = () => {
    if (!newTask.title.trim()) {
      notify("Please enter a task title.", "error");
      return;
    }

    const task = {
      id: taskIdRef.current++,
      title: newTask.title.trim(),
      description:
        newTask.description.trim() || "No description provided.",
      assignee: newTask.assignee,
      initials:
        newTask.assignee === "Nicole Gabutan"
          ? "NG"
          : newTask.assignee === "Maria Santos"
          ? "MS"
          : "JC",
      priority: newTask.priority,
      status: newTask.status,
      due: newTask.due
        ? formatDate(newTask.due)
        : "No deadline",
      category: newTask.category,
      tenantId:
        currentUser.role === "Super Admin"
          ? newTask.tenantId || currentTenantId
          : currentTenantId,
    };

    setTasks((current) => [task, ...current]);

    setNewTask({
      title: "",
      description: "",
      assignee: "Nicole Gabutan",
      priority: "Medium",
      status: "To Do",
      due: "",
      category: "General",
    });

    setShowCreate(false);

    notify("Task created successfully.");
  };

  /* -------------------------------------------------------
     Add Member
  ------------------------------------------------------- */

  const addMember = () => {
    const name = newMember.name.trim();

    if (!name) {
      notify("Please enter the member name.", "error");
      return;
    }

    const member = {
      name,
      role: newMember.role,
      initials: getInitials(name),
      tasks: 0,
      email:
        newMember.email.trim() ||
        `${name.toLowerCase().replace(/\s+/g, ".")}@taskflow.com`,
      phone: newMember.phone.trim() || "Not provided",
      department: newMember.department,
      tenantId:
        currentUser.role === "Super Admin"
          ? newMember.tenantId || currentTenantId
          : currentTenantId,
    };

    setMembers((current) => [member, ...current]);
    setNewMember({
      name: "",
      role: "Developer",
      email: "",
      phone: "",
      department: "Engineering",
    });
    setShowAddMember(false);
    notify(`${name} was added to the workspace.`);
  };

  /* -------------------------------------------------------
     Complete Task
  ------------------------------------------------------- */

  const completeTask = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "Completed",
            }
          : task
      )
    );

    setSelectedTask((current) =>
      current && current.id === id
        ? {
            ...current,
            status: "Completed",
          }
        : current
    );

    notify("Task marked as completed.");
  };

  /* -------------------------------------------------------
     Delete Task
  ------------------------------------------------------- */

  const deleteTask = (id) => {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );

    setSelectedTask(null);

    notify("Task deleted.");
  };

  /* -------------------------------------------------------
     Navigation
  ------------------------------------------------------- */

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setShowProfile(false);
    setShowProfileDetails(false);
  };

  const openProfile = () => {
    setShowProfile(false);
    setShowProfileDetails(true);
  };

  const pageInfo = {
    Dashboard: {
      eyebrow: "Overview",
      title: "Dashboard",
      description:
        "Welcome back, Nicole. Here's what's happening today.",
    },

    Tasks: {
      eyebrow: "Workspace",
      title: "Tasks",
      description:
        "View, manage, and organize your tasks.",
    },

    Users: {
      eyebrow: "Workspace",
      title: "Users",
      description:
        "Manage members of your workspace.",
    },

    Tenants: {
      eyebrow: "Workspace",
      title: "Tenants",
      description:
        "Manage organizations and workspaces.",
    },
  };

  const currentPage =
    pageInfo[activePage] || pageInfo.Dashboard;

  const loginAccounts = roleAccounts[loginForm.role] || [];

  if (!isLoggedIn) {
    return (
      <div className="login-shell">
        <div className="login-panel">
          <div className="login-illustration">
            <div className="login-brand-row">
              <div className="brand-mark">
                <CheckSquare size={22} />
              </div>

              <div>
                <div className="brand-name">
                  Task<span>Flow</span>
                </div>
                <div className="brand-subtitle">TEAM WORKSPACE</div>
              </div>
            </div>

            <div className="login-badge-row">
              <span className="login-badge">Multi-tenant</span>
              <span className="login-badge soft">Secure Access</span>
            </div>

            <h2>Manage work across every tenant with clarity.</h2>

            <p>
              Keep tasks, users, and operations organized in one secure
              workspace built for administrator-level decisions.
            </p>

            <ul className="login-features">
              <li>Role-based access and tenant visibility</li>
              <li>Unified task tracking for teams and leaders</li>
              <li>Audit-ready workspace controls</li>
            </ul>
          </div>

          <div className="login-card">
            <div className="login-header-mini">Secure sign in</div>

            <div className="login-header">
              <h1>Welcome back</h1>
              <p>Sign in to access your role-based workspace.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <label className="field">
                <span>Role</span>
                <select
                  value={loginForm.role}
                  onChange={(event) => {
                    const nextRole = event.target.value;
                    const nextAccount =
                      roleAccounts[nextRole]?.[0]?.name || "";

                    setLoginForm((current) => ({
                      ...current,
                      role: nextRole,
                      account: nextAccount,
                    }));
                  }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </label>

              <label className="field">
                <span>Account</span>
                <select
                  value={loginForm.account}
                  onChange={(event) => {
                    const selectedAccount = event.target.value;
                    const account =
                      roleAccounts[loginForm.role]?.find(
                        (item) => item.name === selectedAccount
                      ) || roleAccounts[loginForm.role]?.[0];

                    setLoginForm((current) => ({
                      ...current,
                      account: selectedAccount,
                      email: account?.email || current.email,
                    }));
                  }}
                >
                  {loginAccounts.map((account) => (
                    <option key={account.name} value={account.name}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@company.com"
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter password"
                />
              </label>

              <div className="login-row">
                <label className="login-check">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>

                <button type="button" className="login-link">
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className="login-error">{loginError}</div>
              )}

              <button className="primary-button login-button" type="submit">
                <CheckSquare size={17} />
                Sign in
              </button>
            </form>

            <div className="login-footer">
              Need help? <span>Contact your workspace administrator</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      {/* Background atmosphere */}

      <div className="ambient-background">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />
      </div>

      {/* Mobile sidebar overlay */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">
            <CheckSquare size={19} />
          </div>

          <div>
            <div className="brand-name">
              Task<span>Flow</span>
            </div>

            <div className="brand-subtitle">
              TASK MANAGEMENT
            </div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-content">
          <SidebarSection title="MAIN">
            <SidebarButton
              active={activePage === "Dashboard"}
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() => navigate("Dashboard")}
            />
          </SidebarSection>

          <SidebarSection title="WORKSPACE">
            <SidebarButton
              active={activePage === "Tasks"}
              icon={CheckSquare}
              label="Tasks"
              onClick={() => navigate("Tasks")}
              count={tasks.length}
            />

            <SidebarButton
              active={activePage === "Users"}
              icon={Users}
              label="Users"
              onClick={() => navigate("Users")}
            />

            <SidebarButton
              active={activePage === "Tenants"}
              icon={Building2}
              label="Tenants"
              onClick={() => navigate("Tenants")}
            />
          </SidebarSection>

          <SidebarSection title="TOOLS">
            <SidebarButton
              icon={Sparkles}
              label="AI Assistant"
              badge="AI"
              active={showAiAssistant}
              onClick={() => setShowAiAssistant((current) => !current)}
            />
          </SidebarSection>

          <SidebarSection title="ACCOUNT">
            <SidebarButton
              icon={User}
              label="Profile"
              onClick={openProfile}
            />

            <SidebarButton
              icon={Settings}
              label="Settings"
              onClick={() => setShowSettings(true)}
            />
          </SidebarSection>
        </div>

        {/* Sidebar user */}

        <button
          className="sidebar-user"
          onClick={openProfile}
        >
          <Avatar initials="NG" />

          <div className="sidebar-user-info">
            <strong>{sessionUser?.name || "Nicole Gabutan"}</strong>
            <span>{formatRoleLabel(currentUserRole)}</span>
          </div>

          <MoreHorizontal
            size={18}
            className="text-slate-400"
          />
        </button>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-area">
        {/* Header */}

        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tasks..."
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="topbar-right">
            {/* Notification */}

            <div className="relative">
              <button
                className="icon-button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
              >
                <Bell size={19} />

                <span className="notification-dot" />
              </button>

              {showNotifications && (
                <NotificationPanel
                  onClose={() =>
                    setShowNotifications(false)
                  }
                />
              )}
            </div>

            <div className="header-divider" />

            {/* Profile */}

            <div className="relative">
              <button
                className="profile-button"
                onClick={() =>
                  setShowProfile(
                    (current) => !current
                  )
                }
              >
                <Avatar initials="NG" small />

                <div className="profile-text">
                  <strong>{sessionUser?.name || "Nicole Gabutan"}</strong>
                  <span>{formatRoleLabel(currentUserRole)}</span>
                </div>

                <ChevronDown size={15} />
              </button>

              {showProfile && (
                <ProfilePanel
                  onClose={() =>
                    setShowProfile(false)
                  }
                  onOpenProfile={openProfile}
                  onNotify={notify}
                  onLogout={handleLogout}
                  userName={sessionUser?.name || "Nicole Gabutan"}
                  userRole={formatRoleLabel(currentUserRole)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Page */}

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {currentPage.eyebrow}
              </div>

              <h1>{currentPage.title}</h1>

              <p>{currentPage.description}</p>
            </div>

            <div className="page-controls">
              <div className="page-context-panel">
                <div className="page-context-item">
                  <span>Role</span>
                  <strong>{formatRoleLabel(currentUserRole)}</strong>
                </div>

                <div className="page-context-item">
                  <span>Tenant</span>
                  <select
                    value={currentTenantId}
                    onChange={(event) =>
                      setCurrentTenantId(event.target.value)
                    }
                  >
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {canCreateTasks && (
                <button
                  className="primary-button magnetic-button"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={18} />

                  <span>Create Task</span>

                  <ArrowUpRight size={15} />
                </button>
              )}
            </div>
          </div>

          {activePage === "Dashboard" && (
            <Dashboard
              tasks={tasks}
              filteredTasks={filteredTasks}
              totalTasks={totalTasks}
              todoTasks={todoTasks}
              progressTasks={progressTasks}
              completedTasks={completedTasks}
              onTaskClick={setSelectedTask}
              onComplete={completeTask}
              onCreate={() => setShowCreate(true)}
            />
          )}

          {activePage === "Tasks" && (
            <TasksPage
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onComplete={completeTask}
              onCreate={() => setShowCreate(true)}
            />
          )}

          {activePage === "Users" && (
            <UsersPage
              members={visibleMembers}
              canManageUsers={canManageUsers}
              onAddUser={() => setShowAddMember(true)}
            />
          )}

          {activePage === "Tenants" && (
            <TenantsPage
              tenants={tenants}
              userRole={currentUserRole}
              canManageTenants={canManageTenants}
              onNotify={notify}
            />
          )}
        </section>

        {showAiAssistant && (
          <div className="ai-chat-wrapper">
            <AiChatPanel
              messages={chatMessages}
              value={chatInput}
              onChange={setChatInput}
              onSend={sendAiMessage}
              isLoading={isChatLoading}
            />
          </div>
        )}
      </main>

      {/* =====================================================
          MODALS
      ===================================================== */}

      {showCreate && (
        <CreateTaskModal
          task={newTask}
          setTask={setNewTask}
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          member={newMember}
          setMember={setNewMember}
          onClose={() => setShowAddMember(false)}
          onAdd={addMember}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfileDetails && (
        <ProfileDetailsModal
          user={members.find((member) => member.name === "Nicole Gabutan") || members[0]}
          onClose={() => setShowProfileDetails(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={completeTask}
          onDelete={canDeleteTasks ? deleteTask : undefined}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  tasks,
  filteredTasks,
  totalTasks,
  todoTasks,
  progressTasks,
  completedTasks,
  onTaskClick,
  onComplete,
  onCreate,
}) {
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      meta: "All tasks",
    },
    {
      label: "To Do",
      value: todoTasks,
      icon: Circle,
      meta: "Waiting to start",
    },
    {
      label: "In Progress",
      value: progressTasks,
      icon: Clock3,
      meta: "Currently active",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      meta: "Successfully finished",
    },
  ];

  return (
    <>
      {/* Stats */}

      <div className="stats-grid">
        {stats.map((stat) => (
          <GlassCard
            key={stat.label}
            className="stat-card"
          >
            <div className="stat-top">
              <div>
                <div className="stat-label">
                  {stat.label}
                </div>

                <div className="stat-number">
                  {stat.value}
                </div>
              </div>

              <div className="stat-icon">
                <stat.icon size={20} />
              </div>
            </div>

            <div className="stat-meta">
              {stat.meta}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main dashboard grid */}

      <div className="dashboard-grid">
        {/* Recent tasks */}

        <GlassCard className="tasks-card">
          <div className="section-header">
            <div>
              <h2>Recent Tasks</h2>

              <p>
                Click any task to view its details.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() => {}}
            >
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-head">
            <span>Task</span>
            <span>Assignee</span>
            <span>Priority</span>
            <span>Due</span>
            <span>Status</span>
          </div>

          <div className="task-list">
            {filteredTasks
              .slice(0, 6)
              .map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() =>
                    onTaskClick(task)
                  }
                  onComplete={() =>
                    onComplete(task.id)
                  }
                />
              ))}

            {filteredTasks.length === 0 && (
              <EmptyState
                title="No tasks found"
                description="Try another search or create a new task."
                onCreate={onCreate}
              />
            )}
          </div>
        </GlassCard>

        {/* Upcoming */}

        <GlassCard className="upcoming-card">
          <div className="section-header">
            <div>
              <h2>Upcoming</h2>

              <p>Tasks needing attention.</p>
            </div>

            <CalendarDays
              size={19}
              className="section-icon"
            />
          </div>

          <div className="upcoming-list">
            {tasks
              .filter(
                (task) =>
                  task.status !== "Completed"
              )
              .slice(0, 5)
              .map((task) => (
                <button
                  key={task.id}
                  className="upcoming-item"
                  onClick={() =>
                    onTaskClick(task)
                  }
                >
                  <div className="upcoming-icon">
                    <Clock3 size={17} />
                  </div>

                  <div className="upcoming-content">
                    <strong>{task.title}</strong>

                    <span>{task.due}</span>
                  </div>

                  <ArrowUpRight size={15} />
                </button>
              ))}

            {tasks.filter(
              (task) =>
                task.status !== "Completed"
            ).length === 0 && (
              <div className="all-done">
                <CheckCircle2 size={32} />

                <strong>Everything is complete!</strong>

                <span>
                  You have no pending deadlines.
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Floating create button */}

      <button
        className="floating-create"
        onClick={onCreate}
        aria-label="Create task"
      >
        <Plus size={23} />
      </button>
    </>
  );
}

/* =========================================================
   TASK PAGE
========================================================= */

function TasksPage({
  tasks,
  onTaskClick,
  onComplete,
  onCreate,
}) {
  return (
    <GlassCard className="tasks-page-card">
      <div className="section-header">
        <div>
          <h2>All Tasks</h2>

          <p>
            Manage your tasks from one workspace.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onCreate}
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onComplete={() =>
              onComplete(task.id)
            }
          />
        ))}

        {tasks.length === 0 && (
          <EmptyState
            title="No tasks available"
            description="Create your first task."
            onCreate={onCreate}
          />
        )}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   TASK CARD
========================================================= */

function TaskCard({
  task,
  onClick,
  onComplete,
}) {
  return (
    <button
      className="task-card"
      onClick={onClick}
    >
      <div className="task-card-top">
        <div className="task-card-icon">
          <CheckSquare size={18} />
        </div>

        <ArrowUpRight
          size={17}
          className="task-card-arrow"
        />
      </div>

      <div className="task-card-category">
        {task.category}
      </div>

      <h3>{task.title}</h3>

      <p>{task.description}</p>

      <div className="task-card-bottom">
        <StatusBadge status={task.status} />

        <PriorityBadge
          priority={task.priority}
        />
      </div>

      <div
        className="task-card-assignee"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <Avatar
          initials={task.initials}
          tiny
        />

        <span>{task.assignee}</span>

        {task.status !== "Completed" && (
          <span
            className="mini-complete"
            onClick={(event) => {
              event.stopPropagation();
              onComplete();
            }}
          >
            <Check size={13} />
          </span>
        )}
      </div>
    </button>
  );
}

/* =========================================================
   TASK ROW
========================================================= */

function TaskRow({
  task,
  onClick,
  onComplete,
}) {
  return (
    <div
      className="task-row"
      onClick={onClick}
    >
      <div className="task-name-cell">
        <button
          className={`task-check ${
            task.status === "Completed"
              ? "task-check-completed"
              : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();

            if (
              task.status !== "Completed"
            ) {
              onComplete();
            }
          }}
        >
          {task.status === "Completed" ? (
            <Check size={14} />
          ) : (
            <Circle size={15} />
          )}
        </button>

        <div>
          <strong>{task.title}</strong>

          <span className="mobile-assignee">
            {task.assignee}
          </span>
        </div>
      </div>

      <div className="assignee-cell">
        <Avatar
          initials={task.initials}
          tiny
        />

        <span>{task.assignee}</span>
      </div>

      <div className="desktop-only">
        <PriorityBadge
          priority={task.priority}
        />
      </div>

      <div className="due-cell desktop-only">
        {task.due}
      </div>

      <div className="status-cell">
        <StatusBadge status={task.status} />

        <ArrowUpRight
          size={15}
          className="row-arrow"
        />
      </div>
    </div>
  );
}

/* =========================================================
   CREATE TASK MODAL
========================================================= */

function CreateTaskModal({
  task,
  setTask,
  onClose,
  onCreate,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="modal-card create-modal">
        <div className="modal-header">
          <div>
            <div className="modal-icon">
              <Plus size={19} />
            </div>

            <h2>Create Task</h2>

            <p>
              Add a new task to your workspace.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="form-area">
          <Field label="Task title">
            <input
              autoFocus
              value={task.title}
              onChange={(event) =>
                setTask({
                  ...task,
                  title: event.target.value,
                })
              }
              placeholder="e.g. Design landing page"
            />
          </Field>

          <Field label="Description">
            <textarea
              rows="4"
              value={task.description}
              onChange={(event) =>
                setTask({
                  ...task,
                  description:
                    event.target.value,
                })
              }
              placeholder="Describe what needs to be done..."
            />
          </Field>

          <div className="form-grid">
            <Field label="Priority">
              <select
                value={task.priority}
                onChange={(event) =>
                  setTask({
                    ...task,
                    priority:
                      event.target.value,
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={task.status}
                onChange={(event) =>
                  setTask({
                    ...task,
                    status: event.target.value,
                  })
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Assignee">
              <select
                value={task.assignee}
                onChange={(event) =>
                  setTask({
                    ...task,
                    assignee:
                      event.target.value,
                  })
                }
              >
                <option>
                  Nicole Gabutan
                </option>
                <option>
                  Maria Santos
                </option>
                <option>
                  John Cruz
                </option>
              </select>
            </Field>

            <Field label="Due date">
              <input
                type="date"
                value={task.due}
                onChange={(event) =>
                  setTask({
                    ...task,
                    due: event.target.value,
                  })
                }
              />
            </Field>
          </div>

          <Field label="Category">
            <input
              value={task.category}
              onChange={(event) =>
                setTask({
                  ...task,
                  category:
                    event.target.value,
                })
              }
              placeholder="e.g. Development"
            />
          </Field>
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            onClick={onCreate}
          >
            <Plus size={17} />
            Create Task
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   TASK DETAILS
========================================================= */

function TaskDetailsModal({
  task,
  onClose,
  onComplete,
  onDelete,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="modal-card details-modal">
        <div className="details-hero">
          <div className="details-glow" />

          <button
            className="modal-close hero-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

          <div className="details-hero-content">
            <div className="details-badges">
              <StatusBadge
                status={task.status}
                light
              />

              <PriorityBadge
                priority={task.priority}
                light
              />
            </div>

            <div className="details-category">
              {task.category}
            </div>

            <h2>{task.title}</h2>

            <p>
              Task #{task.id}
            </p>
          </div>
        </div>

        <div className="details-body">
          <div className="details-grid">
            <DetailItem
              icon={User}
              label="Assigned to"
              value={task.assignee}
            />

            <DetailItem
              icon={CalendarDays}
              label="Due date"
              value={task.due}
            />

            <DetailItem
              icon={AlertCircle}
              label="Priority"
              value={task.priority}
            />

            <DetailItem
              icon={CheckCircle2}
              label="Status"
              value={task.status}
            />
          </div>

          <div className="description-block">
            <span>Description</span>

            <p>
              {task.description ||
                "No description provided."}
            </p>
          </div>

          <div className="details-actions">
            {onDelete && (
              <button
                className="delete-button"
                onClick={() =>
                  onDelete(task.id)
                }
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            <div className="action-right">
              <button
                className="secondary-button"
                onClick={onClose}
              >
                Close
              </button>

              {task.status !==
                "Completed" && (
                <button
                  className="primary-button"
                  onClick={() =>
                    onComplete(task.id)
                  }
                >
                  <Check size={16} />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   USERS PAGE
========================================================= */

function UsersPage({ members, canManageUsers, onAddUser }) {
  return (
    <GlassCard className="workspace-card">
      <div className="section-header">
        <div>
          <h2>Team Members</h2>
          <p>
            People working in your workspace.
          </p>
        </div>

        {canManageUsers && (
          <button
            className="secondary-button"
            onClick={onAddUser}
          >
            <Plus size={16} />
            Add User
          </button>
        )}
      </div>

      <div className="user-grid">
        {members.map((user) => (
          <div
            className="user-card"
            key={`${user.name}-${user.email}`}
          >
            <Avatar
              initials={user.initials}
            />

            <div>
              <strong>{user.name}</strong>

              <span>{user.role}</span>
            </div>

            <div className="user-task-count">
              {user.tasks} tasks
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   TENANTS PAGE
========================================================= */

function TenantsPage({ tenants, canManageTenants, onNotify }) {
  return (
    <GlassCard className="workspace-card">
      <div className="section-header">
        <div>
          <h2>Organizations</h2>
          <p>
            Manage organizations using TaskFlow.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            onNotify(
              canManageTenants
                ? "Tenant creation is ready for backend integration."
                : "Only Super Admin can manage tenants."
            )
          }
          disabled={!canManageTenants}
        >
          <Plus size={16} />
          Add Organization
        </button>
      </div>

      <div className="tenant-list">
        {tenants.map((tenant) => (
          <div className="tenant-card" key={tenant.id}>
            <div className="tenant-icon">
              <Building2 size={22} />
            </div>

            <div>
              <strong>{tenant.name}</strong>
              <span>
                {tenant.status === "Active"
                  ? "Active organization"
                  : "Pending review"}
              </span>
            </div>

            <StatusBadge
              status={
                tenant.status === "Active"
                  ? "Completed"
                  : "In Progress"
              }
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   GLASS CARD
========================================================= */

function AiChatPanel({
  messages,
  value,
  onChange,
  onSend,
  isLoading,
}) {
  return (
    <div className="glass-card ai-chat-card">
      <div className="glass-content">
        <div className="section-header ai-chat-header">
          <div>
            <h2>
              <MessageSquareText size={18} />
              AI Assistant
            </h2>
            <p>Ask about tasks, system usage, and workflow guidance.</p>
          </div>

          <div className="ai-status">
            <ShieldCheck size={14} />
            Secure AI
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.sender === "user" ? "user-message" : "ai-message-bot"}`}
            >
              <div className="ai-message-icon">
                {message.sender === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>

              <div className="ai-message-text">{message.text}</div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-message ai-message-bot">
              <div className="ai-message-icon">
                <Bot size={13} />
              </div>

              <div className="ai-message-text">Generating response...</div>
            </div>
          )}
        </div>

        <div className="ai-chat-input-row">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ask the AI assistant about tasks or workflow..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSend();
              }
            }}
          />

          <button
            className="primary-button"
            type="button"
            onClick={onSend}
            disabled={isLoading || !value.trim()}
          >
            <SendHorizonal size={15} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function GlassCard({
  children,
  className = "",
}) {
  return (
    <div className={`glass-card ${className}`}>
      <div className="glass-highlight" />

      <div className="glass-content">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarSection({
  title,
  children,
}) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-title">
        {title}
      </div>

      {children}
    </div>
  );
}

function SidebarButton({
  active,
  icon: Icon,
  label,
  badge,
  count,
  onClick,
}) {
  return (
    <button
      className={`sidebar-button ${
        active ? "sidebar-button-active" : ""
      }`}
      onClick={onClick}
    >
      <span className="sidebar-button-icon">
        <Icon size={18} />
      </span>

      <span className="sidebar-button-label">
        {label}
      </span>

      {count !== undefined && (
        <span className="sidebar-count">
          {count}
        </span>
      )}

      {badge && (
        <span className="sidebar-badge">
          {badge}
        </span>
      )}
    </button>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  initials,
  small = false,
  tiny = false,
}) {
  let className = "avatar";

  if (small) {
    className += " avatar-small";
  }

  if (tiny) {
    className += " avatar-tiny";
  }

  return (
    <div className={className}>
      {initials}
    </div>
  );
}

/* =========================================================
   BADGES
========================================================= */

function StatusBadge({
  status,
  light = false,
}) {
  const classNames = {
    "To Do": "status-todo",
    "In Progress": "status-progress",
    Completed: "status-completed",
  };

  return (
    <span
      className={`status-badge ${
        classNames[status] || "status-todo"
      } ${light ? "badge-light" : ""}`}
    >
      <span className="status-dot" />
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
  light = false,
}) {
  const classNames = {
    High: "priority-high",
    Medium: "priority-medium",
    Low: "priority-low",
  };

  return (
    <span
      className={`priority-badge ${
        classNames[priority] || "priority-low"
      } ${light ? "badge-light" : ""}`}
    >
      {priority}
    </span>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {children}
    </label>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="detail-item">
      <div className="detail-item-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION
========================================================= */

function NotificationPanel({
  onClose,
}) {
  return (
    <div className="dropdown-panel notification-panel">
      <div className="dropdown-header">
        <strong>Notifications</strong>

        <button onClick={onClose}>
          Mark all read
        </button>
      </div>

      <div className="notification-item">
        <div className="notification-icon">
          <Clock3 size={16} />
        </div>

        <div>
          <strong>
            Website Redesign is due soon.
          </strong>

          <span>A few moments ago</span>
        </div>
      </div>

      <div className="notification-item">
        <div className="notification-icon notification-success">
          <CheckCircle2 size={16} />
        </div>

        <div>
          <strong>
            System Testing was completed.
          </strong>

          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfilePanel({
  onClose,
  onOpenProfile,
  onNotify,
  onLogout,
  userName,
  userRole,
}) {
  return (
    <div className="dropdown-panel profile-panel">
      <div className="profile-panel-user">
        <Avatar initials={userName?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "NG"} />

        <div>
          <strong>{userName || "Nicole Gabutan"}</strong>
          <span>{userRole || "Administrator"}</span>
        </div>
      </div>

      <button
        onClick={() => {
          onClose();
          onOpenProfile();
        }}
      >
        <User size={16} />
        My Profile
      </button>

      <button
        onClick={() => {
          onClose();
          onNotify("Opening settings.");
        }}
      >
        <Settings size={16} />
        Settings
      </button>

      <button
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        <X size={16} />
        Log out
      </button>
    </div>
  );
}

function ProfileDetailsModal({
  user,
  onClose,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="modal-card details-modal">
        <div className="details-hero">
          <div className="details-glow" />

          <button
            className="modal-close hero-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

          <div className="details-hero-content">
            <div className="details-badges">
              <StatusBadge status="Completed" light />
            </div>

            <div className="details-category">
              {user.department || "Operations"}
            </div>

            <h2>{user.name}</h2>

            <p>{user.role}</p>
          </div>
        </div>

        <div className="details-body">
          <div className="details-grid">
            <DetailItem icon={User} label="Full name" value={user.name} />
            <DetailItem icon={Building2} label="Department" value={user.department || "Operations"} />
            <DetailItem icon={Mail} label="Email" value={user.email || "Not provided"} />
            <DetailItem icon={Phone} label="Phone" value={user.phone || "Not provided"} />
          </div>

          <div className="description-block">
            <span>About</span>
            <p>
              This profile belongs to a workspace member with access to manage tasks, team coordination, and project priorities.
            </p>
          </div>

          <div className="details-actions">
            <div className="action-right">
              <button
                className="secondary-button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function SettingsModal({
  settings,
  setSettings,
  onClose,
}) {
  const toggle = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-card create-modal">
        <div className="modal-header">
          <div>
            <div className="modal-icon">
              <Settings size={19} />
            </div>

            <h2>System Settings</h2>

            <p>
              Front-end preferences for the administrator workspace.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="form-area">
          <div className="settings-list">
            <label className="setting-row">
              <div>
                <strong>Notifications</strong>
                <span>Show task and system alerts.</span>
              </div>

              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => toggle("notifications")}
              />
            </label>

            <label className="setting-row">
              <div>
                <strong>Compact mode</strong>
                <span>Reduce spacing for a denser dashboard.</span>
              </div>

              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={() => toggle("compactMode")}
              />
            </label>

            <label className="setting-row">
              <div>
                <strong>Auto refresh</strong>
                <span>Refresh task data automatically.</span>
              </div>

              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={() => toggle("autoRefresh")}
              />
            </label>

            <label className="setting-row">
              <div>
                <strong>Tenant-only view</strong>
                <span>Keep members and tasks confined to the selected tenant.</span>
              </div>

              <input
                type="checkbox"
                checked={settings.tenantOnlyView}
                onChange={() => toggle("tenantOnlyView")}
              />
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="primary-button"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AddMemberModal({
  member,
  setMember,
  onClose,
  onAdd,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="modal-card create-modal">
        <div className="modal-header">
          <div>
            <div className="modal-icon">
              <Users size={19} />
            </div>

            <h2>Add Member</h2>

            <p>
              Invite a new team member to the workspace.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="form-area">
          <Field label="Full name">
            <input
              autoFocus
              value={member.name}
              onChange={(event) =>
                setMember({
                  ...member,
                  name: event.target.value,
                })
              }
              placeholder="e.g. Ana Reyes"
            />
          </Field>

          <div className="form-grid">
            <Field label="Role">
              <select
                value={member.role}
                onChange={(event) =>
                  setMember({
                    ...member,
                    role: event.target.value,
                  })
                }
              >
                <option>Administrator</option>
                <option>Project Manager</option>
                <option>Developer</option>
                <option>Designer</option>
                <option>Support</option>
              </select>
            </Field>

            <Field label="Department">
              <input
                value={member.department}
                onChange={(event) =>
                  setMember({
                    ...member,
                    department: event.target.value,
                  })
                }
                placeholder="e.g. Engineering"
              />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Email">
              <input
                type="email"
                value={member.email}
                onChange={(event) =>
                  setMember({
                    ...member,
                    email: event.target.value,
                  })
                }
                placeholder="member@company.com"
              />
            </Field>

            <Field label="Phone">
              <input
                value={member.phone}
                onChange={(event) =>
                  setMember({
                    ...member,
                    phone: event.target.value,
                  })
                }
                placeholder="+63 9xx xxx xxxx"
              />
            </Field>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            onClick={onAdd}
          >
            <Plus size={17} />
            Add Member
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
  onCreate,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <CheckSquare size={23} />
      </div>

      <strong>{title}</strong>

      <span>{description}</span>

      {onCreate && (
        <button
          className="secondary-button"
          onClick={onCreate}
        >
          <Plus size={16} />
          Create Task
        </button>
      )}
    </div>
  );
}

/* =========================================================
   TOAST
========================================================= */

function Toast({
  message,
  type,
}) {
  return (
    <div
      className={`toast ${
        type === "error"
          ? "toast-error"
          : ""
      }`}
    >
      <div className="toast-icon">
        {type === "error" ? (
          <AlertCircle size={17} />
        ) : (
          <Check size={17} />
        )}
      </div>

      <span>{message}</span>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,
  onClose,
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="modal-animation">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  );
}

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NA";
}

export default App;