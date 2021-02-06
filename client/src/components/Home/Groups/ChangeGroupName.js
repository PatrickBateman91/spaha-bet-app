import React from 'react';

const ChangeGroupName = (props) => {
    return (
        <div id="change-account-holder" className="basic-column-fx justify-between-fx align-center-fx wrap-fx">
           <form name="change-group-name" id="change-group-name" onSubmit={props.handleChangeGroupName}>
                <div className="auth-form-holder basic-column-fx wrap-fx justify-center-fx align-center-fx">
           
                    <div className="change-account-line">
                        <label htmlFor="new-group-name">New group name</label>
                        <input type="text" name="new-group-name" id="new-group-name" placeholder="type new group name" autoComplete="group name" onChange={props.hideMessages}></input>
                    </div>

                    <div className="auth-button">
                        <button type="submit" >Change group name</button>
                    </div>
                </div>
                </form>
        </div>
    );
};

export default ChangeGroupName;