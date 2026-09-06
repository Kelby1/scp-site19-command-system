import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

import "../../styles/sidebar.css";

function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />

      <div className="app-layout__body">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;