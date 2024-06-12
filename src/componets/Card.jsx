

const Card = ({children, bg='bg-green-100'}) => {
  return  <div className ={`${bg} p-6 rounded-lg shadow-sm`}> {children} </div>;
};

export default Card;