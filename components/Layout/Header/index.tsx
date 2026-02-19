
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Store } from '../../../services/store';
import { BrandLogo } from '../../BrandLogo';
import './style.css';

export const Header: React.FC = () => {
  const user = Store.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Store.logout();
    navigate('/login');
  };

  return (
    <header className="main-header no-print">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="header-brand">
            <BrandLogo size="md" />
            <span className="brand-name">
              Me<span className="brand-highlight">Conta</span>
            </span>
          </Link>

          <div className="header-actions">
            <Link
              to="/profile"
              className="profile-link"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  className="profile-avatar"
                  alt="Perfil"
                />
              ) : (
                <div className="profile-placeholder">
                  <UserIcon className="icon-sm" />
                </div>
              )}
              <span className="profile-label">Perfil</span>
            </Link>

            <button
              onClick={handleLogout}
              className="logout-button"
              title="Sair"
            >
              <LogOut className="icon-sm" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
