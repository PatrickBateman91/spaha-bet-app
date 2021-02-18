import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import './assets/App.scss';

import Home from './pages/Home/Home';
import Footer from './parts/Footer/Footer';

import AccountDeactivated from './pages/Auth/DeactivateAccount/AccountDeactivated';
import MainAuth from './pages/Auth/Authentication/MainAuth';
import ChangeAccountDetails from './pages/Auth/ChangeAccountDetails/ChangeAccountDetails';
import ChangeProfilePicture from './pages/Auth/ChangeProfilePicture/ChangeProfilePicture';
import DeactivateAccount from './pages/Auth/DeactivateAccount/DeactivateAccount';
import SignedOutPage from './pages/Auth/Authentication/SignOut';
import ResendPassword from './pages/Auth/ResendPassword/ResendPassword';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
import PublicProfile from './pages/Public/PublicProfile/PublicProfile';

import AddNewBet from './pages/Bets/AddNewBet/AddNewBet';
import ActiveBets from './pages/Bets/ShowBets/ActiveBets';
import FinishedBets from './pages/Bets/ShowBets/FinishedBets';
import BetApprovals from './pages/Bets/BetApprovals/BetApprovals';

import CreateNewGroup from './pages/Groups/CreateNewGroup/CreateNewGroup';
import JoinNewGroup from './pages/Groups/JoinNewGroup/JoinNewGroup';
import ManageGroups from './pages/Groups/ManageGroups/ManageGroups';

import Stats from './pages/Stats/Stats';
import Page404 from './pages/Public/Page404/Page404';


function App(props) {
  return (
    <Fragment>
      <Switch>
        <Route exact path='/' component={Home} />

        <Route path='/add-bet' component={AddNewBet} />
        <Route {...props} path='/active-bets' component={ActiveBets} />
        <Route {...props} path='/finished-bets' component={FinishedBets} />
        <Route {...props} path='/bet-approvals' component={BetApprovals} />

        <Route {...props} path='/create-new-group' component={CreateNewGroup} />
        <Route {...props} path='/join-new-group' component={JoinNewGroup} />
        <Route {...props} path='/manage-groups' component={ManageGroups} />

        <Route {...props} path='/stats' component={Stats} />

        <Route {...props} path='/sign-in' component={MainAuth} />
        <Route {...props} path='/sign-up' component={MainAuth} />
        <Route {...props} path='/sign-out' component={SignedOutPage} />
        <Route {...props} path='/change-profile-picture' component={ChangeProfilePicture} />
        <Route {...props} path='/change-account-details' component={ChangeAccountDetails} />
        <Route {...props} path='/deactivate-account' component={DeactivateAccount} />
        <Route {...props} path='/goodbye' component={AccountDeactivated} />
        <Route {...props} path='/resend-password' component={ResendPassword} />
        <Route {...props} path='/reset-password/:uid/:id' component={ResetPassword} />
        <Route {...props} path='/profile/:nickname' component={PublicProfile} />

        <Route {...props} path='/' component={Page404} />
      </Switch>

      <Footer classToDisplay="footer-relative" />
    </Fragment>
  );
}

export default App;
