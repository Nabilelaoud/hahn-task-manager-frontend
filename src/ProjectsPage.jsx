import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
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

  // edit task
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({
    title: "",
    description: "",
  });

  // edit project
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

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

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setEditingTaskId(null);
    setEditingProjectId(null);

    const tasksRes = await fetch(`${API_BASE}/projects/${project.id}/tasks`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    const tasksData = await tasksRes.json();
    setTasks(tasksData);

    const progRes = await fetch(
      `${API_BASE}/projects/${project.id}/progress`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    const progData = await progRes.json();
    setProgress(progData);
  };

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
        body: JSON.stringify({
          ...newTask,
          completed: false,
        }),
      }
    );

    if (res.ok) {
      setNewTask({ title: "", description: "" });
      await handleSelectProject(selectedProject);
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
      await handleSelectProject(selectedProject);
    }
  };

  // -------- Delete Task ----------
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
      await handleSelectProject(selectedProject);
    }
  };

  // -------- Edit Task ----------
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
      await handleSelectProject(selectedProject);
    }
  };

  // -------- Delete Project ----------
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

  // -------- Edit Project ----------
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

      // selectedProject
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject({
          ...selectedProject,
          ...editingProject,
        });
      }
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "24px",
      }}
    >
      {/* Sidebar: projects */}
      <aside
        style={{
          background: "rgba(15,23,42,0.9)",
          borderRadius: "16px",
          padding: "18px 18px 20px",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Projects</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 16 }}>
          {projects.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: 6,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handleSelectProject(p)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background:
                    selectedProject?.id === p.id
                      ? "rgba(59,130,246,0.2)"
                      : "transparent",
                  color: "#e5e7eb",
                  fontSize: 14,
                }}
              >
                {p.name}
              </button>

              {editingProjectId === p.id ? (
                <>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: "4px 6px", fontSize: 11 }}
                    onClick={() => saveEditProject(p)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: "4px 6px",
                      fontSize: 11,
                      background: "#6b7280",
                    }}
                    onClick={cancelEditProject}
                  >
                    X
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: "4px 6px", fontSize: 11 }}
                    onClick={() => startEditProject(p)}
                  >
                    E
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: "4px 6px",
                      fontSize: 11,
                      background: "#b91c1c",
                    }}
                    onClick={() => handleDeleteProject(p)}
                  >
                    D
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Edit project form (small, appears when a project is selected to edit) */}
        {editingProjectId && (
          <div
            style={{
              marginBottom: 12,
              padding: 8,
              borderRadius: 10,
              background: "#020617",
            }}
          >
            <h3 style={{ fontSize: 14, marginBottom: 6 }}>Edit Project</h3>
            <div style={{ display: "grid", gap: 6 }}>
              <input
                placeholder="Name"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, name: e.target.value })
                }
              />
              <textarea
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
              <div style={{ display: "flex", gap: 6 }}>
                <input
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

        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(55,65,81,0.8)",
          }}
        >
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Create Project</h3>
          <form onSubmit={handleCreateProject} style={{ display: "grid", gap: 8 }}>
            <input
              placeholder="Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="date"
                value={newProject.startDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, startDate: e.target.value })
                }
              />
              <input
                type="date"
                value={newProject.endDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, endDate: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn">
              Add Project
            </button>
          </form>
        </div>
      </aside>

      {/* Main content: tasks & progress */}
      <section
        style={{
          background: "rgba(15,23,42,0.9)",
          borderRadius: "16px",
          padding: "20px 22px 24px",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
      >
        {selectedProject ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ fontSize: 20 }}>{selectedProject.name}</h2>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                  {selectedProject.description || "No description"}
                </p>
              </div>

              {progress && (
                <div style={{ minWidth: 220 }}>
                  <p style={{ fontSize: 13, marginBottom: 6 }}>
                    {progress.completedTasks} of {progress.totalTasks} tasks
                    completed ·{" "}
                    {progress.percentage ? progress.percentage.toFixed(1) : 0}%
                  </p>
                  <div
                    style={{
                      background: "#020617",
                      width: "100%",
                      height: 10,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        background:
                          progress.percentage === 100 ? "#22c55e" : "#3b82f6",
                        width: `${progress.percentage || 0}%`,
                        height: "100%",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* Tasks list */}
              <div>
                <h3 style={{ fontSize: 15, marginBottom: 10 }}>Tasks</h3>
                {tasks.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>
                    No tasks yet. Create your first task on the right.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {tasks.map((t) => (
                      <li
                        key={t.id}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "#020617",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleTaskCompleted(t)}
                          />

                          {editingTaskId === t.id ? (
                            <div>
                              <input
                                style={{ fontSize: 14, marginBottom: 4 }}
                                value={editingTask.title}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    title: e.target.value,
                                  })
                                }
                              />
                              <textarea
                                rows={2}
                                style={{ fontSize: 12 }}
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
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  textDecoration: t.completed
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {t.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#9ca3af",
                                }}
                              >
                                {t.description}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 6 }}>
                          {editingTaskId === t.id ? (
                            <>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: "4px 8px", fontSize: 12 }}
                                onClick={() => saveEditTask(t)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn"
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 12,
                                  background: "#6b7280",
                                }}
                                onClick={cancelEditTask}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: "4px 8px", fontSize: 12 }}
                                onClick={() => startEditTask(t)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn"
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 12,
                                  background: "#b91c1c",
                                }}
                                onClick={() => handleDeleteTask(t)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add task form */}
              <div>
                <h3 style={{ fontSize: 15, marginBottom: 10 }}>Add Task</h3>
                <form
                  onSubmit={handleAddTask}
                  style={{ display: "grid", gap: 8 }}
                >
                  <input
                    placeholder="Title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                  <textarea
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
                  <button type="submit" className="btn">
                    Add Task
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 15,
            }}
          >
            Select a project on the left to see tasks.
          </div>
        )}
      </section>
    </div>
  );
}

export default ProjectsPage;
