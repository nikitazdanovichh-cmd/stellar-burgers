import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '../../services/store';
import { useParams, useLocation } from 'react-router-dom';

export const IngredientDetails: FC = () => {
  const { ingredients } = useSelector((state) => state.ingredients);

  const { id } = useParams<{ id: string }>();

  const location = useLocation();

  const ingredientData = ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  const isIndividualPage = !location.state?.background;

  if (isIndividualPage) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '10vh',
          width: '100%'
        }}
      >
        <h1 className='text text_type_main-large mb-5'>Детали ингредиента</h1>
        <IngredientDetailsUI ingredientData={ingredientData} />
      </div>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
