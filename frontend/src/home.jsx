import CalculatorCard from "./components/calCard";
const calculators = [
  {
    title: 'Zakat Calculator',
    description: 'Calculate your annual zakat obligation.',
    route: '/zakat',
  },
  {
    title: 'Leasing Calculator',
    description: 'Estimate your Islamic leasing (Ijarah) payments.',
    route: '/leasing',
  },
  {
    title: 'Profit Sharing (Mudarabah)',
    description: 'Split profits based on investment shares.',
    route: '/profit-sharing',
  },
  {
    title: 'Murabaha Calculator',
    description: 'Calculate payments in cost-plus profit sales.',
    route: '/murabaha',
  },
  {
    title: 'Istisna Calculator',
    description: 'Plan stage-based construction project payments.',
    route: '/istisna',
  },
  {
    title: 'Takaful Estimator',
    description: 'Estimate your Islamic insurance contributions.',
    route: '/takaful',
  },
  {
    title: 'Qard Hasan Planner',
    description: 'Create a repayment plan for an interest-free loan.',
    route: '/qard-hasan',
  },
  {
    title: 'Business Partnership Split',
    description: 'Calculate profit sharing in a partnership.',
    route: '/partnership',
  },
  {
    title: 'Islamic Pension Planner',
    description: 'Plan your halal retirement contributions.',
    route: '/pension',
  },
];

const Home = () => {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {calculators.map((calc) => (
        <CalculatorCard key={calc.title} {...calc} />
      ))}
    </div>
  );
};

export default Home;
