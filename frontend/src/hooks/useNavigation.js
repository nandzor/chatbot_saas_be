import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/dashboard');
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  return {
    navigate,
    location,
    goTo,
    goBack,
    goHome,
    isCurrentPath,
    isActivePath
  };
};
