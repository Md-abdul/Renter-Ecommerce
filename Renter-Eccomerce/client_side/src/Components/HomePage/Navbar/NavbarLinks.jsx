const navdata = () => {
    const menuItems = [
      {
        subItems: [
          {
            id: "home",
            label: "Home",
            link: "/",
            icon: "fa fa-home", // Example FontAwesome icon class
          },
          {
            id: "mens",
            label: "Mens",
            link: "/mens",
            icon: "fa fa-mens", // Example FontAwesome icon class
          },
          {
            id: "womens",
            label: "Womens",
            link: "/womens",
            icon: "fa fa-womens", // Example FontAwesome icon class
          },
          {
            id: "kids",
            label: "Kids",
            link: "/kids",
            icon: "fa fa-kids", // Example FontAwesome icon class
          },
        ],
      },
    ];
    return menuItems;
  };
  
  export default navdata;