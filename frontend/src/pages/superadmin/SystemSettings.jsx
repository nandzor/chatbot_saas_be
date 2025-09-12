import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Shield, Users, Settings, Database, Lock, Activity } from 'lucide-react';

const SystemSettings = () => {
  const systemModules = [
    {
      title: 'Role Management',
      description: 'Manage user roles, permissions, and access control',
      icon: Shield,
      href: '/superadmin/system/roles',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Permission Management',
      description: 'Configure system permissions and access rights',
      icon: Lock,
      href: '/superadmin/system/permissions',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      title: 'User Management',
      description: 'Manage system users and their accounts',
      icon: Users,
      href: '/superadmin/users',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'System Configuration',
      description: 'Configure system-wide settings and parameters',
      icon: Settings,
      href: '/superadmin/system/config',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    },
    {
      title: 'Database Management',
      description: 'Monitor and manage database operations',
      icon: Database,
      href: '/superadmin/system/database',
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100'
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system health and performance',
      icon: Activity,
      href: '/superadmin/system/monitoring',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600">Manage system-wide settings, roles, permissions, and configurations</p>
      </div>

      {/* System Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.title} to={module.href}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`h-2 bg-gradient-to-r ${module.bgColor} rounded-full`}></div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common system administration tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Create New Role</div>
                <div className="text-sm text-gray-600">Add a new user role</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Add User</div>
                <div className="text-sm text-gray-600">Create new system user</div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">System Config</div>
                <div className="text-sm text-gray-600">Update system settings</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
