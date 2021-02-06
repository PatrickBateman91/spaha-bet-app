import React,{Fragment} from 'react';
import {Route, Switch} from 'react-router-dom';
import './App.scss';

import Home from './components/Home/Home';
import Footer from './components/Home/Other/Footer';

import AccountDeactivated from './components/Authentication/AccountDeactivated';
import AuthPage from './components/Authentication/AuthPage';
import ChangeAccountDetails from './components/Authentication/ChangeAccountDetails';
import ChangeProfilePicture from './components/Authentication/ChangeProfilePicture';
import DeactivateAccount from './components/Authentication/DeactivateAccount';
import SignedOutPage from './components/Authentication/SignedOutPage';
import ResendPassword from './components/Authentication/ResendPassword';
import NewPasswordFromEmail from './components/Authentication/NewPasswordFromEmail';
import PublicProfile from './components/Home/Profile/PublicProfile';

import AddNewBet from './components/Home//Bets/AddNewBet';
import ActiveBets from './components/Home/Bets/ActiveBets';
import FinishedBets from './components/Home/Bets/FinishedBets';
import WaitingForApproval from './components/Home/Bets/WaitingForApproval';

import CreateNewGroup from './components/Home//Groups/CreateNewGroup';
import JoinNewGroup from './components/Home//Groups/JoinNewGroup';
import ManageGroups from './components/Home/Groups/ManageGroups';

import Stats from './components/Home/Other/Stats';
import Page404 from './components/MISC/Page404';


function App(props) {
  return (
      <Fragment>
      <Switch>
        <Route exact path='/' component={Home} />

        <Route path='/add-bet' component={AddNewBet}/>
        <Route {...props} path='/active-bets' component={ActiveBets} />
        <Route {...props} path='/finished-bets' component={FinishedBets} />
        <Route {...props} path='/bet-approvals' component={WaitingForApproval} />

        <Route {...props} path='/create-new-group' component={CreateNewGroup} />
        <Route {...props} path='/join-new-group' component={JoinNewGroup} />
        <Route {...props} path='/manage-groups' component={ManageGroups} />

        <Route {...props} path='/stats' component={Stats} />
  
        <Route {...props} path='/sign-in' component={AuthPage} />
        <Route {...props} path='/sign-up' component={AuthPage} />
        <Route {...props} path='/sign-out' component={SignedOutPage} />
        <Route {...props} path='/change-password' component={AuthPage} />
        <Route {...props} path='/change-profile-picture' component={ChangeProfilePicture} />
        <Route {...props} path='/change-account-details' component={ChangeAccountDetails} />
        <Route {...props} path='/deactivate-account' component={DeactivateAccount} />
        <Route {...props} path='/goodbye' component={AccountDeactivated}/>
        <Route {...props} path='/resend-password' component={ResendPassword} />
        <Route {...props} path='/reset-password/:uid/:id' component={NewPasswordFromEmail} />
        <Route {...props} path='/profile/:nickname' component={PublicProfile} />
        <Route {...props} path='/' component={Page404} />
        </Switch>
        <Footer classToDisplay="footer-relative"/>
      </Fragment>
  );
}

export default App;
