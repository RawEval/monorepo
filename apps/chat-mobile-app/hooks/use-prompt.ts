/**
 * Cross-platform prompt — works on both iOS and Android.
 * iOS uses native Alert.prompt, Android uses a state-based approach
 * that the consuming component renders as a Modal.
 */

import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';

interface PromptState {
  visible: boolean;
  title: string;
  message: string;
  defaultValue: string;
  onSubmit: (value: string) => void;
}

const INITIAL: PromptState = {
  visible: false,
  title: '',
  message: '',
  defaultValue: '',
  onSubmit: () => {},
};

export function usePrompt() {
  const [state, setState] = useState<PromptState>(INITIAL);

  const prompt = useCallback(
    (title: string, message: string, onSubmit: (value: string) => void, defaultValue = '') => {
      if (Platform.OS === 'ios') {
        Alert.prompt(title, message, (val) => {
          if (val?.trim()) onSubmit(val.trim());
        }, 'plain-text', defaultValue);
      } else {
        setState({ visible: true, title, message, defaultValue, onSubmit });
      }
    },
    [],
  );

  const dismiss = useCallback(() => setState(INITIAL), []);

  const submit = useCallback(
    (value: string) => {
      if (value.trim()) state.onSubmit(value.trim());
      setState(INITIAL);
    },
    [state.onSubmit],
  );

  return { prompt, promptState: state, dismissPrompt: dismiss, submitPrompt: submit };
}
