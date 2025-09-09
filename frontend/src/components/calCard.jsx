import { useNavigate } from 'react-router-dom';

const CalculatorCard = ({ title, description, route }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className="bg-white p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition duration-300"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default CalculatorCard;
