import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach Clerk token to every request
export function setAuthToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// Meals
export const generateMeals = (days, servings, preferences, previousMeals = []) =>
  api.post('/meals/generate', { days, servings, preferences, previousMeals }).then(r => r.data);

export const generateMore = (preferences, excludeNames) =>
  api.post('/meals/generate-more', { preferences, excludeNames, prefPrompt: preferences.prefPrompt }).then(r => r.data);

export const saveMeals = (planId, meals) =>
  api.post('/meals/save', { planId, meals }).then(r => r.data);

export const getPlan = (planId) =>
  api.get(`/meals/plan/${planId}`).then(r => r.data);

export const swapMeal = (mealId, newMeal) =>
  api.patch(`/meals/${mealId}/swap`, { newMeal }).then(r => r.data);

// Grocery
export const buildGroceryList = (planId) =>
  api.post('/grocery/build', { planId }).then(r => r.data);

// User
export const getMe = () => api.get('/user/me').then(r => r.data);
export const registerUser = (email) => api.post('/user/register', { email }).then(r => r.data);
export const getPreferences = () => api.get('/user/preferences').then(r => r.data);
export const savePreferences = (prefs) => api.post('/user/preferences', prefs).then(r => r.data);
export const getPlans = () => api.get('/user/plans').then(r => r.data);

// Payments
export const createCheckout = (plan = 'monthly') =>
  api.post('/payments/create-checkout', { plan }).then(r => r.data);
export const createPortal = () =>
  api.post('/payments/create-portal').then(r => r.data);
export const getSubscriptionStatus = () =>
  api.get('/payments/subscription').then(r => r.data);
export const validatePromo = (promoCode) =>
  api.post('/payments/validate-promo', { promoCode }).then(r => r.data);
export const deletePlan = (planId) =>
  api.delete(`/user/plans/${planId}`).then(r => r.data);

// Guest (no auth)
export const guestGenerate = (sessionKey, days, servings, preferences) =>
  api.post('/guest/generate', { sessionKey, days, servings, preferences }).then(r => r.data);
export const guestSave = (planId, meals) =>
  api.post('/guest/save', { planId, meals }).then(r => r.data);
export const guestGetPlan = (planId) =>
  api.get(`/guest/plan/${planId}`).then(r => r.data);
export const guestBuildGrocery = (planId) =>
  api.post('/guest/grocery', { planId }).then(r => r.data);

// Pantry
export const getPantry = () =>
  api.get('/pantry').then(r => r.data);
export const addPantryItem = (item) =>
  api.post('/pantry', item).then(r => r.data);
export const updatePantryItem = (id, item) =>
  api.put(`/pantry/${id}`, item).then(r => r.data);
export const deletePantryItem = (id) =>
  api.delete(`/pantry/${id}`).then(r => r.data);
export const scanPantry = (image, mediaType) =>
  api.post('/pantry/scan', { image, mediaType }).then(r => r.data);
export const cookMeal = (ingredients) =>
  api.post('/pantry/cook', { ingredients }).then(r => r.data);
export const checkPantry = (planId) =>
  api.get(`/pantry/check?planId=${planId}`).then(r => r.data);

// Recipe cards (uploaded)
export const getRecipeCards = () =>
  api.get('/recipe-cards').then(r => r.data);
export const uploadRecipeCard = (formData) =>
  api.post('/recipe-cards/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deleteRecipeCard = (id) =>
  api.delete(`/recipe-cards/${id}`).then(r => r.data);

// Coupons
export const getCoupons = (store = 'all', search = '') =>
  api.get('/coupons', { params: { store, search } }).then(r => r.data);
export const matchCoupons = (planId, store = 'all') =>
  api.get('/coupons/match', { params: { planId, store } }).then(r => r.data);
