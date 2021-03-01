import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketballBall, faGamepad, faEllipsisH, faFutbol, faLandmark, faMapMarkerAlt, faMusic, faVideo, faViruses} from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

const Containers = (props) => {
    const categories = [
        {name:"Football", icon: faFutbol},
        {name:"Basketball", icon: faBasketballBall},
        {name:"Movies", icon: faVideo},
        {name:"Music", icon: faMusic},
        {name:"Politics", icon: faLandmark},
        {name:"Games", icon: faGamepad},
        {name:"Local", icon: faMapMarkerAlt},
        {name:"COVID", icon: faViruses},
        {name:"Miscellaneous", icon: faEllipsisH}
    ]

    const categoriesDivs = categories.map(category => {
        return (
            <div className={`single-category-container ${props.selectedCategory === category.name.toLowerCase() ? "selected-category" : ""} basic-column-fx justify-center-fx align-center-fx`} key={category.name} onClick={e => props.changeCategory(e, category.name.toLowerCase())}>
                <span>{category.name}</span>
                <FontAwesomeIcon icon={category.icon} />
            </div>
        )
    })
    return (
        <div className="categories-container basic-fx wrap-fx">
            {categoriesDivs}
        </div>
    );
};

export default Containers;