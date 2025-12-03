
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { membersService } from '../../services/members';
import { authService } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';
import { components } from '../../types/schema';

type UserResponse = components['schemas']['UserResponse'];
type UserUpdate = components['schemas']['UserUpdate'];

const Settings: React.FC = () => {
   const { logout, user: authUser } = useAuth();
   const { addToast } = useToast();
   const [profile, setProfile] = useState<UserResponse | null>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   // Password state
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [passwordSaving, setPasswordSaving] = useState(false);

   // Form state
   const [formData, setFormData] = useState<UserUpdate>({
      full_name: '',
      email: '',
      phone: '',
      member_id: '',
   });

   useEffect(() => {
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      try {
         const data = await membersService.getProfile();
         setProfile(data);
         setFormData({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone || '',
            member_id: data.member_id,
         });
      } catch (error) {
         console.error('Failed to fetch profile', error);
         addToast('Failed to load profile data', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSaveProfile = async () => {
      setSaving(true);
      try {
         await membersService.updateProfile(formData);
         addToast('Profile updated successfully', 'success');
         fetchProfile(); // Refresh data
      } catch (error) {
         console.error('Failed to update profile', error);
         addToast('Failed to update profile', 'error');
      } finally {
         setSaving(false);
      }
   };

   const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
         addToast('New passwords do not match', 'error');
         return;
      }

      if (!currentPassword || !newPassword) {
         addToast('Please fill in all password fields', 'error');
         return;
      }

      setPasswordSaving(true);
      try {
         await authService.changePassword({
            old_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
         });
         addToast('Password changed successfully', 'success');
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (error) {
         console.error('Failed to change password', error);
         addToast('Failed to change password. Please check your current password.', 'error');
      } finally {
         setPasswordSaving(false);
      }
   };

   if (loading) {
      return <div className="p-10 text-center">Loading profile...</div>;
   }

   return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-8">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Settings</h1>
         </div>

         {/* Personal Info */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Personal Information</h2>
            <div className="p-6 flex flex-col gap-6">
               <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400">
                        {profile?.full_name?.charAt(0) || 'U'}
                     </div>
                     <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name}</p>
                        <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                     <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Full Name</span>
                     <input
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleInputChange}
                        className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     />
                  </label>
                  <label className="flex flex-col">
                     <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Email Address</span>
                     <input
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     />
                  </label>
                  <label className="flex flex-col">
                     <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Phone Number</span>
                     <input
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     />
                  </label>
                  <label className="flex flex-col">
                     <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Member ID</span>
                     <input
                        name="member_id"
                        value={formData.member_id || ''}
                        onChange={handleInputChange}
                        className="form-input h-12 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 px-4"
                        readOnly // Assuming Member ID is not editable by user
                     />
                  </label>
               </div>
               <div className="flex justify-end pt-2">
                  <button
                     onClick={handleSaveProfile}
                     disabled={saving}
                     className="h-12 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                     {saving ? 'Saving...' : 'Save Changes'}
                  </button>
               </div>
            </div>
         </div>

         {/* Security */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Security</h2>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <label className="flex flex-col md:col-span-2">
                  <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Current Password</span>
                  <input
                     type="password"
                     value={currentPassword}
                     onChange={(e) => setCurrentPassword(e.target.value)}
                     className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     placeholder="Enter current password"
                  />
               </label>
               <label className="flex flex-col">
                  <span className="text-base font-medium text-gray-900 dark:text-white mb-2">New Password</span>
                  <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     placeholder="Enter new password"
                  />
               </label>
               <label className="flex flex-col">
                  <span className="text-base font-medium text-gray-900 dark:text-white mb-2">Confirm New Password</span>
                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="form-input h-12 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-gray-900 dark:text-white px-4"
                     placeholder="Confirm new password"
                  />
               </label>
               <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                     onClick={handleChangePassword}
                     disabled={passwordSaving}
                     className="h-12 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                     {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
               </div>
            </div>
         </div>

         {/* Account */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold px-6 py-5 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Account</h2>
            <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log Out</h3>
                  <p className="text-gray-500 dark:text-gray-400">Logging out will end your current session. You will need to sign in again to access your account.</p>
               </div>
               <button
                  onClick={logout}
                  className="h-12 px-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 whitespace-nowrap"
               >
                  Log Out of Account
               </button>
            </div>
         </div>
      </div>
   );
};

export default Settings;
