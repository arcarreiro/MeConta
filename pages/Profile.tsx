
import React, { useState } from 'react';
import { Store } from '../services/store';
import { User, Role } from '../types';
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
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seu Perfil Profissional</h1>
        <p className="text-slate-500 font-medium">Mantenha seus dados atualizados para que mentores possam te orientar melhor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Foto e Status */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-input')?.click()}>
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="w-32 h-32 rounded-full object-cover border-4 border-violet-100 group-hover:border-violet-500 transition-all shadow-lg" alt="Avatar" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center group-hover:bg-slate-100 transition-all">
                  <Camera className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                 <Upload className="text-white w-6 h-6" />
              </div>
              <input id="photo-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'photoUrl')} />
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-slate-900">{formData.name}</h2>
            <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full mt-2">{user?.role}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
               <FileText className="w-4 h-4 text-violet-600" /> Currículo (PDF)
             </h3>
             <div 
               className="border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer group"
               onClick={() => document.getElementById('resume-input')?.click()}
             >
                {formData.resumeUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
                       <FileText className="text-emerald-600 w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600">Arquivo Carregado</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="text-slate-300 w-8 h-8 mb-2 group-hover:text-violet-400" />
                    <span className="text-xs font-bold text-slate-400">Clique para enviar PDF</span>
                  </div>
                )}
                <input id="resume-input" type="file" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, 'resumeUrl')} />
             </div>
          </div>
        </div>

        {/* Informações Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Breve Biografia</label>
              <textarea 
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-violet-500 h-28 placeholder-slate-300 font-medium transition-all"
                placeholder="Conte um pouco sobre sua trajetória..."
                value={formData.bio}
                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Informações Curriculares
              </label>
              <textarea 
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-violet-500 h-40 placeholder-slate-300 font-medium transition-all"
                placeholder="Liste sua formação, cursos e principais competências técnicas..."
                value={formData.curricularInfo}
                onChange={(e) => setFormData(p => ({ ...p, curricularInfo: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSavingProfile}
                className="flex items-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Perfil
              </button>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 space-y-8">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-6 h-6 text-emerald-400" />
               <h3 className="text-xl font-bold">Segurança da Conta</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/10 p-5 rounded-2xl space-y-2">
                   <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                     <Mail className="w-3 h-3" /> E-mail de Acesso
                   </div>
                   <div className="font-bold truncate text-lg">{user?.email}</div>
                </div>

                <div className="bg-white/10 p-5 rounded-2xl space-y-4">
                   <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                     <Key className="w-3 h-3" /> Alterar Senha
                   </div>
                   <div className="relative">
                     <input 
                       type={showPassword ? "text" : "password"}
                       className="w-full bg-white/5 border-b border-white/20 p-2 pr-10 focus:border-emerald-400 focus:outline-none font-medium transition-colors"
                       placeholder="Nova senha"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                   <button 
                     onClick={handleUpdatePassword}
                     disabled={isUpdatingPassword || !newPassword}
                     className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase transition-all active:scale-95 disabled:opacity-30"
                   >
                     {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                     Confirmar Alteração
                   </button>
                </div>
             </div>
             <p className="text-xs text-slate-400 font-medium italic">Sua senha é gerenciada pelo sistema de autenticação segura do Supabase e não é armazenada em texto aberto em nosso banco de dados de perfis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
