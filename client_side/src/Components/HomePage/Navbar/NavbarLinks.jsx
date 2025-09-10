import React from 'react';
import { Link } from 'react-router-dom';

const navdata = () => {
  const menuItems = [
    {
      subItems: [
        {
          id: "mens",
          label: "Mens",
          link: "/mens",
          icon: "fa fa-mens"
        },
        {
          id: "womens",
          label: "Womens",
          link: "/womens",
          icon: "fa fa-womens"
        },
        {
          id: "kids",
          label: "Kids",
          link: "/kids",
          icon: "fa fa-kids"
        },
        
        // {
        //   id: "storeLocator",
        //   label: "Store Locator",
        //   link: "/storelocator",
        //   icon: "fa fa-kids"
        // },
        {
          id: "contact",
          label: "Contact",
          link: "/contactpage",
          icon: "fa fa-kids"
        },
        {
          id: "about",
          label: "About",
          link: "/aboutpage",
          icon: "fa fa-kids"
        }
      ]
    }
  ];
  
  return menuItems;
};

export default navdata;