
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  getSubjectsByCategory, 
  updateSubjectActiveStatus,
  CATEGORIES,
} from '@/utils/supabaseData';
import { toast } from 'sonner';
import UserManagement from '@/components/UserManagement';
import { CategoryEnum } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CategoryEnum>(CATEGORIES.VERRICHTINGEN);
  const [refreshKey, setRefreshKey] = useState(0);
  const [subjects, setSubjects] = useState({
    [CATEGORIES.VERRICHTINGEN]: [],
    [CATEGORIES.ROEITECHNIEK]: [],
    [CATEGORIES.STUURKUNST]: []
  });
  const [loading, setLoading] = useState(true);
  const [togglesInProgress, setTogglesInProgress] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const verrichtingenSubjects = await getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
        const roeitechniekSubjects = await getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
        const stuurkunstSubjects = await getSubjectsByCategory(CATEGORIES.STUURKUNST);
        
        // Sort subjects by ID to maintain consistent order
        const sortSubjects = (subjects: any[]) => {
          return subjects.sort((a, b) => a.id - b.id);
        };
        
        setSubjects({
          [CATEGORIES.VERRICHTINGEN]: sortSubjects(verrichtingenSubjects),
          [CATEGORIES.ROEITECHNIEK]: sortSubjects(roeitechniekSubjects),
          [CATEGORIES.STUURKUNST]: sortSubjects(stuurkunstSubjects)
        });
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [refreshKey]);

  const handleSubjectToggle = async (subjectId: number, active: boolean) => {
    // Prevent multiple simultaneous toggles for the same subject
    if (togglesInProgress[subjectId]) return;
    
    // Mark this subject as being toggled
    setTogglesInProgress(prev => ({ ...prev, [subjectId]: true }));
    
    console.log(`Toggling subject ${subjectId} to ${active ? 'active' : 'inactive'}`);
    
    try {
      // Optimistically update the UI
      setSubjects(prevSubjects => {
        const updatedSubjects = { ...prevSubjects };
        
        Object.keys(updatedSubjects).forEach(category => {
          const categoryKey = category as CategoryEnum;
          updatedSubjects[categoryKey] = updatedSubjects[categoryKey].map(subject => 
            subject.id === subjectId ? { ...subject, active } : subject
          );
        });
        
        return updatedSubjects;
      });
      
      // Call the API to update the subject status
      const success = await updateSubjectActiveStatus(subjectId, active);
      
      if (!success) {
        // Revert the UI if the API call failed
        setSubjects(prevSubjects => {
          const updatedSubjects = { ...prevSubjects };
          
          Object.keys(updatedSubjects).forEach(category => {
            const categoryKey = category as CategoryEnum;
            updatedSubjects[categoryKey] = updatedSubjects[categoryKey].map(subject => 
              subject.id === subjectId ? { ...subject, active: !active } : subject
            );
          });
          
          return updatedSubjects;
        });
        
        // Force a refresh to ensure data is consistent
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error(`Error toggling subject ${subjectId}:`, error);
      toast.error('An error occurred while updating the subject');
      setRefreshKey(prev => prev + 1);
    } finally {
      // Clear the in-progress flag for this subject
      setTogglesInProgress(prev => {
        const updated = { ...prev };
        delete updated[subjectId];
        return updated;
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case CATEGORIES.VERRICHTINGEN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case CATEGORIES.ROEITECHNIEK:
        return 'bg-green-100 text-green-800 border-green-200';
      case CATEGORIES.STUURKUNST:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="container py-6" key={refreshKey}>
        <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="subjects" className="mb-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="subjects">Subject Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subject Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Enable or disable subjects for grading by teachers. Disabled subjects cannot be graded.
                </p>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryEnum)} className="space-y-4">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
                      <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
                      <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={CATEGORIES.VERRICHTINGEN} className="space-y-4">
                      <div className="grid gap-4">
                        {subjects[CATEGORIES.VERRICHTINGEN].map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{subject.name}</h3>
                              <Badge variant="outline" className={`mt-1 ${getCategoryColor(subject.category)}`}>
                                {subject.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`subject-${subject.id}`}
                                checked={subject.active}
                                disabled={togglesInProgress[subject.id]}
                                onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked)}
                              />
                              <Label htmlFor={`subject-${subject.id}`}>
                                {subject.active ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value={CATEGORIES.ROEITECHNIEK} className="space-y-4">
                      <div className="grid gap-4">
                        {subjects[CATEGORIES.ROEITECHNIEK].map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{subject.name}</h3>
                              <Badge variant="outline" className={`mt-1 ${getCategoryColor(subject.category)}`}>
                                {subject.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`subject-${subject.id}`}
                                checked={subject.active}
                                disabled={togglesInProgress[subject.id]}
                                onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked)}
                              />
                              <Label htmlFor={`subject-${subject.id}`}>
                                {subject.active ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value={CATEGORIES.STUURKUNST} className="space-y-4">
                      <div className="grid gap-4">
                        {subjects[CATEGORIES.STUURKUNST].map((subject) => (
                          <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{subject.name}</h3>
                              <Badge variant="outline" className={`mt-1 ${getCategoryColor(subject.category)}`}>
                                {subject.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`subject-${subject.id}`}
                                checked={subject.active}
                                disabled={togglesInProgress[subject.id]}
                                onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked)}
                              />
                              <Label htmlFor={`subject-${subject.id}`}>
                                {subject.active ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p>This is an admin-only panel for managing the student dashboard system.</p>
          <p>Only head teachers with admin privileges can access this page.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
