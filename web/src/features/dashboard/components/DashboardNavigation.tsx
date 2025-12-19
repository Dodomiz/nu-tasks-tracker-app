import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useRTL } from '@/hooks/useRTL';

export default function DashboardNavigation() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: t('dashboard.myGroups', { defaultValue: 'My Groups' }), path: '/dashboard/groups' },
    { name: t('dashboard.myTasks', { defaultValue: 'My Tasks' }), path: '/dashboard/tasks' },
  ];

  // Determine which tab is currently active based on the route
  const currentTabIndex = tabs.findIndex((tab) => location.pathname.startsWith(tab.path));
  const selectedIndex = currentTabIndex >= 0 ? currentTabIndex : 0;

  const handleTabChange = (index: number) => {
    navigate(tabs[index].path);
  };

  return (
    <div className={`border-b border-gray-200 mb-6 ${isRTL ? 'rtl' : ''}`}>
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        <Tab.List className="flex space-x-8 rtl:space-x-reverse">
          {tabs.map((tab) => (
            <Tab
              key={tab.path}
              className={({ selected }) =>
                `py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none
                ${
                  selected
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}
