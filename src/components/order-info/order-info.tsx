import { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { getOrderByNumberApi } from '../../utils/burger-api';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();

  const { ingredients } = useSelector((state) => state.ingredients);

  const orderFromStore = useSelector((state) => {
    const allOrders = [...state.feeds.orders, ...state.feeds.userOrders];
    return allOrders.find((order) => order.number === Number(number));
  });

  const [fetchedOrder, setFetchedOrder] = useState<TOrder | null>(null);

  useEffect(() => {
    if (!orderFromStore && number) {
      getOrderByNumberApi(Number(number))
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            setFetchedOrder(data.orders[0]);
          }
        })
        .catch((err) => console.error('Ошибка загрузки заказа:', err));
    }
  }, [orderFromStore, number]);

  const orderData = orderFromStore || fetchedOrder;

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
