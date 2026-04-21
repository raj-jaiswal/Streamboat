import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-sb-bg text-sb-text overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-20 md:ml-20 flex flex-col transition-all duration-300 relative h-screen overflow-hidden">
        <div className="flex-1 w-full flex flex-col">
          <TopBar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
