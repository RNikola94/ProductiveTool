import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import RootLayout from './layout/RootLayout';
import ErrorPage from './pages/error-page/ErrorPage.page';
import HomePage from './pages/home-page/HomePage.page';
import './App.css'
import ProtectedRoute from './components/protected-route/ProtectedRoute.component';
import Auth from './components/auth/Auth.component';
import InvoiceDashboard from './components/invoice-dashboard/InvoiceDashboard.component';
import InvoiceDetails from './pages/invoice-details-page/InvoiceDetails.page';
import { auth } from './utils/firebase.utils';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser } from './store/user/userSlice';

function App() {

  const dispatch = useDispatch();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(setUser({ uid, email, displayName }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Auth />
    },
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: 'home',
          element: <ProtectedRoute><HomePage /></ProtectedRoute>
        },
        {
          path: 'dashboard',
          element: <ProtectedRoute><InvoiceDashboard /></ProtectedRoute>
        },
        {
          path: '/invoice/:id',
          // element: <ProtectedRoute><InvoiceDashboard /></ProtectedRoute>
          element: <InvoiceDetails />
        }
      ]
    }
  ])


  return (
    <RouterProvider router={router} />
  )
}

export default App
