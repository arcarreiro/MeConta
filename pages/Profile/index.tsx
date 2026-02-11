
import React, { useState } from 'react';
import { Store } from '../../services/store';
import { User, Role } from '../../types';
import { 
  Save, 
  Upload, 
  FileText, 
  Camera, 
  User as UserIcon, 
  GraduationCap, 
  ShieldCheck, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import './style.css';

const Profile: React.FC = () => {
  const user = Store.getCurrentUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    curricularInfo: user?.curricularInfo || '',
    photoUrl: user?.photoUrl || '',
    resumeUrl: user?.resumeUrl || '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'resumeUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (user) {
      setIsSavingProfile(true);
      try {
        await Store.updateUser({ ...formData, id: user.id });
        alert('Perfil atualizado com sucesso!');
      } catch (err) {
        alert('Erro ao atualizar perfil.');
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const result = await Store.updatePassword(newPassword);
      if (result.success) {
        alert('Senha alterada com sucesso!');
        setNewPassword('');
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (err) {
      alert('Erro inesperado ao alterar senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-header__title">Seu Perfil Profissional</h1>
        <p className="profile-header__subtitle">Mantenha seus dados atualizados para que mentores possam te orientar melhor.</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-photo-card">
            <div className="profile-photo-wrapper group" onClick={() => document.getElementById('photo-input')?.click()}>
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="profile-photo-img" alt="Avatar" />
              ) : (
                <div className="profile-photo-placeholder">
                  <Camera className="profile-photo-placeholder-icon" />
                </div>
              )}
              <div className="profile-photo-overlay">
                 <Upload className="profile-photo-overlay-icon" />
              </div>
              <input id="photo-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'photoUrl')} />
            </div>
            
            <h2 className="profile-user-name">{formData.name}</h2>
            <span className="profile-user-role">{user?.role}</span>
          </div>

          <div className="profile-resume-card">
             <h3 className="profile-resume-card__title">
               <FileText className="profile-resume-card__title-icon" /> Currículo (PDF)
             </h3>
             <div 
               className="profile-resume-uploader group"
               onClick={() => document.getElementById('resume-input')?.click()}
             >
                {formData.resumeUrl ? (
                  <div className="profile-resume-status profile-resume-status--success">
                    <div className="profile-resume-status__icon-wrapper">
                       <FileText className="profile-resume-status__icon" />
                    </div>
                    <span className="profile-resume-status__text">Arquivo Carregado</span>
                  </div>
                ) : (
                  <div className="profile-resume-status profile-resume-status--empty">
                    <Upload className="profile-resume-status__icon--upload" />
                    <span className="profile-resume-status__text">Clique para enviar PDF</span>
                  </div>
                )}
                <input id="resume-input" type="file" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, 'resumeUrl')} />
             </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-info-card">
            <div className="profile-info-field">
              <label className="profile-info-label">Breve Biografia</label>
              <textarea 
                className="profile-info-textarea profile-info-textarea--small"
                placeholder="Conte um pouco sobre sua trajetória..."
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <div className="profile-info-field">
              <label className="profile-info-label profile-info-label--with-icon">
                <GraduationCap className="profile-info-label-icon" /> Informações Curriculares
              </label>
              <textarea 
                className="profile-info-textarea profile-info-textarea--large"
                placeholder="Liste sua formação, cursos e principais competências técnicas..."
                value={formData.curricularInfo}
                onChange={(e) => setFormData(p => ({ ...p, curricularInfo: e.target.value }))}
              />
            </div>

            <div className="profile-info-footer">
              <button 
                onClick={handleSave}
                disabled={isSavingProfile}
                className="profile-save-btn"
              >
                {isSavingProfile ? <Loader2 className="animate-spin" /> : <Save />}
                Salvar Perfil
              </button>
            </div>
          </div>

          <div className="profile-security-card">
             <div className="profile-security-header">
               <ShieldCheck className="profile-security-header-icon" />
               <h3 className="profile-security-title">Segurança da Conta</h3>
             </div>
             
             <div className="profile-security-grid">
                <div className="profile-security-field">
                   <div className="profile-security-field-label">
                     <Mail className="profile-security-field-label-icon" /> E-mail de Acesso
                   </div>
                   <div className="profile-security-email">{user?.email}</div>
                </div>

                <div className="profile-security-field">
                   <div className="profile-security-field-label">
                     <Key className="profile-security-field-label-icon" /> Alterar Senha
                   </div>
                   <div className="profile-password-input-wrapper">
                     <input 
                       type={showPassword ? "text" : "password"}
                       className="profile-password-input"
                       placeholder="Nova senha"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="profile-password-toggle"
                     >
                       {showPassword ? <EyeOff /> : <Eye />}
                     </button>
                   </div>
                   <button 
                     onClick={handleUpdatePassword}
                     disabled={isUpdatingPassword || !newPassword}
                     className="profile-password-submit-btn"
                   >
                     {isUpdatingPassword ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                     Confirmar Alteração
                   </button>
                </div>
             </div>
             <p className="profile-security-note">Sua senha é gerenciada pelo sistema de autenticação segura do Supabase e não é armazenada em texto aberto em nosso banco de dados de perfis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
