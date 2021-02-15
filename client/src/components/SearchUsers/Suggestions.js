import React from 'react';
import './styles.scss';

const Suggestions = (props) => {
    return (
        <div className="search-holder basic-column-fx align-center-fx">
            {props.suggestionsFromDatabase.map(suggestion => {
                return (
                    <div id="search-line" key={suggestion} className="basic-fx justify-between-fx align-center-fx">
                        <span className="not-chosen">
                            {suggestion}
                        </span>
                        <span className="search-add" onClick={e => props.addRemoveOutsider(suggestion)}>ADD</span>
                    </div>
                )
            })}
        </div>
    );
};

export default Suggestions;