
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
    groep: GROUPS.NONE
  });
  
  const [editUser, setEditUser] = useState({
    id: 0,
    username: '',
    name: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    groep: GROUPS.NONE
  });
  
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  const handleAddUser = () => {
    if (!newUser.username || !newUser.name || !newUser.password) {
      toast.error('Alle velden zijn verplicht');
      return;
    }
    
    addUser(
      newUser.username, 
      newUser.password, 
      newUser.name, 
      newUser.role, 
      newUser.role === 'student' ? newUser.groep : undefined
    );
    
    toast.success('Gebruiker succesvol toegevoegd');
    setIsAddOpen(false);
    setNewUser({
      username: '',
      name: '',
      password: '',
      role: 'student',
      groep: GROUPS.NONE
    });
    setRefreshKey(prev => prev + 1);
  };
  
  const handleEditUser = () => {
    if (!editUser.username || !editUser.name) {
      toast.error('Gebruikersnaam en naam zijn verplicht');
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
      editUser.role === 'student' ? editUser.groep : undefined
    );
    
    toast.success('Gebruiker succesvol bijgewerkt');
    setIsEditOpen(false);
    setRefreshKey(prev => prev + 1);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      toast.success('Gebruiker succesvol verwijderd');
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
      groep: user.role === 'student' ? (user.groep || GROUPS.NONE) : GROUPS.NONE
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
  
  const getGroupBadgeColor = (groep: string) => {
    switch(groep) {
      case GROUPS.DIZA:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case GROUPS.DOZO:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case GROUPS.NONE:
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gebruikers beheren</h2>
        
        {/* Add User Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Voeg nieuwe gebruiker toe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Voeg nieuwe gebruiker toe</DialogTitle>
              <DialogDescription>
                Maak een nieuw gebruikersaccount aan. Alle velden zijn verplicht.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-username" className="text-right">
                  Gebruikersnaam
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
                  Naam
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
                  Wachtwoord
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
                  Rol
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'student' | 'teacher' | 'admin') => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Cursist</SelectItem>
                    <SelectItem value="teacher">Instructeur</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newUser.role === 'student' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-groep" className="text-right">
                    Groep
                  </Label>
                  <Select 
                    value={newUser.groep} 
                    onValueChange={(value: string) => setNewUser({...newUser, groep: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecteer groep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GROUPS.DIZA}>Diza</SelectItem>
                      <SelectItem value={GROUPS.DOZO}>Dozo</SelectItem>
                      <SelectItem value={GROUPS.NONE}>Geen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuleren</Button>
              <Button onClick={handleAddUser}>Gebruiker aanmaken</Button>
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
              <TableHead>Gebruikersnaam</TableHead>
              <TableHead>Naam</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Groep</TableHead>
              <TableHead className="text-right">Acties</TableHead>
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
                    {user.role === 'student' ? 'cursist' : user.role === 'teacher' ? 'instructeur' : 'admin'}
                  </span>
                </TableCell>
                <TableCell>
                  {user.role === 'student' && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getGroupBadgeColor(user.groep || GROUPS.NONE)}`}>
                      {user.groep || 'Geen'}
                    </span>
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
            <DialogTitle>Gebruiker bewerken</DialogTitle>
            <DialogDescription>
              Werkt de gebruikersinformatie bij. Laat wachtwoord leeg om het huidige te behouden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                Gebruikersnaam
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
                Naam
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
                Wachtwoord
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                placeholder="Laat leeg om het huidige te behouden"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rol
              </Label>
              <Select 
                value={editUser.role} 
                onValueChange={(value: 'student' | 'teacher' | 'admin') => setEditUser({...editUser, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Cursist</SelectItem>
                  <SelectItem value="teacher">Instructeur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editUser.role === 'student' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-groep" className="text-right">
                  Groep
                </Label>
                <Select 
                  value={editUser.groep} 
                  onValueChange={(value: string) => setEditUser({...editUser, groep: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer groep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GROUPS.DIZA}>Diza</SelectItem>
                    <SelectItem value={GROUPS.DOZO}>Dozo</SelectItem>
                    <SelectItem value={GROUPS.NONE}>Geen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuleren</Button>
            <Button onClick={handleEditUser}>Gebruiker bijwerken</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bevestig verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Annuleren</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Gebruiker verwijderen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
