import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { ToolsList } from './ToolsList';
import { EditToolForm } from './EditToolForm';
import { AdminToolForm } from './AdminToolForm';
import { Tool, Criterion } from '@/shared/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { Header } from '@/components/layout/Header';

export const AdminDashboard: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchTools();
      fetchCriteria();
    }
  }, [user]);
  
  const fetchTools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use admin_tools_view to get all tools regardless of status
      const { data, error } = await supabase
        .from('admin_tools_view')
        .select('*')
        .order('created_on', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        console.log('Fetched tools:', data);
        
        // Add updated_at field if it doesn't exist
        const toolsWithUpdated = data.map((tool: any) => ({
          ...tool,
          updated_at: tool.updated_at || tool.submitted_at || tool.approved_at || tool.created_on
        }));
        
        setTools(toolsWithUpdated as Tool[]);
      }
    } catch (err: any) {
      console.error('Error fetching tools:', err);
      setError(`Failed to load tools: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from('criteria')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        // Transform database criteria to match Criterion type
        const formattedCriteria: Criterion[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || 'No description available',
          userRating: 3,
          ratingDescriptions: {
            low: 'Basic functionality',
            high: 'Advanced features'
          }
        }));
        
        setCriteria(formattedCriteria);
      }
    } catch (err: any) {
      console.error('Error fetching criteria:', err);
      setError(`Failed to load criteria: ${err.message}`);
    }
  };
  
  const handleEditTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsEditing(true);
    setIsAddingTool(false);
  };
  
  const handleAddNewTool = () => {
    setIsAddingTool(true);
    setIsEditing(false);
    setSelectedTool(null);
  };
  
  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);
        
      if (error) throw error;
      
      // Refresh the tools list
      fetchTools();
    } catch (err: any) {
      console.error('Error deleting tool:', err);
      setError(`Failed to delete tool: ${err.message}`);
    }
  };
  
  const handleApproveRejectTool = async (toolId: string, status: 'approved' | 'rejected') => {
    try {
      setError(null);
      
      // Use the update_tool_status RPC function instead of direct update
      const { error } = await supabase.rpc('update_tool_status', {
        p_tool_id: toolId,
        p_status: status
      });
      
      if (error) throw error;
      
      // Refresh the tools list
      fetchTools();
    } catch (err: any) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} tool:`, err);
      setError(`Failed to ${status === 'approved' ? 'approve' : 'reject'} tool: ${err.message}`);
    }
  };
  
  const handleApproveAll = async () => {
    try {
      setError(null);
      
      const submittedTools = tools.filter(tool => tool.submission_status === 'submitted');
      
      if (submittedTools.length === 0) {
        return;
      }
      
      // Process each tool individually using the RPC function
      const promises = submittedTools.map(tool =>
        supabase.rpc('update_tool_status', {
          p_tool_id: tool.id,
          p_status: 'approved'
        })
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        console.error('Errors approving tools:', errors);
        throw new Error(`Failed to approve ${errors.length} tools`);
      }
      
      // Refresh the tools list
      fetchTools();
    } catch (err: any) {
      console.error('Error approving all tools:', err);
      setError(`Failed to approve all tools: ${err.message}`);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
            Please sign in to access the admin dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tool Management Dashboard</h1>
          <button 
            onClick={handleAddNewTool}
            className="flex items-center px-4 py-2 bg-alpine-blue-500 text-white rounded-lg hover:bg-alpine-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Tool
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {isAddingTool && (
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <AdminToolForm 
              onClose={() => setIsAddingTool(false)}
              onSuccess={() => {
                setIsAddingTool(false);
                fetchTools();
              }}
              selectedCriteria={criteria}
            />
          </div>
        )}
        
        {isEditing && selectedTool ? (
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <EditToolForm 
              tool={selectedTool}
              onClose={() => {
                setIsEditing(false);
                setSelectedTool(null);
              }}
              onSuccess={() => {
                setIsEditing(false);
                setSelectedTool(null);
                fetchTools();
              }}
            />
          </div>
        ) : (
          !isAddingTool && (
            <ToolsList 
              tools={tools} 
              isLoading={isLoading}
              onEdit={handleEditTool}
              onDelete={handleDeleteTool}
              onApproveReject={handleApproveRejectTool}
              onApproveAll={handleApproveAll}
            />
          )
        )}
      </div>
    </div>
  );
};