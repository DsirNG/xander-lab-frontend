import { Outlet } from 'react-router-dom';
import RouteSEO from './RouteSEO';

export default function RouteSEOLayout() {
  return (
    <>
      <RouteSEO />
      <Outlet />
    </>
  );
}
