let uuidCounter = 0;
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${++uuidCounter}`
  },
  configurable: true
});

import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient } from '@utils-types';

describe('Тестирование редьюсера burgerConstructor', () => {
  const initialState = constructorReducer(undefined, { type: '@@INIT' });

  const mockBun: TIngredient = {
    _id: '1',
    name: 'Краторная булка',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1250,
    image: 'image-bun.png',
    image_mobile: 'image-bun-mobile.png',
    image_large: 'image-bun-large.png'
  };

  const mockIngredient: TIngredient = {
    _id: '2',
    name: 'Биокотлета',
    type: 'main',
    proteins: 40,
    fat: 10,
    carbohydrates: 20,
    calories: 100,
    price: 400,
    image: 'image-main.png',
    image_mobile: 'image-main-mobile.png',
    image_large: 'image-main-large.png'
  };

  test('должен возвращать начальное состояние при неизвестном экшене', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
      initialState
    );
  });

  test('должен добавлять булку через addIngredient', () => {
    const action = addIngredient(mockBun);
    const state = constructorReducer(initialState, action);

    expect(state.bun).toBeDefined();
    expect(state.bun?._id).toBe(mockBun._id);
    expect(state.ingredients).toHaveLength(0);
  });

  test('должен добавлять начинку в массив ingredients через addIngredient', () => {
    const action = addIngredient(mockIngredient);
    const state = constructorReducer(initialState, action);

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]._id).toBe(mockIngredient._id);
    expect(state.ingredients[0].id).toBeDefined();
    expect(typeof state.ingredients[0].id).toBe('string');
  });

  test('должен удалять ингредиент по id через removeIngredient', () => {
    const actionWithId1 = addIngredient(mockIngredient);
    const stateWithOne = constructorReducer(initialState, actionWithId1);
    const item1Id = stateWithOne.ingredients[0].id;

    const actionWithId2 = addIngredient(mockIngredient);
    const preloadedState = constructorReducer(stateWithOne, actionWithId2);

    const state = constructorReducer(preloadedState, removeIngredient(item1Id));
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).not.toBe(item1Id);
  });

  test('должен менять порядок ингредиентов через moveIngredient', () => {
    const item1: TConstructorIngredient = {
      ...mockIngredient,
      id: 'id-1',
      name: 'Первый'
    };
    const item2: TConstructorIngredient = {
      ...mockIngredient,
      id: 'id-2',
      name: 'Второй'
    };
    const preloadedState = {
      bun: null,
      ingredients: [item1, item2]
    };

    const state = constructorReducer(
      preloadedState,
      moveIngredient({ fromIndex: 0, toIndex: 1 })
    );
    expect(state.ingredients[0].id).toBe('id-2');
    expect(state.ingredients[1].id).toBe('id-1');
  });

  test('должен очищать конструктор через clearConstructor', () => {
    const preloadedState = {
      bun: mockBun,
      ingredients: [
        { ...mockIngredient, id: 'id-1' }
      ] as TConstructorIngredient[]
    };

    const state = constructorReducer(preloadedState, clearConstructor());
    expect(state).toEqual(initialState);
  });
});
