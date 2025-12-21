// src/ProjectsPage.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });
  const [progress, setProgress] = useState(null);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({
    title: "",
    description: "",
  });

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // ---- API helpers ----
  const loadProjects = async () => {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return;
    const data = await res.json();
    setProjects(data);
  };

  const loadProjectDetails = async (project) => {
    setSelectedProject(project);
    setEditingTaskId(null);
    setEditingProjectId(null);

    const [tasksRes, progRes] = await Promise.all([
      fetch(`${API_BASE}/projects/${project.id}/tasks`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      }),
      fetch(`${API_BASE}/projects/${project.id}/progress`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      }),
    ]);

    if (tasksRes.ok) {
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    }

    if (progRes.ok) {
      const progData = await progRes.json();
      setProgress(progData);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ---- Project CRUD ----
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(newProject),
    });

    if (res.ok) {
      setNewProject({ name: "", description: "", startDate: "", endDate: "" });
      await loadProjects();
    }
  };

  const handleDeleteProject = async (project) => {
    const res = await fetch(`${API_BASE}/projects/${project.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
        setTasks([]);
        setProgress(null);
      }
      await loadProjects();
    }
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id);
    setEditingProject({
      name: project.name || "",
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setEditingProject({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    });
  };

  const saveEditProject = async (project) => {
    const res = await fetch(`${API_BASE}/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(editingProject),
    });

    if (res.ok) {
      setEditingProjectId(null);
      await loadProjects();

      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject({ ...selectedProject, ...editingProject });
      }
    }
  };

  // ---- Task CRUD ----
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    const res = await fetch(
      `${API_BASE}/projects/${selectedProject.id}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ ...newTask, completed: false }),
      }
    );

    if (res.ok) {
      setNewTask({ title: "", description: "" });
      await loadProjectDetails(selectedProject);
    }
  };

  const toggleTaskCompleted = async (task) => {
    const res = await fetch(`${API_BASE}/projects/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (res.ok) {
      await loadProjectDetails(selectedProject);
    }
  };

  const handleDeleteTask = async (task) => {
    const res = await fetch(`${API_BASE}/projects/tasks/${task.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      if (editingTaskId === task.id) {
        setEditingTaskId(null);
      }
      await loadProjectDetails(selectedProject);
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      title: task.title,
      description: task.description || "",
    });
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTask({ title: "", description: "" });
  };

  const saveEditTask = async (task) => {
    const res = await fetch(`${API_BASE}/projects/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        title: editingTask.title,
        description: editingTask.description,
        completed: task.completed,
      }),
    });

    if (res.ok) {
      setEditingTaskId(null);
      setEditingTask({ title: "", description: "" });
      await loadProjectDetails(selectedProject);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar: projects */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Projects</h2>
          <p className="sidebar-subtitle">
            Manage your projects and quickly switch between them.
          </p>
        </div>

        <ul className="project-list">
          {projects.map((p) => {
            const isActive = selectedProject?.id === p.id;
            return (
              <li
                key={p.id}
                className={`project-item ${isActive ? "project-item-active" : ""}`}
              >
                <button
                  type="button"
                  className="project-main"
                  onClick={() => loadProjectDetails(p)}
                >
                  <span className="project-name">{p.name}</span>
                  <span className="project-dates">
                    {p.startDate || "–"} → {p.endDate || "–"}
                  </span>
                </button>

                <div className="project-actions">
                  {editingProjectId === p.id ? (
                    <>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => saveEditProject(p)}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-muted"
                        onClick={cancelEditProject}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEditProject(p)}
                        title="Edit project"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => handleDeleteProject(p)}
                        title="Delete project"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {editingProjectId && (
          <div className="card card-inline">
            <h3 className="card-title">Edit project</h3>
            <div className="form-grid">
              <input
                className="field-input"
                placeholder="Name"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, name: e.target.value })
                }
              />
              <textarea
                className="field-input"
                rows={2}
                placeholder="Description"
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    description: e.target.value,
                  })
                }
              />
              <div className="two-cols">
                <input
                  className="field-input"
                  type="date"
                  value={editingProject.startDate}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      startDate: e.target.value,
                    })
                  }
                />
                <input
                  className="field-input"
                  type="date"
                  value={editingProject.endDate}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="card card-inline">
          <h3 className="card-title">Create project</h3>
          <form onSubmit={handleCreateProject} className="form-grid">
            <input
              className="field-input"
              placeholder="Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
            <textarea
              className="field-input"
              rows={2}
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <div className="two-cols">
              <input
                className="field-input"
                type="date"
                value={newProject.startDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, startDate: e.target.value })
                }
              />
              <input
                className="field-input"
                type="date"
                value={newProject.endDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, endDate: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-full">
              Add project
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <section className="main">
        {selectedProject ? (
          <>
            <header className="project-header">
              <div>
                <h2 className="project-title">{selectedProject.name}</h2>
                <p className="project-desc">
                  {selectedProject.description || "No description provided."}
                </p>
              </div>

              {progress && (
                <div className="progress-card">
                  <div className="progress-top">
                    <span className="progress-label">
                      {progress.completedTasks} of {progress.totalTasks} tasks
                      completed
                    </span>
                    <span className="progress-percent">
                      {progress.percentage ? progress.percentage.toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progress.percentage || 0}%`,
                        backgroundColor:
                          progress.percentage === 100 ? "#22c55e" : "#3b82f6",
                      }}
                    />
                  </div>
                </div>
              )}
            </header>

            <div className="main-grid">
              {/* Tasks list */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Tasks</h3>
                  <span className="card-badge">
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {tasks.length === 0 ? (
                  <p className="empty-text">
                    No tasks yet. Create your first task on the right.
                  </p>
                ) : (
                  <ul className="task-list">
                    {tasks.map((t) => {
                      const isEditing = editingTaskId === t.id;
                      return (
                        <li
                          key={t.id}
                          className={`task-item ${
                            t.completed ? "task-item-completed" : ""
                          }`}
                        >
                          <div className="task-main">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => toggleTaskCompleted(t)}
                            />

                            {isEditing ? (
                              <div className="task-edit-block">
                                <input
                                  className="field-input"
                                  value={editingTask.title}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
                                      title: e.target.value,
                                    })
                                  }
                                />
                                <textarea
                                  className="field-input"
                                  rows={2}
                                  value={editingTask.description}
                                  onChange={(e) =>
                                    setEditingTask({
                                      ...editingTask,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            ) : (
                              <div className="task-text">
                                <div className="task-title">{t.title}</div>
                                {t.description && (
                                  <div className="task-desc">
                                    {t.description}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="task-actions">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-xs"
                                  onClick={() => saveEditTask(t)}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-muted"
                                  onClick={cancelEditTask}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-xs"
                                  onClick={() => startEditTask(t)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-danger"
                                  onClick={() => handleDeleteTask(t)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Add task */}
              <div className="card">
                <h3 className="card-title">Add task</h3>
                <form onSubmit={handleAddTask} className="form-grid">
                  <input
                    className="field-input"
                    placeholder="Title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                  <textarea
                    className="field-input"
                    rows={3}
                    placeholder="Description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        description: e.target.value,
                      })
                    }
                  />
                  <button type="submit" className="btn btn-full">
                    Add task
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration" />
            <div>
              <h2 className="empty-title">No project selected</h2>
              <p className="empty-text">
                Choose a project in the sidebar or create a new one to start
                managing tasks.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProjectsPage;
