'use client';

import { useEffect, useState } from 'react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DEFAULT_WORKSPACE_SETTINGS, WORKSPACE_SETTINGS_DOC_PATH } from '@/modules/workspace/settings';
import type { WorkspaceSettings } from '@/models/workspace-settings';

export function useWorkspaceSettings(enabled = true) {
  const { firestore, user } = useFirebase();
  const [draft, setDraft] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!enabled || !firestore) return null;

    return doc(firestore, ...WORKSPACE_SETTINGS_DOC_PATH);
  }, [enabled, firestore]);

  const { data: settingsDoc, isLoading } = useDoc<WorkspaceSettings>(settingsRef);

  useEffect(() => {
    if (!settingsDoc || touched) return;

    setDraft({
      ...DEFAULT_WORKSPACE_SETTINGS,
      ...settingsDoc,
    });
  }, [settingsDoc, touched]);

  const updateSetting = <K extends keyof WorkspaceSettings>(field: K, value: WorkspaceSettings[K]) => {
    setTouched(true);
    setSaved(false);
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveSettings = () => {
    if (!settingsRef) return;

    setDocumentNonBlocking(
      settingsRef,
      {
        ...draft,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid ?? '',
      },
      { merge: true }
    );
    setSaved(true);
  };

  return {
    draft,
    isLoading,
    saved,
    updateSetting,
    saveSettings,
  };
}
