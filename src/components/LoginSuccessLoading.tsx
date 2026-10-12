import React from 'react';
import { PostLoginTransition } from './PostLoginTransition/PostLoginTransition';

interface LoginSuccessLoadingProps {
  userName?: string;
  userEmail?: string;
  onComplete: () => void;
  onSignOut?: () => void;
}

export const LoginSuccessLoading: React.FC<LoginSuccessLoadingProps> = (props) => {
  return <PostLoginTransition {...props} />;
};

export default LoginSuccessLoading;
export { PostLoginTransition };
