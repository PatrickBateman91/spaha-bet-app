import React from 'react';
import './styles.scss';

const SuccessModal = (props) => {
    return (
        <div id="success-modal-container" className="basic-fx justify-center-fx align-center-fx">
            <span>{props.message}</span>
        </div>
    );
};

export default SuccessModal;