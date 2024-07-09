import React from 'react';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as GiIcons from "react-icons/gi";
import * as BsIcons from "react-icons/bs";

export const SidebarData = [
    {
        title: "Home",
        path: "/",
        icon: <AiIcons.AiFillHome />,
        cName: "nav-text"
    },
    {
        title: "Historical",
        path: "/historical",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text"
    },
    {
        title: "States",
        path: "/states",
        icon: <GiIcons.GiMatterStates />,
        cName: "nav-text"
    },
    {
        title: "Geolocation",
        path: "/geolocation",
        icon: <BsIcons.BsGeoFill />,
        cName: "nav-text"
    },
    {
        title: "Team",
        path: "/team",
        icon: <IoIcons.IoMdPeople />,
        cName: "nav-text"
    },
    {
        title: "Selections",
        path: "/selections",
        icon: <IoIcons.IoMdHelpCircle />,
        cName: "nav-text"
    },
    {
        title: "Logs",
        path: "/logs",
        icon: <FaIcons.FaEnvelopeOpenText />,
        cName: "nav-text"
    },
]