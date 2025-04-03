
import { useState } from 'react';
import { 
  users, 
  addUser, 
  updateUser, 
  deleteUser,
  GROUPS
} from '@/utils/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Pencil, Trash, UserPlus } from 'lucide-react';

const UserManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    groep: ''
  });
  
  const [editUser, setEditUser] = useState({
    id: 0,
    username: '',
    name: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    groep: ''
  });
  
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  const handleAddUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      toast.error('All fields are required');
      return;
    }
    
    if (newUser.role === 'student' && !newUser.groep) {
      toast.error('Group selection is required for students');
      return;
    }
    
    addUser(
      newUser.username, 
      newUser.password, 
      newUser.name, 
      newUser.role,
      newUser.groep
    );
    
    toast.success('User added successfully');
    setIsAddOpen(false);
    setNewUser({
      username: '',
      name: '',
      password: '',
      role: 'student',
      groep: ''
    });
    setRefreshKey(prev => prev + 1);
  };
  
  const handleEditUser = () => {
    if (!editUser.username || !editUser.name) {
      toast.error('Username and name are required');
      return;
    }
    
    if (editUser.role === 'student' && !editUser.groep) {
      toast.error('Group selection is required for students');
      return;
    }
    
    // Only update password if it was changed (not empty)
    const passwordToUpdate = editUser.password.trim() === '' ? null : editUser.password;
    
    updateUser(
      editUser.id, 
      editUser.username, 
      passwordToUpdate, 
      editUser.name, 
      editUser.role,
      editUser.groep
    );
    
    toast.success('User updated successfully');
    setIsEditOpen(false);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      setUserToDelete(null);
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const prepareEditUser = (user: any) => {
    setEditUser({
      id: user.id,
      username: user.username,
      name: user.name,
      password: '', // Don't show existing password
      role: user.role,
      groep: user.groep || ''
    });
    setIsEditOpen(true);
  };
  
  const prepareDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteOpen(true);
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  const showGroupField = (role: 'student' | 'teacher' | 'admin') => {
    return role === 'student';
  };
  
  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        
        {/* Add User Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. All fields are required.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                    setNewUser({...newUser, role: value, groep: value !== 'student' ? '' : newUser.groep})
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showGroupField(newUser.role) && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Group
                  </Label>
                  <RadioGroup 
                    value={newUser.groep}
                    onValueChange={(value) => setNewUser({...newUser, groep: value})}
                    className="col-span-3 space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={GROUPS.DIZA} id="group-diza" />
                      <Label htmlFor="group-diza">DIZA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={GROUPS.NONE} id="group-none" />
                      <Label htmlFor="group-none">None</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* User Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {user.role === 'student' && (
                    user.groep ? user.groep : 'None'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => prepareEditUser(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => prepareDeleteUser(user.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                Username
              </Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                placeholder="Leave blank to keep current password"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select 
                value={editUser.role} 
                onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                  setEditUser({...editUser, role: value, groep: value !== 'student' ? '' : editUser.groep})
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showGroupField(editUser.role) && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Group
                </Label>
                <RadioGroup 
                  value={editUser.groep}
                  onValueChange={(value) => setEditUser({...editUser, groep: value})}
                  className="col-span-3 space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={GROUPS.DIZA} id="edit-group-diza" />
                    <Label htmlFor="edit-group-diza">DIZA</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={GROUPS.NONE} id="edit-group-none" />
                    <Label htmlFor="edit-group-none">None</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
