"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  LogOut, 
  User,
  CheckCircle2,
  Circle,
  BarChart3,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { taskApi, Task, TaskStatus } from "@/services/task.service";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const { toast } = useToast();

  // Get loading state from store
  const authLoading = useAuthStore((state) => state.isLoading);

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if not authenticated (but only after loading completes)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Fetch tasks with debounce on search
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks({
        page,
        limit: 9,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setTasks(response.tasks);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch tasks",
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, toast]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await taskApi.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchStats();
    }
  }, [isAuthenticated, fetchTasks, fetchStats]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchTasks();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Please try again",
      });
    }
  };

  // Handle create task
  const handleCreateTask = async () => {
    if (!formTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a task title",
      });
      return;
    }

    setFormSubmitting(true);
    try {
      await taskApi.createTask({
        title: formTitle,
        description: formDescription || undefined,
      });
      
      toast({
        title: "Task created!",
        description: "Your task has been added successfully",
      });
      
      setCreateDialogOpen(false);
      setFormTitle("");
      setFormDescription("");
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle edit task
  const handleEditTask = async () => {
    if (!currentTask || !formTitle.trim()) return;

    setFormSubmitting(true);
    try {
      await taskApi.updateTask(currentTask.id, {
        title: formTitle,
        description: formDescription || undefined,
      });
      
      toast({
        title: "Task updated!",
        description: "Your changes have been saved",
      });
      
      setEditDialogOpen(false);
      setCurrentTask(null);
      setFormTitle("");
      setFormDescription("");
      fetchTasks();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!currentTask) return;

    setFormSubmitting(true);
    try {
      await taskApi.deleteTask(currentTask.id);
      
      toast({
        title: "Task deleted",
        description: "The task has been removed",
      });
      
      setDeleteDialogOpen(false);
      setCurrentTask(null);
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (task: Task) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => 
        t.id === task.id 
          ? { ...t, status: t.status === "PENDING" ? "COMPLETED" : "PENDING" }
          : t
      ));

      await taskApi.toggleTaskStatus(task.id);
      
      toast({
        title: "Status updated",
        description: `Task marked as ${task.status === "PENDING" ? "completed" : "pending"}`,
      });
      
      fetchStats();
    } catch (error: any) {
      // Revert on error
      fetchTasks();
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.message || "Please try again",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setDeleteDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user?.email || "User"}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <Circle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats.pending}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tasks</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass">
                <CardHeader>
                  <div className="h-6 bg-muted rounded shimmer w-3/4" />
                  <div className="h-4 bg-muted rounded shimmer w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded shimmer w-full" />
                  <div className="h-4 bg-muted rounded shimmer w-5/6 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6 float">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "No tasks match your filters"
                : "Create your first task to get started"}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 line-clamp-2">
                              {task.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }`}
                              >
                                {task.status === "COMPLETED" ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Circle className="h-3 w-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleToggleStatus(task)}
                              title={task.status === "PENDING" ? "Mark as completed" : "Mark as pending"}
                            >
                              {task.status === "PENDING" ? (
                                <Circle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openDeleteDialog(task)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your list. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                placeholder="Enter task title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <textarea
                id="create-description"
                placeholder="Enter task description (optional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setFormTitle("");
                setFormDescription("");
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!formTitle.trim() || formSubmitting}
            >
              {formSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter task title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                placeholder="Enter task description (optional)"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setCurrentTask(null);
                setFormTitle("");
                setFormDescription("");
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTask}
              disabled={!formTitle.trim() || formSubmitting}
            >
              {formSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentTask && (
            <div className="py-4">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-base">{currentTask.title}</CardTitle>
                  {currentTask.description && (
                    <CardDescription className="line-clamp-2">
                      {currentTask.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCurrentTask(null);
              }}
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={formSubmitting}
            >
              {formSubmitting ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
