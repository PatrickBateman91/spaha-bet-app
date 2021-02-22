export const changeGroup = (groups, groupID, setGroup, setGroupName) => {
    const newGroup = groups.filter(group => group._id.toString() === groupID.toString());
    setGroup(newGroup[0]._id);
    setGroupName(newGroup[0].name);
    return newGroup[0].people;
}