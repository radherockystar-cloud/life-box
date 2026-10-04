import { useEffect } from 'react';
import { App } from '@capacitor/app';

export default function useBackHandler(onBack, activeCondition) {
  useEffect(() => {
    let handleBack;
    try {
      handleBack = App.addListener('backButton', (data) => {
        if (activeCondition) {
          onBack();
        } else {
          App.exitApp();
        }
      });
    } catch (e) {
      // Not in Capacitor environment
    }

    return () => {
      if (handleBack) {
        handleBack.remove();
      }
    };
  }, [onBack, activeCondition]);
}
