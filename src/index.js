import HystoriData from './hystoridata.json';
import React from 'react';
import ReactDOM from 'react-dom';
import Hystori from './Hystori.jsx';
import './index.css';

// Render to root #id
ReactDOM.render(<Hystori data={HystoriData} />, document.getElementById('root'));
