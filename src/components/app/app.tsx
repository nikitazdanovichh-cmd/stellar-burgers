import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import '../../index.css';
import styles from './app.module.css';

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate
} from 'react-router-dom';

import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';
import { authChecked, checkUserAuth } from '../../services/slices/userSlice';
import { useEffect } from 'react';
import { getCookie } from '../../utils/cookie';

import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import { Preloader } from '@ui';
import { ProtectedRoute } from '../protected-route/protected-route';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    ingredients,
    loading: isIngredientsLoading,
    error
  } = useSelector((state) => state.ingredients);

  useEffect(() => {
    dispatch(fetchIngredients());

    if (getCookie('accessToken')) {
      dispatch(checkUserAuth());
    } else {
      dispatch(authChecked());
    }
  }, [dispatch]);

  const state = location.state as { background?: any } | null;
  const background = state?.background;

  const orderNumberMatch = location.pathname.match(
    /\/(?:feed|profile\/orders)\/(\d+)/
  );
  const orderNumberTitle = orderNumberMatch ? `#${orderNumberMatch[1]}` : '';

  const closeModal = () => navigate(-1);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        <Route
          path='/'
          element={
            isIngredientsLoading ? (
              <Preloader />
            ) : error ? (
              <div
                className={`${styles.error} text text_type_main-medium pt-4`}
              >
                {error}
              </div>
            ) : ingredients.length > 0 ? (
              <ConstructorPage />
            ) : (
              <div
                className={`${styles.title} text text_type_main-medium pt-4`}
              >
                Нет ингредиентов
              </div>
            )
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            isIngredientsLoading ? (
              <Preloader />
            ) : error ? (
              <div
                className={`${styles.error} text text_type_main-medium pt-4`}
              >
                {error}
              </div>
            ) : ingredients.length > 0 ? (
              <IngredientDetails />
            ) : (
              <div
                className={`${styles.title} text text_type_main-medium pt-4`}
              >
                Нет ингредиентов
              </div>
            )
          }
        />
        <Route path='/feed' element={<Feed />} />
        <Route
          path='/login'
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route path='/profile/orders/:number' element={<OrderInfo />} />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <Modal title={orderNumberTitle} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <Modal title={orderNumberTitle} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
        </Routes>
      )}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
