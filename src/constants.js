
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



