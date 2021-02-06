import React from 'react';

const Footer = (props) => {
    return (
        <div className={`basic-fx justify-center-fx ${props.classToDisplay}`}>
                <span>Created by Amar Spahić</span>
            </div>
    );
};

export default Footer;