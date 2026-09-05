import React, { useState, useRef } from 'react';
import { HunterUser } from '../types';
import { HunterAvatar, PRESET_AVATARS } from './HunterAvatar';
import {
  Camera,
  Upload,
  X,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  User,
  Shield,
  FileImage,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  user: HunterUser;
  onSaveAvatar: (newAvatar: string, newName?: string, newSpiritualTitle?: string) => void;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  user,
  onSaveAvatar,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar || '');
  const [name, setName] = useState<string>(user.name);
  const [spiritualTitle, setSpiritualTitle] = useState<string>(user.spiritualTitle);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress image to ensure localStorage friendliness & high speed
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("L'image est trop volumineuse (maximum 10 Mo).");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 420;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setSelectedAvatar(compressedDataUrl);
            playSystemSound('click');
          } else {
            setSelectedAvatar(e.target?.result as string);
          }
        } catch {
          setSelectedAvatar(e.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Erreur lors du chargement de l’image.');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg('Impossible de lire ce fichier.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSave = () => {
    playSystemSound('quest_complete');
    onSaveAvatar(selectedAvatar, name.trim() || user.name, spiritualTitle.trim() || user.spiritualTitle);
    onClose();
  };

  const handleResetToDefault = () => {
    playSystemSound('click');
    setSelectedAvatar('preset:shadow_monarch');
  };

  const isCustomPhoto =
    selectedAvatar &&
    (selectedAvatar.startsWith('data:image/') ||
      selectedAvatar.startsWith('http://') ||
      selectedAvatar.startsWith('https://'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090d16] border border-sky-400/40 p-5 sm:p-7 shadow-[0_0_40px_rgba(56,189,248,0.25)] system-corner space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-hud uppercase tracking-widest text-sky-400 block">
                [ IDENTITÉ DU CHASSEUR ]
              </span>
              <h2 className="font-hud text-xl sm:text-2xl font-bold text-white tracking-wide">
                Photo de Profil & Avatar
              </h2>
            </div>
          </div>

          <button
            id="close-profile-photo-modal-btn"
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-sky-500/30 system-corner flex items-center gap-4">
          <HunterAvatar
            avatar={selectedAvatar}
            name={name || user.name}
            rank={user.hunterRank}
            size="xl"
            showRankBorder={true}
            showStatusDot={true}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-sky-950 border border-sky-500/30 text-sky-300 uppercase tracking-widest">
                {user.hunterRank} • NIVEAU {user.level}
              </span>
              {isCustomPhoto && (
                <span className="px-2 py-0.5 rounded text-[10px] font-hud text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> PHOTO PERSONNELLE
                </span>
              )}
            </div>
            <h3 className="font-hud text-lg sm:text-xl font-bold text-white">
              {name || user.name}
            </h3>
            <p className="font-biblical text-xs text-slate-300 italic">
              « {spiritualTitle || user.spiritualTitle} »
            </p>
          </div>
        </div>

        {/* Upload Zone (Drag & Drop + File Button) */}
        <div className="space-y-2">
          <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
            [ TÉLÉCHARGER VOTRE PHOTO ]
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="hunter-profile-file-input"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/50 hover:bg-slate-900/50'
            }`}
          >
            <div className="p-3 rounded-2xl bg-sky-950/60 border border-sky-500/30 text-sky-400">
              {isProcessing ? (
                <Sparkles className="w-6 h-6 animate-spin text-sky-300" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="font-hud font-bold text-sm text-white">
                {isProcessing
                  ? 'Optimisation de la photo en cours...'
                  : 'Glissez-déposez votre photo ici, ou cliquez pour parcourir'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Prend en charge PNG, JPG, WEBP jusqu’à 10 Mo. Redimensionnée automatiquement.
              </p>
            </div>

            <button
              type="button"
              id="select-file-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-300 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              Choisir un fichier
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Preset Avatars Selection */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
              [ OU CHOISIR UN AVATAR DE CHASSEUR DU ROYAUME ]
            </span>
            {isCustomPhoto && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-hud uppercase"
              >
                <Trash2 className="w-3 h-3" />
                Retirer la photo perso
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = selectedAvatar === preset.id;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  id={`avatar-preset-${preset.id}`}
                  onClick={() => {
                    playSystemSound('click');
                    setSelectedAvatar(preset.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${preset.bg} flex items-center justify-center border border-white/10 shrink-0`}
                  >
                    <Icon className="w-5 h-5" style={{ color: preset.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-hud font-bold text-xs text-white truncate">
                      {preset.name}
                    </div>
                    <span className="text-[10px] text-slate-400 font-hud uppercase tracking-wider block">
                      {isSelected ? 'Sélectionné' : 'Prédéfini'}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hunter Identity Names Edit */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
            [ TITRES & NOM DU CHASSEUR ]
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-hud text-slate-400 uppercase block mb-1">
                Nom du Chasseur
              </label>
              <input
                id="hunter-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sung Jin-Christ"
                maxLength={40}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white font-hud text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-hud text-slate-400 uppercase block mb-1">
                Titre Spirituel
              </label>
              <input
                id="hunter-title-input"
                type="text"
                value={spiritualTitle}
                onChange={(e) => setSpiritualTitle(e.target.value)}
                placeholder="Ex: Disciple Éveillé de la Grâce"
                maxLength={60}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-400 text-white font-hud text-sm outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-hud text-xs uppercase tracking-wider"
          >
            Annuler
          </button>

          <button
            type="button"
            id="save-profile-photo-btn"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};
