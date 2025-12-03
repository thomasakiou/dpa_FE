import React, { useState, useEffect } from 'react';
import AddMemberModal, { MemberFormData } from '../../components/AddMemberModal';
import EditMemberModal, { EditMemberFormData } from '../../components/EditMemberModal';
import Pagination from '../../components/Pagination';
import { adminService } from '../../services/admin';
import { components } from '../../types/schema';

type UserResponse = components['schemas']['UserResponse'];

const MemberManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(null);

  const [members, setMembers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setMembers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData: MemberFormData) => {
    try {
      await adminService.createUser(memberData);
      setIsAddModalOpen(false);
      fetchMembers(); // Refresh the list
      alert('Member added successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add member');
      console.error('Error adding member:', err);
    }
  };

  const handleEditClick = (member: UserResponse) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (userId: number, memberData: EditMemberFormData) => {
    try {
      await adminService.updateUser(userId, memberData);
      setIsEditModalOpen(false);
      setSelectedMember(null);
      fetchMembers();
      alert('Member updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update member');
      console.error('Error updating member:', err);
    }
  };

  const handleSuspend = async (userId: number) => {
    if (!confirm('Are you sure you want to suspend this member?')) return;
    try {
      console.log('Suspending user:', userId);
      const result = await adminService.suspendUser(userId);
      console.log('Suspend result:', result);
      await fetchMembers();
      alert('Member suspended successfully!');
    } catch (err: any) {
      console.error('Suspend error:', err);
      alert(err.response?.data?.detail || 'Failed to suspend member');
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      await adminService.activateUser(userId);
      fetchMembers();
      alert('Member activated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to activate member');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'inactive': return 'red';
      default: return 'gray';
    }
  };

  const filteredMembers = members
    .filter(member => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.phone && member.phone.includes(searchQuery));

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.member_id.localeCompare(b.member_id));

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold">Member Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Member</span>
        </button>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateMember}
        member={selectedMember}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="flex flex-col w-full h-12">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-500 dark:text-gray-400 flex bg-gray-100 dark:bg-gray-700 items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-0 bg-gray-100 dark:bg-gray-700 h-full placeholder:text-gray-500 px-4 text-sm"
                  placeholder="Search by name, ID, or phone..."
                />
              </div>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none h-12 pl-4 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="suspended">Status: Suspended</option>
                <option value="inactive">Status: Inactive</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-red-500 text-5xl mb-2">error</span>
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchMembers}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-gray-400 text-5xl mb-2">group</span>
              <p className="text-gray-500 dark:text-gray-400">No members found</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3">Member ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{member.member_id}</td>
                    <td className="px-6 py-4">{member.full_name}</td>
                    <td className="px-6 py-4">{member.email}</td>
                    <td className="px-6 py-4">{member.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(member.status)}-100 text-${getStatusColor(member.status)}-800 dark:bg-${getStatusColor(member.status)}-900 dark:text-${getStatusColor(member.status)}-300`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(member)}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                          title="Edit Member"
                        >
                          Edit
                        </button>
                        {member.status === 'active' ? (
                          <button
                            onClick={() => handleSuspend(member.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600"
                            title="Suspend Member"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(member.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                            title="Activate Member"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && !error && members.length > 0 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default MemberManagement;