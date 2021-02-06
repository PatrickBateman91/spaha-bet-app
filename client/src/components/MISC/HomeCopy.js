{this.state.pageLoaded && this.state.user ? <SignOutNav navAuth={this.state.navAuth}  handleNavigationClick={this.handleNavigationClick} /> 
: null}
{this.state.pageLoaded && !this.state.user ? <LoginNav navNonAuth={this.state.navNonAuth} handleNavigationClick={this.handleNavigationClick} /> 
: null}

{this.state.pageLoaded && this.state.user ? 
<div id="home-group-container" className="basic-fx justify-between-fx">
<Groups 
groups = {this.state.groups}
groupsOpen={this.state.groupsOpen}
handleGroupModal={this.handleGroupModal}
handleGroupChange={this.handleGroupChange}
selectedGroup={this.state.selectedGroup}
selectedGroupName={this.state.selectedGroupName}
/>
</div>
: null}
<Menu 
user={this.state.user} 
menuClick={this.menuClick} 
menuItems={this.state.menuItems}
mainNotifications={this.state.mainNotifications}
waitingNotifications={this.state.waitingNotifications} 
/>