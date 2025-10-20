import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import Portfolio from '../components/Portfolio.jsx';
import StockSearch from '../components/SearchFunction.jsx';


const CombinedDashboard = () => {


    return (
        <div>
            <div>
            <StockSearch/> 
            <Sidebar/>
            <Header/>
            <Portfolio/>
            </div>
        </div>
    );
};

export default CombinedDashboard;