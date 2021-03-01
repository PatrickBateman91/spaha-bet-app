import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const Suggestions = (props) => {
   const suggestionDivs = props.suggestions.map(suggestion => {
       return (
          <div className="suggestion-item basic-fx align-center-fx justify-between-fx" key={suggestion} onClick={e => props.handleAddPopularBet(e, suggestion)}>
               <span>{suggestion}</span>
               <FontAwesomeIcon icon={faPlus} />
          </div>
       )
   })
    return (
        <div className="suggestion-results-container basic-fx align-center-fx">
            <div className="basic-column-fx align-center-fx">
            {suggestionDivs}
            </div>
        </div>
    );
};

export default Suggestions;