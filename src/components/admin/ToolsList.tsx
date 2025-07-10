import React, { useState } from 'react';
import { Edit, Trash2, Check, X, Filter, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { Tool } from '../../types';
import { StatusDropdown } from './StatusDropdown';
import { supabase } from '../../lib/supabase';

interface ToolsListProps {
  tools: Tool[];
  isLoading: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (toolId: string) => void;
  onApproveReject: (toolId: string, status: 'approved' | 'rejected') => void;
  onApproveAll: () => void;
}

export const ToolsList: React.FC<ToolsListProps> = ({
  tools,
  isLoading,
  onEdit,
  onDelete,
  onApproveReject,
  onApproveAll
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created_on' | 'updated_at'>('created_on');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const toggleSort = (field: 'name' | 'created_on' | 'updated_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredTools = tools.filter(tool => {
    // Filter by status
    if (statusFilter !== 'all' && tool.submission_status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !tool.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort tools
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'updated_at') {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_on).getTime();
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_on).getTime();
      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    } else {
      const dateA = new Date(a.created_on).getTime();
      const dateB = new Date(b.created_on).getTime();
      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }
  });

  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-alpine-blue-100 text-alpine-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle status change
  const handleStatusChange = async (toolId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('update_tool_status', {
        p_tool_id: toolId,
        p_status: newStatus
      });
      
      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }
      
      // Close the dropdown
      setEditingStatusId(null);
      
      // Refresh the tool list (handled by parent)
      if (newStatus === 'approved' || newStatus === 'rejected') {
        onApproveReject(toolId, newStatus as any);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Count tools with submitted status
  const submittedToolsCount = tools.filter(tool => tool.submission_status === 'submitted').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tools...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Tools</h2>
            <p className="text-sm text-gray-500">{filteredTools.length} tools</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center">
                  <span>Tool Name</span>
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="w-4 h-4 ml-1" /> : 
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('created_on')}
              >
                <div className="flex items-center">
                  <span>Created Date</span>
                  {sortField === 'created_on' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="w-4 h-4 ml-1" /> : 
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('updated_at')}
              >
                <div className="flex items-center">
                  <span>Last Modified</span>
                  {sortField === 'updated_at' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="w-4 h-4 ml-1" /> : 
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTools.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tools found matching your criteria.
                </td>
              </tr>
            ) : (
              sortedTools.map(tool => (
                <React.Fragment key={tool.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500">{tool.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(tool.tags) && tool.tags.slice(0, 3).map((tag: any, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-alpine-blue-100 text-alpine-blue-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {Array.isArray(tool.tags) && tool.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{tool.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tool.created_on)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tool.updated_at ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(tool.updated_at)}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(tool.created_on)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStatusId === tool.id ? (
                        <StatusDropdown 
                          currentStatus={tool.submission_status}
                          onStatusChange={(status) => handleStatusChange(tool.id, status)}
                          onClose={() => setEditingStatusId(null)}
                        />
                      ) : (
                        <button 
                          onClick={() => setEditingStatusId(tool.id)}
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tool.submission_status)} hover:bg-gray-200 transition-colors cursor-pointer`}
                        >
                          {tool.submission_status.charAt(0).toUpperCase() + tool.submission_status.slice(1)}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {tool.submission_status === 'submitted' && (
                          <>
                            <button
                              onClick={() => onApproveReject(tool.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onApproveReject(tool.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onEdit(tool)}
                          className="text-alpine-blue-500 hover:text-alpine-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(tool.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setExpandedToolId(expandedToolId === tool.id ? null : tool.id)}
                          className="text-gray-500 hover:text-gray-700"
                          title={expandedToolId === tool.id ? "Collapse" : "Expand"}
                        >
                          {expandedToolId === tool.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedToolId === tool.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Criteria Ratings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.isArray(tool.criteria) && tool.criteria.map((criterion: any, index: number) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{criterion.name}</span>
                                  <span className={`font-semibold ${
                                    criterion.ranking >= 4 ? 'text-green-600' :
                                    criterion.ranking >= 3 ? 'text-alpine-blue-500' :
                                    'text-gray-600'
                                  }`}>{criterion.ranking}/5</span>
                                </div>
                                <p className="text-xs text-gray-500">{criterion.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};