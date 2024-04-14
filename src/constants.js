
import plus from "./assets/plus-small.svg"
import plusBlue from "./assets/plus-small-blue.svg"
import { useUserContext } from "./context/authContext"


export const topbarMenu = [
    {
        name:"Home",
        route:"/",
        label:"home"
    },
    {
        name:"Posts",
        route:"/post",
        label:"posts"
    },
    {
        name:"Get Inspired",
        route:"/inspired",
        label:"get inspired"
    }, 
]

export const circleButton= [
    {
        name:"Create New Post",
        route:"/create-new-post",
        lable:"create",
        icon:plus,
        hoverIcon:plusBlue
    },

]

export function formatNumber(number) {
    const suffixes = ['', 'k', 'm', 'b', 't'];
    const numLength = Math.floor(('' + number).length / 3);
    if (numLength <= 1) return number;
    const shortValue = parseFloat((numLength >= 1 ? (number / Math.pow(1000, numLength)) : number).toPrecision(2));
    const suffix = suffixes[numLength];
    return shortValue + suffix;
}

export function formatTimestamp(timestamp) {
    const currentDate = new Date();
    const postDate = new Date(timestamp);

    const timeDifference = currentDate - postDate;
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

    if (hoursDifference < 1) {
        return 'Just now';
    } else if (hoursDifference < 24) {
        return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
    } else {
        // Format the date as 'DD Month' (e.g., '14 Apr')
        const options = { day: 'numeric', month: 'short' };
        return postDate.toLocaleDateString('en-US', options);
    }
}



