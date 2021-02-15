import React, { Component } from 'react';
import { getUserData } from '../../../services/Axios/UserRequests';
import { finishBetRequest } from '../../../services/Axios/BetRequests';
import { rightUserCheck } from '../../../services/HelperFunctions/HelperFunctions';
import BetLegend from '../../../components/ShowBets/BetLegend';
import EditBet from '../../../components/Modals/EditBet/EditBet';
import ErrorMessage from '../../../components/Messages/ErrorMessage';
import DifferentStakes from '../../../parts/Bets/DifferentStakes';
import JointBet from '../../../parts/Bets/JointBet';
import Loader from '../../../components/Loaders/Loader';
import SameStakes from '../../../parts/Bets/SameStakes';
import ShowBetsLayout from './ShowBetsLayout';
import SuccessMessage from '../../../components/Messages/SuccessMessage';
import './styles.scss';

class ActiveBets extends Component {
    state = {
        bets: [],
        editModalOpen: false,
        editId: "",
        error: false,
        errorMessage: "",
        filteredData: [],
        filterTitle: "",
        finishID: "",
        finishBetModal: false,
        groupsOpen: false,
        modalOpen: false,
        pageLoaded: false,
        success: false,
        successMessage: "",
        trigger: false,
        winner: ""
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        const getUserPromise = getUserData('get user');
        getUserPromise.then(resUser => {
            const getDataPromise = getUserData('get groups')
            getDataPromise.then(resData => {
                if (resData.data !== "User is not a part of any groups!") {
                    this.setState({
                        groups: resData.data,
                        selectedGroup: resData.data[0]._id,
                        selectedGroupName: resData.data[0].name,
                        user: resUser.data
                    }, () => {
                        this.reRenderBets()
                    })
                }
                else {
                    this.setState({ pageLoaded: true })
                }
            }).catch(err => {
                this.props.history.push('/sign-in')
            })
        }).catch(err => {
            this.props.history.push('/sign-in')
        })

    }

    chooseBetWinner = (e, name) => {
        e.stopPropagation()
        this.setState({ winner: name }, () => {
            this.reRenderBets();
        })
    }

    closeModals = (e) => {
        if (this.state.groupsOpen) {
            if (e.target.className.indexOf('all-bets-container') !== -1 || e.target.className.indexOf('upper-bet-container') !== -1) {
                this.setState({ groupsOpen: false })
            }
        }
        if (this.state.finishBetModal) {
            this.setState({ finishBetModal: false, finishID: "" }, () => {
                this.reRenderBets();
            })
        }
    }

    finishedBetToServer = (e, bet, id) => {
        e.stopPropagation();
        if (this.state.winner !== "") {
            const finishBetPromise = finishBetRequest('finishRequest', this.state.selectedGroup, bet, this.state.winner);
            finishBetPromise.then(res => {
                window.scrollTo(0, 0);
                this.setState({
                    finishID: "",
                    finishBetModal: false,
                    success: true,
                    successMessage: "Bet has been sent for approval!",
                    winner: ""
                }, () => {
                    const getDataPromise = getUserData('get groups')
                    getDataPromise.then(resData => {
                        const selGroup = this.state.selectedGroup;
                        const selName = this.state.selectedGroupName;
                        this.setState({
                            groups: resData.data,
                            selectedGroup: selGroup,
                            selectedGroupName: selName
                        }, () => {
                            this.reRenderBets()
                        })
                    }).catch(err => {
                        this.setState({
                            error: true,
                            errorMessage: "Error getting bets!"
                        })
                    })
                })
            }).catch(err => {
                this.setState({
                    finishID: "",
                    finishBetModal: false,
                    error: true,
                    errorMessage: "Could not finish bet!"
                }, () => {
                    setTimeout(() => this.setState({ error: false, errorMessage: "" }), 1500)
                })
            })
        }

    }

    getUserProfile = (e, name) => {
        this.props.history.push(`/profile/${name}`)
    }

    handleEdit = (id) => {
        this.setState({ editModalOpen: true, editId: id }, () => {
            document.body.style.overflowY = "hidden";
            document.getElementById('modal-container').style.top = `${window.pageYOffset}px`;
        })
    }

    handleFinish = (e, id) => {
        e.stopPropagation();
        this.setState({
            finishBetModal: true,
            finishID: id
        }, () => {
            this.reRenderBets();
        })
    }

