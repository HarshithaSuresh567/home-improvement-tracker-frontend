// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Projects state
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      console.error("Error fetching projects:", error.message);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) {
      console.error("Error fetching tasks:", error.message);
    } else {
      setTasks(data);
    }
    setLoading(false);
  };

  // Fetch expenses from Supabase
  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("expenses").select("*");
    if (error) {
      console.error("Error fetching expenses:", error.message);
    } else {
      setExpenses(data);
    }
    setLoading(false);
  };

  // Refresh all data
  const refreshAll = async () => {
    await fetchProjects();
    await fetchTasks();
    await fetchExpenses();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        expenses,
        loading,
        fetchProjects,
        fetchTasks,
        fetchExpenses,
        refreshAll,
        setProjects,
        setTasks,
        setExpenses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};