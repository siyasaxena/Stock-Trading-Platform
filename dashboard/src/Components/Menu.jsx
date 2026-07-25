import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  const [selectedMenu, setSelectedmenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [username, setUsername] = useState("USERID");

  useEffect(() => {
    // 1. Read ?username=siya%20saxena directly from URL search params
    const queryParams = new URLSearchParams(window.location.search);
    const userFromUrl = queryParams.get("username");

    if (userFromUrl) {
      setUsername(userFromUrl);
      // Save it locally on port 5174 so it persists on page refreshes
      localStorage.setItem("username", userFromUrl);
    } else {
      // 2. Fallback to port 5174's local storage on refresh
      const savedUser = localStorage.getItem("username");
      if (savedUser) {
        setUsername(savedUser);
      }
    }
  }, []);

  // Extract initials (e.g., "siya saxena" -> "SS")
  const getInitials = (name) => {
    if (!name || name === "USERID") return "ZU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleMenuClick = (index) => {
    setSelectedmenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    window.location.href = "http://localhost:5173/login";
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img
        src="/media/images/logo (1).svg"
        style={{ width: "50px" }}
        alt="Logo"
      />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(5)}
            >
              <p className={selectedMenu === 5 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        {/* ✅ Profile Section with Dropdown Container */}
        <div className="profile-wrapper" style={{ position: "relative" }}>
          <div
            className="profile"
            onClick={handleProfileClick}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div className="avatar">{getInitials(username)}</div>
            <p className="username">{username}</p>
          </div>

          {/* ✅ Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div
              className="profile-dropdown"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "10px",
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                width: "160px",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li
                  onClick={handleLogout}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    color: "#df514c",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fff")
                  }
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
