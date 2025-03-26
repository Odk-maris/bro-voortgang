
import { useState } from 'react';
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
} from '@/utils/mockData';
import { toast } from 'sonner';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(CATEGORIES.VERRICHTINGEN);
  const [refreshKey, setRefreshKey] = useState(0);

  const verrichtingenSubjects = getSubjectsByCategory(CATEGORIES.VERRICHTINGEN);
  const roeitechniekSubjects = getSubjectsByCategory(CATEGORIES.ROEITECHNIEK);
  const stuurkunstSubjects = getSubjectsByCategory(CATEGORIES.STUURKUNST);

  const handleSubjectToggle = (subjectId: number, active: boolean) => {
    updateSubjectActiveStatus(subjectId, active);
    
    toast.success(`Subject status updated`, {
      description: `Subject has been ${active ? 'enabled' : 'disabled'} for grading.`,
    });
    
    // Force a re-render
    setRefreshKey(prev => prev + 1);
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
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subject Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Enable or disable subjects for grading by teachers. Disabled subjects cannot be graded.
            </p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value={CATEGORIES.VERRICHTINGEN}>Verrichtingen</TabsTrigger>
                <TabsTrigger value={CATEGORIES.ROEITECHNIEK}>Roeitechniek</TabsTrigger>
                <TabsTrigger value={CATEGORIES.STUURKUNST}>Stuurkunst</TabsTrigger>
              </TabsList>
              
              <TabsContent value={CATEGORIES.VERRICHTINGEN} className="space-y-4">
                <div className="grid gap-4">
                  {verrichtingenSubjects.map((subject) => (
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
                  {roeitechniekSubjects.map((subject) => (
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
                  {stuurkunstSubjects.map((subject) => (
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
          </CardContent>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p>This is an admin-only panel for managing the student dashboard system.</p>
          <p>Only head teachers with admin privileges can access this page.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
