import React from 'react';
import './styles.scss';

const SearchUsers = (props) => {
    return (
        <div id="search-users-container" className="basic-fx justify-between-fx">
            <label htmlFor="search-users">Someone else?</label>
            <input
                type="text"
                name="search-users"
                id="search-users-to-add"
                placeholder="Search database for users to add"
                autoComplete="nickname"
                onChange={props.handleSuggestions}
            ></input>
        </div>
    );
};

export default SearchUsers;