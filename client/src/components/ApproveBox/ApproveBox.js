import React from 'react';
import './styles.scss';

const ApproveBox = (props) => {
    return (
        <div className="approval-container basic-fx justify-center-fx">
            <div className="approval-items-holder basic-fx justify-around-fx align-items-fx">
                <span className="approval-item" onClick={e => props.handleApproval(e, props, "Accept")}>Accept</span>
                <span className="approval-item" onClick={e => props.handleApproval(e, props, "Decline")}>Decline</span>
            </div>
        </div>
    );
};

export default ApproveBox;