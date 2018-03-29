'use strict';
let mapNew;
let mapModal;
let categories;
// Helsinki location
const position = {lat: 60.192059, lng: 24.945831};

// Creates map with coordinates and adds marker to it.
const initMap = () => {
    // let position = {lat: item.coordinates.lat, lng: item.coordinates.lng};
    mapNew = new google.maps.Map(document.getElementById('map-new'), {
        center: position,
        zoom: 8,
    });
    mapModal = new google.maps.Map(document.getElementById('map-modal'), {
        center: position,
        zoom: 8,
    });
    mapNew.addListener('click', (evt) => {
        console.log(evt);
        newMarker(evt.latLng);
    });
};

const newMarker = (coordinates) => {
    console.log(coordinates.value);
    new google.maps.Marker({
        position: coordinates,
        map: mapNew,
    });
};


const modalMarker = () => {
    new google.maps.Marker({
        position: position,
        map: mapModal,
    });
};

const openModal = (item) => {
    console.log(item);
    initMap();
    modalMarker();
    // Get the modal elements
    const image = document.querySelector('#imageholder');
    const title = document.querySelector('#titleholder');
    const detail = document.querySelector('#detailholder');

    const modal = document.querySelector('#myModal');

    console.log(modal);

    // add data to elements
    image.src = item.image;
    title.innerText = item.title;
    detail.innerText = item.time;

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName('close')[0];

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', (evt) => {
        modal.style.display = 'none';
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', (evt) => {
        if (evt.target == modal) {
            modal.style.display = 'none';
        }
    });

    // jQuery code to open modal. Did find solution above without using this.
    // $('#myModal').modal();

    modal.style.display ='block';
};

// Pictures from the array
const pictures = (picArray) => {
    for (let item of picArray) {
        // create elements
        const column = document.createElement('div');
        const img = document.createElement('img');
        const title = document.createElement('h4');
        const detail = document.createElement('p');
        const category = document.createElement('p');

        // add data to elements
        img.src = item.thumbnail;
        title.innerText = item.title;
        detail.innerText = item.time;
        category.innerText = 'Tags: ' + item.category;

        // add required classes
        column.classList.add('col-sm-4');
        img.classList.add('img-fluid');

        // id for the element. Needed in sorting
        column.setAttribute('id', item.category);

        // add data to container element
        column.appendChild(title);
        column.appendChild(img);
        column.appendChild(detail);
        column.appendChild(category);


        // Click event listener for opening modal
        column.addEventListener('click', (evt) => {
            console.log(item.title);
            openModal(item);
        });

        // Put whole container to existing html element
        document.querySelector('#row-content').appendChild(column);
    }
};

// Click events for navbar links
const initButtons = () => {
    // Static sorting element
    // Get element
    const allBtn = document.querySelector('#all');
    // Add event listeners
    allBtn.addEventListener('click', (evt) => {
        console.log('All Button clicked.');
        sorting('All');
    });

    // <div class="dropdown-menu">
     //       <a class="dropdown-item" href="#">Link 1</a>

    // Dynamic elements
    for (let category of categories) {
        console.log(category);
        // <li class="nav-item">
         // <a class="nav-link" id="wife-btn" href="#">Wifes</a>

        const link = document.createElement('a');

        // Add bootstrap classes
        link.classList.add('dropdown-item');

        link.href = '#';
        link.innerText = category;

        // Add eventListener
        link.addEventListener('click', (evt) => {
            console.log('Category button clicked: ' + category);
            sorting(category);
        });

        // Put whole list element to existing html list
        document.querySelector('.dropdown-menu').appendChild(link);
    }
};

// Sorting when clicked button
const sorting = (type) => {
    // get all column divs from the html
    const categoryItems = document.querySelectorAll('.col-sm-4');
    console.log(categoryItems);
    for (let item of categoryItems) {
        if (type === 'All') {
            item.style.display = 'block';
        } else {
            if (type === item.attributes.id.value) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    }
};

fetch('/get-cats')
    .then( (res) => {
        return res.json();
    })
    .then( (result) => {
        console.log(result);
        pictures(result);
        const categorylist = result.map( (item) => {
            return item.category;
        });
        categories = new Set(categorylist);
        initButtons();
        initMap();
    }
);

const catForm = document.querySelector('#add-cat');
catForm.addEventListener( 'submit', (evt) => {
    evt.preventDefault();
    const fData = new FormData(evt.target);
    /*
    // Check that formdata has values
    for (let value of fData.values()) {
        console.log(value);
    }
    */
    const settings = {
        method: 'post',
        body: fData,
    };
    // First then return must return promise
    // next is for using response data.
    fetch('/post-cat', settings)
        .then( (response) => {
            return response.json();
        }).then( (result) => {
            console.log(result);
            window.location.replace('events.html');
        }
    );
});
