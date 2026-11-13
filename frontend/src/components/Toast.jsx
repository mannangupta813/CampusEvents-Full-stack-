import React from 'react';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useAppFeatures();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon text-danger" />;
      default:
        return <Info size={18} className="toast-icon text-primary" />;
    }
  };

  return (
    <div className={`toast-notification toast-${toast.type || 'info'}`}>
      {getIcon()}
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
