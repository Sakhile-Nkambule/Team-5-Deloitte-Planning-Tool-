

const Card = ({children, bg='bg-lime-100'}) => {
  return  <div className ={`${bg} p-6 rounded-lg shadow-sm`}> {children} </div>;
};

export default Card;