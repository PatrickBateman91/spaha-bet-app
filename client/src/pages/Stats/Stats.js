import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeGroup } from '../../components/Groups/GroupsDropdown/ChangeGroupFunction';
import * as d3 from "d3";
import d3Tip from "d3-tip";
import { legendColor } from 'd3-svg-legend';
import { returnToMain, windowWidth } from '../../services/HelperFunctions/HelperFunctions';
import GroupsDropdown from '../../components/Groups/GroupsDropdown/GroupsDropdown';
import Loader from '../../components/Loaders/Loader';
import ReturnButton from '../../components/Buttons/ReturnButton';
import './styles.scss';

class Stats extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            finishedBets: false,
            groupsOpen: false,
            noGroups: false,
            selectedGroup: "",
            selectedGroupName: ""
        }
    }

    componentDidMount() {
        document.getElementById('root').height = "100%";
        window.scrollTo(0, 0);
        if (this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                this.setState({
                    pageLoaded: true
                }, () => {
                    this.filterData()
                })
            }
        }
    }

    componentDidUpdate(prevProps) {
        document.getElementById('root').height = "100%";
        if (!prevProps.appLoaded && this.props.appLoaded) {
            if (this.props.user === "guest") {
                this.props.history.push('/');
            } else {
                this.setState({
                    pageLoaded: true
                }, () => {
                    this.filterData()
                })
            }
        }
    }

    createSVGs = (finished, whichData, innerR, chartOrder, titleText) => {
        const handleMouseOut = (d, i, n) => {
            d3.select(n[i])
                .transition('changeSliceFill').duration(300)
                .attr('fill', colour(d.data.name));
        }

        const handleMouseOver = (d, i, n) => {
            let darkerColours = ["#ffa8a8", "#a6b8e8", "#a5a5a5", "#a8a8a8", "#f0d7d2", "#ff6b6b", "#ff7dff", "#f9ddb5", "#cee9be", "#ffeaa8", "#e3f1f6", "#e7beab", "#6fff6f", "#ffa5ff", "#cfd5db", "#ffff79"]

            return d3.select(n[i])
                .transition('changeSliceFill').duration(300)
                .attr('fill', darkerColours[i]);
        }

        const tip = d3Tip()
            .html(d => {
                return finished === false ? `
        <div class="tip-holder">
        <span class="tip-chart">${d.data[whichData]}${whichData !== "numberOfTimes" && whichData !== "numberOfFinishedBets" ? ' $' : ''}</span>
        ${whichData !== "numberOfTimes" && whichData !== "numberOfFinishedBets" ? whichData === "standsToGain" ? d.data.nonMoneyStandsToGain !== "" ?
                        `<div class="additional-tip-info">
        <span class="other-tip-item">${d.data.nonMoneyStandsToGain}</span>
        </div>` : ""
                        : d.data.nonMoneyInvested !== "" ? `<div class="additional-tip-info">
    <span class="other-tip-item"> ${d.data.nonMoneyInvested}</span>
        </div>`  : "" : ""}
        </div>`
                    :
                    `<div class="tip-holder">
        <span class="tip-chart">${d.data[whichData]}${whichData === "totalMoneyEarned" || whichData === "totalMoneyLost" ? ' $' : ''}</span>
        ${whichData === "totalMoneyEarned" || whichData === "totalMoneyLost" ? whichData === "totalMoneyEarned" ?
                        d.data.nonMoneyWins !== "" ? `<div class="additional-tip-info">
      <span  class="other-tip-item"> ${d.data.nonMoneyWins}</span>
        </div>`
                            :
                            "" :
                        d.data.nonMoneyLosses !== "" ?
                            `<div class="additional-tip-info">
        <span class="other-tip-item"> ${d.data.nonMoneyLosses}</span>
        </div>`
                            : "" : ""}
        </div>`
            });



        const dims = { height: 300, width: 300, radius: 150 };
        const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }

        const arcTweenEnter = (d) => {
            let i = d3.interpolate(d.endAngle, d.startAngle)

            return function (t) {
                d.startAngle = i(t);
                return arcPath(d);
            }
        };


        const svg = d3.select('#stats-svg-holder')
            .append('div')
            .attr('class', "single-pie-chart")
            .append('svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 450 450");

        const graph = svg.append('g')
            .attr('transform', `translate(${cent.x}, ${cent.y})`);

        const pie = d3.pie()
            .sort(null)
            .value(d => d[whichData])

        const arcPath = d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius / innerR);

        const colorArray = ["#7F0000", "#172a5b", "#000", "#389D9D", "#D38C7B", "#4D0000", "#800080", "#EE9C28", "#70BF40", "#FFC300", "#ADD8E6", "#A0522D", "#006400", "#FF00FF", "#778899", "#808000"]
        const filteredColorArray = [];


        let filteredData;

        let copyData = [...this.state.data];
        filteredData = copyData.filter((item, i) => {
            if (item[whichData] > 0) {
                filteredColorArray.push(colorArray[i]);
            }
            return item[whichData] > 0;
        })

        const colour = d3.scaleOrdinal(filteredColorArray);

        colour.domain(filteredData.map(d => {
            return d.name;
        }))

        const legendGroup = svg.append('g')
            .attr('transform', `translate(${dims.width + 60}, 40)`);

        const legend = legendColor()
            .shape('circle')
            .scale(colour);
        legendGroup.call(legend)



        const paths = graph.selectAll('path')
            .data(pie(this.state.data));


        paths.enter()
            .append('path')
            .attr('class', 'arc')
            .attr('d', arcPath)
            .attr('stroke', "#fff")
            .attr('stroke-width', 2)
            .attr('fill', d => colour(d.data.name))
            .transition().duration(750)
            .attrTween('d', arcTweenEnter);
        

        graph.selectAll('path')
            .on('mouseover', (d, i, n) => {
                tip.show(d, n[i])
                handleMouseOver(d, i, n);
            })
            .on('mouseout', (d, i, n) => {
                tip.hide();
                handleMouseOut(d, i, n)
            });

        graph.call(tip);
        const newDiv = document.createElement("DIV");
        newDiv.innerHTML = titleText;
        newDiv.className = "single-pie-title";
        if (document.getElementById('stats-svg-holder').childNodes.length === 1) {
            document.getElementById('stats-svg-holder').childNodes[0].appendChild(newDiv);
        }
        else {
            document.getElementById('stats-svg-holder').childNodes[chartOrder - 1].appendChild(newDiv);
        }

    }

    filterData = () => {
        let selectedGroup = this.props.groups.filter(group => group._id === this.props.selectedGroup);
        selectedGroup = selectedGroup[0];
        let people = [...selectedGroup.people];
        let countObject = [];
        let finishedBetsTrigger = false;
        let activeBetsTrigger = false;
        let activeBetMoneyTrigger = false;
        let finishedBetsMoneyTrigger = false;

        people.forEach(person => {
            countObject.push({
                name: person,
                numberOfTimes: 0,
                numberOfFinishedBets: 0,
                totalMoneyEarned: 0,
                totalMoneyLost: 0,
                totalMoneyInvested: 0,
                betsWon: 0,
                betsLost: 0,
                standsToGain: 0,
                nonMoneyInvested: "",
                nonMoneyStandsToGain: "",
                nonMoneyWins: "",
                nonMoneyLosses: ""
            })
        })

        selectedGroup.activeBets.forEach(bet => {
            //Novčane opklade‚
            activeBetsTrigger = true;
            if (bet.type === "money") {
                activeBetMoneyTrigger = true;
                //Različiti ulozi
                if (bet.differentStakes) {
                    //Ako su samo dva natjecatelja

                    if (bet.participants.length === 2) {
                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {
                                    if (i === 0) {
                                        countObject[j].numberOfTimes++;
                                        countObject[j].totalMoneyInvested += parseFloat(bet.participants[i + 1].singleStake);
                                        countObject[j].standsToGain += parseFloat(bet.participants[i].singleStake);
                                    }
                                    else {
                                        countObject[j].numberOfTimes++;
                                        countObject[j].totalMoneyInvested += parseFloat(bet.participants[i - 1].singleStake);
                                        countObject[j].standsToGain += parseFloat(bet.participants[i].singleStake);
                                    }
                                }
                            }
                        }
                    }

                }
                //Isti ulozi
                else {
                    //Združena novčana opklada
                    if (bet.jointBet) {

                        for (let i = 0; i < bet.participants[0].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[0].participants[i] === countObject[j].name) {
                                    countObject[j].numberOfTimes++;

                                    countObject[j].totalMoneyInvested += (parseFloat(bet.participants[1].bet) / bet.participants[0].participants.length);
                                    countObject[j].standsToGain += (parseFloat(bet.participants[0].bet) / bet.participants[0].participants.length)
                                }
                            }
                        }

                        for (let i = 0; i < bet.participants[1].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[1].participants[i] === countObject[j].name) {
                                    countObject[j].numberOfTimes++;

                                    countObject[j].totalMoneyInvested += (parseFloat(bet.participants[0].bet) / bet.participants[1].participants.length);
                                    countObject[j].standsToGain += (parseFloat(bet.participants[1].bet) / bet.participants[1].participants.length);
                                }
                            }
                        }

                    }
                    //Obična opklada - ISTI ULOZI
                    else {
                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {
                                    countObject[j].numberOfTimes++;
                                    countObject[j].totalMoneyInvested += parseFloat(bet.amount);
                                    countObject[j].standsToGain += parseFloat(bet.amount) * (bet.participants.length - 1);
                                    break;
                                }
                            }
                        }

                    }

                }
            }
            else {
                //Provjera nejednakih opklada ako je jedan dio novčani
                if (bet.differentStakes) {
                    //Dvoje natjecatelja
                    if (bet.participants.length === 2) {

                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {
                                    countObject[j].numberOfTimes++;
                                    //Ako nije broj
                                    if (i === 0) {
                                        if (isNaN(bet.participants[i].singleStake)) {
                                            if (countObject[j].nonMoneyStandsToGain === "") {
                                                countObject[j].nonMoneyStandsToGain += bet.participants[i].singleStake;
                                            }
                                            else {
                                                countObject[j].nonMoneyStandsToGain += `, ${bet.participants[i].singleStake}`;
                                            }
                                        }
                                        if (isNaN(bet.participants[i + 1].singleStake)) {
                                            if (countObject[j].nonMoneyInvested === "") {
                                                countObject[j].nonMoneyInvested += bet.participants[i + 1].singleStake;
                                            }
                                            else {
                                                countObject[j].nonMoneyInvested += `, ${bet.participants[i + 1].singleStake}`;
                                            }

                                        }
                                        //Ako je broj
                                        if (isNaN(bet.participants[i].singleStake) === false) {

                                            countObject[j].standsToGain += parseFloat(bet.participants[i].singleStake);
                                        }
                                        if (isNaN(bet.participants[i + 1].singleStake) === false) {

                                            countObject[j].totalMoneyInvested += parseFloat(bet.participants[i + 1].singleStake);
                                        }
                                    }
                                    else {
                                        if (isNaN(bet.participants[i].singleStake)) {
                                            if (countObject[j].nonMoneyStandsToGain === "") {
                                                countObject[j].nonMoneyStandsToGain += bet.participants[i].singleStake;
                                            }
                                            else {
                                                countObject[j].nonMoneyStandsToGain += `, ${bet.participants[i].singleStake}`;
                                            }


                                        }
                                        if (isNaN(bet.participants[i - 1].singleStake)) {
                                            if (countObject[j].nonMoneyInvested === "") {
                                                countObject[j].nonMoneyInvested += bet.participants[i - 1].singleStake;
                                            }
                                            else {
                                                countObject[j].nonMoneyInvested += `, ${bet.participants[i - 1].singleStake}`;
                                            }

                                        }
                                        //Ako je broj
                                        if (isNaN(bet.participants[i].singleStake) === false) {
                                            countObject[j].standsToGain += parseFloat(bet.participants[i].singleStake);
                                        }
                                        if (isNaN(bet.participants[i - 1].singleStake) === false) {
                                            countObject[j].totalMoneyInvested += parseFloat(bet.participants[i - 1].singleStake);
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
                // Jednaki NEnovčani ulozi
                else {
                    //Dvoje natjecatelja

                    if (bet.jointBet) {
                        for (let i = 0; i < bet.participants[0].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[0].participants[i] === countObject[j].name) {
                                    countObject[j].numberOfTimes++;


                                    if (isNaN(bet.participants[1].bet) === false) {
                                        countObject[j].totalMoneyInvested += parseFloat(bet.participants[1].bet / bet.participants[0].participants.length)
                                    }
                                    else {
                                        if (countObject[j].nonMoneyInvested === "") {
                                            countObject[j].nonMoneyInvested += bet.participants[1].bet;
                                        }
                                        else {
                                            countObject[j].nonMoneyInvested += `, ${bet.participants[1].bet}`;
                                        }

                                    }

                                    if (isNaN(bet.participants[0].bet) === false) {
                                        countObject[j].standsToGain += parseFloat(bet.participants[0].bet / bet.participants[0].participants.length)
                                    }
                                    else {
                                        if (countObject[j].nonMoneyStandsToGain === "") {
                                            countObject[j].nonMoneyStandsToGain += bet.participants[0].bet;
                                        }
                                        else {
                                            countObject[j].nonMoneyStandsToGain += `, ${bet.participants[0].bet}`;
                                        }


                                    }
                                }
                            }
                        }

                        for (let i = 0; i < bet.participants[1].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[1].participants[i] === countObject[j].name) {
                                    countObject[j].numberOfTimes++;

                                    if (isNaN(bet.participants[0].bet) === false) {
                                        countObject[j].totalMoneyInvested += parseFloat(bet.participants[0].bet / bet.participants[1].participants.length)
                                    }
                                    else {
                                        if (countObject[j].nonMoneyInvested === "") {
                                            countObject[j].nonMoneyInvested += bet.participants[0].bet;
                                        }
                                        else {

                                            countObject[j].nonMoneyInvested += `, ${bet.participants[0].bet}`;
                                        }

                                    }

                                    if (isNaN(bet.participants[1].bet) === false) {
                                        countObject[j].standsToGain += parseFloat(bet.participants[1].bet / bet.participants[1].participants.length)
                                    }
                                    else {
                                        if (countObject[j].nonMoneyStandsToGain === "") {
                                            countObject[j].nonMoneyStandsToGain += bet.participants[1].bet;
                                        }
                                        else {
                                            countObject[j].nonMoneyStandsToGain += `, ${bet.participants[1].bet}`;
                                        }


                                    }
                                }
                            }
                        }
                    }


                    else {
                        if (bet.participants.length === 2) {
                            for (let i = 0; i < bet.participants.length; i++) {
                                for (let j = 0; j < countObject.length; j++) {
                                    if (bet.participants[i].name === countObject[j].name) {
                                        countObject[j].numberOfTimes++;


                                        if (countObject[j].nonMoneyInvested === "") {
                                            countObject[j].nonMoneyInvested += bet.stake;
                                        }
                                        else {
                                            countObject[j].nonMoneyInvested += `, ${bet.stake}`;
                                        }

                                        if (countObject[j].nonMoneyStandsToGain === "") {
                                            countObject[j].nonMoneyStandsToGain += bet.stake;
                                        }
                                        else {
                                            countObject[j].nonMoneyStandsToGain += `, ${bet.stake}`;
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }

        })

        selectedGroup.finishedBets.forEach(bet => {
            finishedBetsTrigger = true;
            //Novčane opklade
            if (bet.type === "money") {
                finishedBetsMoneyTrigger = true;
                //Različiti ulozi
                if (bet.differentStakes) {

                    for (let i = 0; i < bet.participants.length; i++) {
                        for (let j = 0; j < countObject.length; j++) {
                            if (bet.participants[i].name === countObject[j].name) {
                                if (i === 0) {

                                    if (countObject[j].name === bet.winner) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsWon++;
                                        countObject[j].totalMoneyEarned += parseFloat(bet.participants[i].singleStake);
                                    }
                                    else if (bet.winner !== "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsLost++;
                                        countObject[j].totalMoneyLost += parseFloat(bet.participants[i + 1].singleStake);
                                    }
                                    else if (bet.winner === "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                                else {
                                    if (countObject[j].name === bet.winner) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsWon++;
                                        countObject[j].totalMoneyEarned += parseFloat(bet.participants[i].singleStake);
                                    }
                                    else if (bet.winner !== "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].totalMoneyLost += parseFloat(bet.participants[i - 1].singleStake);
                                    }
                                    else if (bet.winner === "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }
                    }
                }
                //Isti ulozi

                else {
                    //Združena novčana opklada

                    if (bet.jointBet) {

                        for (let i = 0; i < bet.participants[0].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[0].participants[i] === countObject[j].name) {
                                    if (bet.winner.indexOf(countObject[j].name) !== -1) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsWon++;
                                        countObject[j].totalMoneyEarned += parseFloat(bet.participants[0].bet / bet.participants[0].participants.length);
                                    }
                                    else if ((bet.winner.indexOf("nobody") === -1)) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsLost++;
                                        countObject[j].totalMoneyLost += parseFloat(bet.participants[1].bet / bet.participants[0].participants.length);
                                    }
                                    else if ((bet.winner.indexOf("nobody") !== -1)) {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }

                        for (let i = 0; i < bet.participants[1].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[1].participants[i] === countObject[j].name) {

                                    if (bet.winner.indexOf(countObject[j].name) !== -1) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsWon++;
                                        countObject[j].totalMoneyEarned += parseFloat(bet.participants[1].bet / bet.participants[1].participants.length);
                                    }
                                    else if ((bet.winner.indexOf("nobody") === -1)) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsLost++;
                                        countObject[j].totalMoneyLost += parseFloat(bet.participants[0].bet / bet.participants[1].participants.length);
                                    }
                                    else if (bet.winner.indexOf("nobody") !== -1) {
                                        countObject[j].numberOfFinishedBets++;
                                    }

                                }
                            }
                        }
                    }

                    //Obična opklada - ISTI ULOZI
                    else {
                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {

                                    if (countObject[j].name === bet.winner) {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsWon++;
                                        countObject[j].totalMoneyEarned += parseFloat(bet.amount * (bet.participants.length - 1));
                                    }
                                    else if (bet.winner !== "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                        countObject[j].betsLost++;
                                        countObject[j].totalMoneyLost += parseFloat(bet.amount)
                                    }
                                    else if (bet.winner === "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }
                    }

                }

            }

            else {
                //Provjera nejednakih opklada ako je jedan dio novčani *NAPOMENA: JOINTBET nikad nije differentStakes = true
                if (bet.differentStakes) {
                    //Dvoje natjecatelja
                    if (bet.participants.length === 2) {

                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {
                                    if (countObject[j].name === bet.winner) {
                                        countObject[j].betsWon++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (i === 0) {

                                            //Ako nije broj
                                            if (isNaN(bet.participants[i].singleStake)) {
                                                if (countObject[j].nonMoneyWins === "") {
                                                    countObject[j].nonMoneyWins += bet.participants[i].singleStake;
                                                }
                                                else {
                                                    countObject[j].nonMoneyWins += `, ${bet.participants[i].singleStake}`;
                                                }
                                            }

                                            //Ako je broj
                                            else {
                                                countObject[j].totalMoneyEarned += parseFloat(bet.participants[i].singleStake);
                                            }
                                        }
                                        else {
                                            if (isNaN(bet.participants[i].singleStake)) {
                                                if (countObject[j].nonMoneyWins === "") {
                                                    countObject[j].nonMoneyWins += bet.participants[i].singleStake;
                                                }
                                                else {
                                                    countObject[j].nonMoneyWins += `, ${bet.participants[i].singleStake}`;
                                                }
                                            }
                                            //Ako je broj
                                            else {
                                                countObject[j].totalMoneyEarned += parseFloat(bet.participants[i].singleStake);
                                            }
                                        }
                                    }
                                    else if (bet.winner !== "nobody") {
                                        countObject[j].betsLost++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (i === 0) {
                                            //Ako nije broj
                                            if (isNaN(bet.participants[i + 1].singleStake)) {
                                                if (countObject[j].nonMoneyLosses === "") {
                                                    countObject[j].nonMoneyLosses += bet.participants[i + 1].singleStake;
                                                }
                                                else {
                                                    countObject[j].nonMoneyLosses += `, ${bet.participants[i + 1].singleStake}`;
                                                }
                                            }

                                            //Ako je broj
                                            if (isNaN(bet.participants[i + 1].singleStake) === false) {
                                                countObject[j].totalMoneyLost += parseFloat(bet.participants[i + 1].singleStake);
                                            }
                                        }
                                        else {
                                            if (isNaN(bet.participants[i - 1].singleStake)) {
                                                if (countObject[j].nonMoneyLosses === "") {
                                                    countObject[j].nonMoneyLosses += bet.participants[i - 1].singleStake;
                                                }
                                                else {
                                                    countObject[j].nonMoneyLosses += `, ${bet.participants[i - 1].singleStake}`;
                                                }

                                            }
                                            //Ako je broj
                                            if (isNaN(bet.participants[i - 1].singleStake) === false) {
                                                countObject[j].totalMoneyLost += parseFloat(bet.participants[i - 1].singleStake);
                                            }
                                        }

                                    } else if (bet.winner === "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }

                    }

                }
                // Jednaki Nenovčani ulozi

                else {
                    //Dvoje natjecatelja

                    if (bet.jointBet) {
                        for (let i = 0; i < bet.participants[0].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[0].participants[i] === countObject[j].name) {
                                    if (bet.winner.indexOf(countObject[j].name) !== -1) {
                                        countObject[j].betsWon++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (isNaN(bet.participants[0].bet) === false) {
                                            countObject[j].totalMoneyEarned += parseFloat(bet.participants[0].bet / bet.participants[0].participants.length)
                                        }
                                        else {
                                            if (countObject[j].nonMoneyWins === "") {
                                                countObject[j].nonMoneyWins += bet.participants[0].bet;
                                            }
                                            else {
                                                countObject[j].nonMoneyWins += `, ${bet.participants[0].bet}`;
                                            }
                                        }
                                    }
                                    else if (bet.winner.indexOf("nobody") === -1) {
                                        countObject[j].betsLost++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (isNaN(bet.participants[1].bet) === false) {
                                            countObject[j].totalMoneyLost += parseFloat(bet.participants[1].bet / bet.participants[0].participants.length)
                                        }

                                        else {
                                            if (countObject[j].nonMoneyLosses === "") {
                                                countObject[j].nonMoneyLosses += bet.participants[1].bet;
                                            }
                                            else {
                                                countObject[j].nonMoneyLosses += `, ${bet.participants[1].bet}`;
                                            }

                                        }
                                    }
                                    else if (bet.winner.indexOf("nobody") !== -1) {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }

                        for (let i = 0; i < bet.participants[1].participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[1].participants[i] === countObject[j].name) {
                                    if (bet.winner.indexOf(countObject[j].name) !== -1) {
                                        countObject[j].betsWon++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (isNaN(bet.participants[1].bet) === false) {
                                            countObject[j].totalMoneyEarned += parseFloat(bet.participants[1].bet / bet.participants[1].participants.length)
                                        }
                                        else {
                                            if (countObject[j].nonMoneyWins === "") {
                                                countObject[j].nonMoneyWins += bet.participants[1].bet;
                                            }
                                            else {
                                                countObject[j].nonMoneyWins += `, ${bet.participants[1].bet}`;
                                            }


                                        }

                                    }
                                    else if (bet.winner.indexOf("nobody") === -1) {
                                        countObject[j].betsLost++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (isNaN(bet.participants[0].bet) === false) {
                                            countObject[j].totalMoneyLost += parseFloat(bet.participants[0].bet / bet.participants[1].participants.length)
                                        }
                                        else {
                                            if (countObject[j].nonMoneyLosses === "") {
                                                countObject[j].nonMoneyLosses += bet.participants[0].bet;
                                            }
                                            else {
                                                countObject[j].nonMoneyLosses += `, ${bet.participants[0].bet}`;
                                            }

                                        }
                                    }
                                    else if (bet.winner.indexOf("nobody") !== -1) {
                                        countObject[j].numberOfFinishedBets++;
                                    }
                                }
                            }
                        }
                    }


                    else {
                        for (let i = 0; i < bet.participants.length; i++) {
                            for (let j = 0; j < countObject.length; j++) {
                                if (bet.participants[i].name === countObject[j].name) {
                                    if (countObject[j].name === bet.winner) {
                                        countObject[j].betsWon++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (countObject[j].nonMoneyWins === "") {
                                            countObject[j].nonMoneyWins += bet.stake;
                                        }
                                        else {
                                            countObject[j].nonMoneyWins += `, ${bet.stake}`;
                                        }



                                    }
                                    else if (bet.winner !== "nobody") {
                                        countObject[j].betsLost++;
                                        countObject[j].numberOfFinishedBets++;
                                        if (countObject[j].nonMoneyLosses === "") {
                                            countObject[j].nonMoneyLosses += bet.stake;
                                        }
                                        else {
                                            countObject[j].nonMoneyLosses += `, ${bet.stake}`;
                                        }
                                    }
                                    else if (bet.winner === "nobody") {
                                        countObject[j].numberOfFinishedBets++;
                                    }

                                }
                            }
                        }

                    }

                }

            }


        })

        let i = 1;
        this.setState({ data: countObject, finishedBetsTrigger, activeBetsTrigger }, () => {
            if (activeBetsTrigger) {
                this.createSVGs(false, 'numberOfTimes', 100, i, "Number of active bets:");
                i++;
            }
            if (finishedBetsTrigger) {
                this.createSVGs(false, 'numberOfFinishedBets', 100, i, "Number of finished bets:");
                i++;
            }
            if (activeBetMoneyTrigger) {
                this.createSVGs(false, 'standsToGain', 25, i, "Potential money earnings:");
                i++;
                this.createSVGs(false, 'totalMoneyInvested', 15, i, "Potencijal money losses:");
                i++;
            }
            if (finishedBetsTrigger) {
                this.createSVGs(true, 'betsWon', 10, i, "Number of bets won:");
                i++;
                this.createSVGs(true, 'betsLost', 6, i, "Number of bets lost:");
                i++;
                if (finishedBetsMoneyTrigger) {
                    this.createSVGs(true, 'totalMoneyEarned', 3, i, "Money won:");
                    i++;
                    this.createSVGs(true, 'totalMoneyLost', 2, i, "Money lost:");
                    i++;
                }
            }
        });
    }

    handleGroupChange = (ID, e) => {
        e.stopPropagation();
        changeGroup(this.props.groups, ID, this.props.setGroup, this.props.setGroupName);
        document.getElementById('stats-svg-holder').innerHTML = "";
        this.setState({
            groupsOpen: false,
        }, () => {
            this.filterData()
        })
    }

    handleGroupModal = (e) => {
        e.stopPropagation();
        this.setState({
            groupsOpen: true
        })
    }

    hideModal = () => {
        this.setState({
            groupsOpen: false
        })
    }

    returnToHome = () => {
        window.location.replace('https://spaha-betapp.netlify.app');
    }

    render() {
        return (
            <div className="main-container">
                {this.state.pageLoaded ?
                    <div id="stats-container" className="main-container gradient-background basic-column-fx wrap-fx" onClick={this.hideModal}>
                        <div className="basic-column-fx stats-body">
                        <div id="stats-title" className="basic-fx align-center-fx justify-around-fx">
                            <div className="statistic-main-title">Stats</div>
                            <div id="active-bets-group-container" className="relative">
                                <GroupsDropdown
                                    groups={this.props.groups}
                                    groupsOpen={this.state.groupsOpen}
                                    handleGroupModal={this.handleGroupModal}
                                    handleGroupChange={this.handleGroupChange}
                                    selectedGroup={this.props.selectedGroup}
                                    selectedGroupName={this.props.selectedGroupName}
                                />
                            </div>
                            {windowWidth(480) ? <ReturnButton
                                classToDisplay="return-button-small"
                                returnToMain={this.returnToHome}
                                text="Main menu"
                            /> : null}
                        </div>
                        <div id="stats-svg-holder" className="basic-fx wrap-fx justify-around-fx">


                        </div>

                        <div className="stats-no-finished-bets basic-fx justify-center-fx align-center-fx">
                        {!this.state.activeBetsTrigger && !this.state.finishedBetsTrigger ? <span>There are no bets in this group!</span> : null}
                        </div>

                        {this.state.noGroups ? <div className="stats-no-finished-bets basic-fx justify-center-fx align-center-fx"><span>You are not part of any groups yet!</span></div> : null}
                        </div>
                        <ReturnButton
                            returnToMain={this.returnToHome}
                            classToDisplay="justify-center-fx return-button-space return-button-medium"
                            text="Main menu"
                        />
                    </div>
                    : <Loader loading={this.state.pageLoaded} />}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        appLoaded: state.appStates.appLoaded,
        groups: state.groups,
        selectedGroup: state.appStates.selectedGroup,
        selectedGroupName: state.appStates.selectedGroupName,
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setGroup: (id) => {
            dispatch({ type: "appStates/setGroup", payload: id })
        },
        setGroupName: (name) => {
            dispatch({ type: "appStates/setGroupName", payload: name })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stats);