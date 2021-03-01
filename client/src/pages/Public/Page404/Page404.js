import React from 'react';
import ReturnButton from '../../../components/Buttons/ReturnButton';
import { returnToMain } from '../../../services/HelperFunctions/HelperFunctions';
import './styles.scss';

const Page404 = (props) => {
    return (
        <div id="page-404" className="gradient-background basic-column-fx align-center-fx justify-center-fx">
            <div id="title-404">404</div>
            <span>Why are you the way you are?</span>
            <ReturnButton classToDisplay="return-button-space return-button-medium" returnToMain={returnToMain.bind(null, props)} whereTo='Home' text="Charted territory" />
        </div>
    );
};

export default Page404;