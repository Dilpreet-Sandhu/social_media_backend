


export const getOtherUser = (members,userId) => {

    return members.find(member => member.toString() !== userId.toString());
}