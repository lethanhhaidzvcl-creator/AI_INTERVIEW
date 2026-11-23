
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BriefcaseBusiness,
  House,
  ShieldCheck,
} from "lucide-react";

import "../../styles/Admin.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldCheck size={28} />
          <div>
            <h2>AI Interview</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <LayoutDashboard size={20} />
            Tổng quan
          </NavLink>

          <NavLink
            to="/admin/questions"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <BookOpen size={20} />
            Quản lý câu hỏi
          </NavLink>

          <NavLink
            to="/admin/positions"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            <BriefcaseBusiness size={20} />
            Quản lý vị trí
          </NavLink>
        </nav>

        <Link to="/" className="admin-home-link">
          <House size={20} />
          Về trang chủ
        </Link>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
