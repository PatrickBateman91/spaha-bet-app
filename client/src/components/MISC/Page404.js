import React from 'react';
import ReturnButton from './ReturnButton';
import {returnToMain} from '../DumbComponents/SimpleFunctions';

const Page404 = (props) => {
    return (
        <div id="page-404" className="basic-column-fx align-center-fx justify-center-fx">
            <div id="title-404">404</div>
            <span>Why are you the way you are?</span>
            <ReturnButton classToDisplay="return-center-auth-button" returnToMain={returnToMain.bind(null, props)} whereTo='Home' text="Charted territory" />
        </div>
    );
};

export default Page404;