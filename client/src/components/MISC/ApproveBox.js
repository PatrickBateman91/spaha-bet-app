import React from 'react';

const ApproveBox = (props) => {
    return (
        <div className="approval-container basic-fx justify-center-fx">
            <div onClick={e => props.handleApproval(e, props)} className="approval-items-holder basic-fx justify-around-fx align-items-fx">
                <span className="approval-item">Accept</span>
                <span className="approval-item">Decline</span>
                </div>
        </div>
    );
};

export default ApproveBox;