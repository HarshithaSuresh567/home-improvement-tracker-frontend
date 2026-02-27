import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*");
    if (error) console.error("Error fetching projects:", error);
    else setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, fetchProjects };
};