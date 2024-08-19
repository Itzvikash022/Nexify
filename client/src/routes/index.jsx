import Home from '../pages/Home';
import Form from '../pages/auth/Form';
import { Navigate, Route, Routes as Router } from 'react-router-dom';

const PrivateRoutes = ({children}) => {
  const isUserLoggedIn = window.localStorage.getItem('user:token') || true
  const isFormPage = window.location.pathname.includes('ac')

  if(isUserLoggedIn && !isFormPage) {
    return children
  } else if(!isUserLoggedIn && isFormPage){
    return children
  } else{
    const redirectUrl = isUserLoggedIn ? '/' : 'ac/signin'
    return <Navigate to={redirectUrl} replace/>
  }
}


const Routes = () => {
  const routes = [
    {
      id: 1,
      name: 'home',
      path: '/',
      element: <Home />    },
    {
      id: 2,
      name: 'sign in',
      path: '/ac/signin',
      element: <Form />
    },
    {
      id: 3,
      name: 'sign up',
      path: '/ac/signup',
      element: <Form />
    }
  ];

  return (
    <Router>
      {routes.map(route => (
        <Route key={route.id} path={route.path} element={<PrivateRoutes>{route.element}</PrivateRoutes>} />
      ))}
    </Router>
  );
};

export default Routes;