    handleGroupChange = (e) => {
        e.stopPropagation();
        if (e.target.innerHTML.indexOf(">") === -1) {
            let newName = e.target.innerHTML;
            const newGroup = this.state.groups.filter(group => group.name === newName);
            this.setState({
                usingFilter: false,
                filterTitle: "",
                groupsOpen: false,
                selectedGroup: newGroup[0]._id,
                selectedGroupName: newGroup[0].name
            }, () => {
                this.updateGroup(newGroup, this.state.groups)
            })
        }
    }

    handleGroupModal = (e) => {
        e.stopPropagation();
        this.setState({
            groupsOpen: true
        })
    }

    hideModal = (e) => {
        if (e.target.id === "modal-container" || e.target.innerHTML === "Quit") {
            document.body.style.overflowY = "auto";
            this.setState({
                editModalOpen: false,
                editId: ""
            })
        }
    }

    reRenderBets() {
        let i = 0;
        let trigger;
        let bets;

        let selectedGroup = this.state.groups.filter(group => group._id === this.state.selectedGroup);
        selectedGroup = selectedGroup[0].activeBets;

        bets = selectedGroup.map(bet => {
            if (bet.finished === false) {
                trigger = true;
                i++;
                if (bet.jointBet) {
                    return <JointBet
                        bet={bet}
                        chooseBetWinner={this.chooseBetWinner}
                        finishedBetToServer={this.finishedBetToServer}
                        finishID={this.state.finishID}
                        getUserProfile={this.getUserProfile}
                        handleEdit={this.handleEdit}
                        handleFinish={this.handleFinish}
                        idx={i}
                        key={bet._id}
                        rightUserCheck={rightUserCheck}
                        type={'active'}
                        winner={this.state.winner}
                        user={this.state.user}
                    />
                }
                else {
                    if (bet.differentStakes) {
                        return <DifferentStakes
                            bet={bet}
                            chooseBetWinner={this.chooseBetWinner}
                            finishedBetToServer={this.finishedBetToServer}
                            finishID={this.state.finishID}
                            getUserProfile={this.getUserProfile}
                            handleFinish={this.handleFinish}
                            handleEdit={this.handleEdit}
                            idx={i}
                            key={bet._id}
                            rightUserCheck={rightUserCheck}
                            type={'active'}
                            winner={this.state.winner}
                            user={this.state.user}
                        />
                    }

                    else {
                        return <SameStakes
                            bet={bet}
                            chooseBetWinner={this.chooseBetWinner}
                            finishedBetToServer={this.finishedBetToServer}
                            finishID={this.state.finishID}
                            getUserProfile={this.getUserProfile}
                            handleFinish={this.handleFinish}
                            handleEdit={this.handleEdit}
                            idx={i}
                            key={bet._id}
                            rightUserCheck={rightUserCheck}
                            type={'active'}
                            winner={this.state.winner}
                            user={this.state.user} />
                    }
                }
            }
            else {
                return false;
            }
        })
        this.setState({
            bets,
            error: false,
            errorMessage: "",
            trigger,
            pageLoaded: true,
            success: false,
            successMessage: "",
        })
    }

    updateGroup = (selectedGroup, newGroup) => {
        this.setState({
            groups: newGroup,
            selectedGroup: selectedGroup[0]._id,
            selectedGroupName: selectedGroup[0].name,
            user: this.state.user
        }, () => {
            this.reRenderBets()
        })
    }

    render() {
        if (this.state.pageLoaded) {
            return (
                <ShowBetsLayout
                    bets={this.state.bets}
                    closeModals={this.closeModals}
                    groups={this.state.groups}
                    groupsOpen={this.state.groupsOpen}
                    handleGroupModal={this.handleGroupModal}
                    handleGroupChange={this.handleGroupChange}
                    pageLoaded={this.state.pageLoaded}
                    selectedGroup={this.state.selectedGroup}
                    selectedGroupName={this.state.selectedGroupName}
                    trigger={this.state.trigger}
                    user={this.props.user}>
                    {this.state.trigger ? this.state.bets : <div className="no-bets-to-show">No active bets to show</div>}
                    <BetLegend />
                    {this.state.error ? <ErrorMessage classToDisplay="message-space" text={this.state.errorMessage} /> : null}
                    {this.state.success ? <SuccessMessage classToDisplay="message-space" text={this.state.successMessage} /> : null}
                    {this.state.editModalOpen ? <EditBet
                        editMode={true}
                        editId={this.state.editId}
                        hideModal={this.hideModal}
                        groups={this.state.groups}
                        selectedGroup={this.state.selectedGroup}
                        user={this.state.user}
                    /> : null}
                </ShowBetsLayout>
            );
        } else {
            return (
                <Loader loading={!this.state.pageLoaded} />
            )
        }
    };
}

export default ActiveBets;