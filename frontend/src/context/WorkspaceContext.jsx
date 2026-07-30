import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectService } from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!token && !isAuthenticated) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await ProjectService.getProjects();
      setWorkspaces(list || []);
      
      const savedActiveId = localStorage.getItem('synaps_active_project');
      if (savedActiveId && list.length > 0) {
        const found = list.find(w => w.project_id === Number(savedActiveId));
        if (found) {
          setActiveWorkspace(found);
        } else {
          setActiveWorkspace(list[0]);
        }
      } else if (list.length > 0) {
        setActiveWorkspace(list[0]);
      } else {
        setActiveWorkspace(null);
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token, isAuthenticated]);

  const selectWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    if (workspace && workspace.project_id) {
      localStorage.setItem('synaps_active_project', workspace.project_id);
    }
  };

  const createWorkspace = async (name, description) => {
    const newWs = await ProjectService.createProject(name, description);
    await fetchWorkspaces();
    selectWorkspace(newWs);
    return newWs;
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, selectWorkspace, createWorkspace, fetchWorkspaces, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
