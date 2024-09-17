import CreatePost from '../pages/Posts';
import Form from '../pages/auth/Form';
import { Navigate, Route, Routes as Router } from 'react-router-dom';
import Profile from '../pages/Profile/index';
import Others from '../pages/Others';
import Home from '../pages/Home/Index';
import EditProfile from '../pages/Profile/edit';
import Explore from '../pages/explore';
import Post from '../pages/Posts/main';
import ProfilePage from '@/pages/test/myprofile';


const PrivateRoutes = ({children}) => {
  const isUserLoggedIn = window.localStorage.getItem('user:token') || false;
  const isFormPage = window.location.pathname.includes('ac');

  if (isUserLoggedIn && !isFormPage) {
    return children;
  } else if (!isUserLoggedIn && isFormPage) {
    return children;
  } else {
    const redirectUrl = isUserLoggedIn ? '/' : '/account';
    return <Navigate to={redirectUrl} replace />;
  }
}

const Routes = () => {
  const routes = [
    { id: 1, 
      name: 'home',
      path: '/', 
      element: <Home /> 
    },
    { id: 2, 
      name: 'sign in', 
      path: '/account', 
      element: <Form /> 
    },
    { id: 4, 
      name: 'createPost', 
      path: '/new-post', 
      element: <CreatePost /> 
    },
    { id: 5, 
      name: 'profile', 
      path: '/profile', 
      element: <Profile /> 
    },
    { id: 6, 
      name: 'others', 
      path: '/user/:username', 
      element: <Others /> 
    },
    { id: 7, 
      name: 'edit profile', 
      path: '/edit-profile', 
      element: <EditProfile /> 
    },
    { id: 8, 
      name: 'explore', 
      path: '/explore', 
      element: <Explore /> 
    },
    { id: 9, 
      name: 'post', 
      path: '/post/:id', 
      element: <Post /> 
    },
    { id: 10, 
      name: 'profile',  
      path: '/testprf', 
      element: <ProfilePage /> 
    },
  ];

  return (
    <Router>
      {routes.map(route => (
        <Route key={route.id} path={route.path} element={
            <PrivateRoutes>
              {route.element}
            </PrivateRoutes>}/>
      ))}
    </Router>
  );
};

export default Routes;

