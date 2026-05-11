import AsianKitchenCard from './AsianKitchenCard.jsx';
import ItalianTrattoriaCard from './ItalianTrattoriaCard.jsx';
import LatinFlavorsCard from './LatinFlavorsCard.jsx';
import AmericanComfortCard from './AmericanComfortCard.jsx';
import MediterraneanCard from './MediterraneanCard.jsx';
import IndianSpiceCard from './IndianSpiceCard.jsx';
import SteakhouseCard from './SteakhouseCard.jsx';
import HealthyCard from './HealthyCard.jsx';

const CARD_MAP = {
  asian:         AsianKitchenCard,
  italian:       ItalianTrattoriaCard,
  latin:         LatinFlavorsCard,
  american:      AmericanComfortCard,
  mediterranean: MediterraneanCard,
  indian:        IndianSpiceCard,
  steakhouse:    SteakhouseCard,
  healthy:       HealthyCard,
};

export default function RecipeCardRenderer({ meal, cardRef }) {
  const cuisine = meal.cuisine || 'american';
  const CardComponent = CARD_MAP[cuisine] || AmericanComfortCard;
  return <CardComponent meal={meal} cardRef={cardRef} />;
}
