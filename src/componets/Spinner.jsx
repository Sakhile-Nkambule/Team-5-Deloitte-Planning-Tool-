import { HashLoader } from "react-spinners";
const override ={
    display : 'block',
    margin : '100px auto'

}

const Spinner = ({loading}) => {
  return (
    <HashLoader
    color="#88c567"
    loading = {loading}
    cssOverride={override}
    size= {50} 
    />
  );
};

export default Spinner;