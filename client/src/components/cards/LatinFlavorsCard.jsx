import BaseRecipeCard from './BaseRecipeCard.jsx';
import { CARD_THEMES } from './cardThemes.js';

export default function LatinFlavorsCard({ meal, cardRef }) {
  return <BaseRecipeCard meal={meal} cardRef={cardRef} theme={CARD_THEMES.latin} />;
}
