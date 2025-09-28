let currentSlideIndex = 1;
let slides, dots;
let slideshowTimeout;

function displaySlide(indexToShow) {
    slides = document.querySelectorAll(".banner .slide");
    dots = document.querySelectorAll(".banner .dot");

    if (!slides || slides.length === 0) return;

    if (indexToShow > slides.length) {
        currentSlideIndex = 1;
    } else if (indexToShow < 1) {
        currentSlideIndex = slides.length;
    } else {
        currentSlideIndex = indexToShow;
    }

    slides.forEach(slide => {
        slide.style.display = "none";
        slide.classList.remove("active");
    });

    slides[currentSlideIndex - 1].style.display = "block";
    slides[currentSlideIndex - 1].classList.add("active");

    if (dots.length > 0) {
        dots.forEach(dot => dot.classList.remove("active"));
        dots[currentSlideIndex - 1].classList.add("active");
    }

    clearTimeout(slideshowTimeout);
    slideshowTimeout = setTimeout(autoAdvance, 5000);
}

function plusSlides(n) {
    displaySlide(currentSlideIndex + n);
}

function navigateToSlide(n) {
    displaySlide(n);
}

function autoAdvance() {
    displaySlide(currentSlideIndex + 1);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".banner .slide");
    const dotsContainer = document.querySelector(".banner .dots-container");
    const findNearestCinemaButton = document.getElementById('findNearestCinema');
    const locationStatusElement = document.getElementById('locationStatus');
    const cinemaGrid = document.querySelector('.cinema-grid');
    const bookingMovieInfoDiv = document.getElementById('booking-movie-info');
    const selectedMovieTitlePlaceholder = document.getElementById('selectedMovieTitlePlaceholder');

    if (slides.length > 0 && dotsContainer) {
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dot.setAttribute("onclick", `navigateToSlide(${i + 1})`);
            dotsContainer.appendChild(dot);
        }
        displaySlide(currentSlideIndex);
    }

    const bookNowButtons = document.querySelectorAll('.btn-book-now');
    bookNowButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const movieTitle = this.dataset.movieTitle;
            window.location.href = `cinema.html?movie=${encodeURIComponent(movieTitle)}`;
        });
    });

    if (findNearestCinemaButton && cinemaGrid) {
        findNearestCinemaButton.addEventListener('click', findNearestCinema);
    }

    function findNearestCinema() {
        if (!navigator.geolocation) {
            locationStatusElement.textContent = 'Geolocation tidak didukung oleh browser Anda.';
            return;
        }

        locationStatusElement.textContent = 'Mencari lokasi Anda...';
        findNearestCinemaButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            position => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                sortCinemasByDistance(userLat, userLon);
            },
            () => {
                locationStatusElement.textContent = 'Tidak dapat mengambil lokasi Anda.';
                findNearestCinemaButton.disabled = false;
            }
        );
    }

    function sortCinemasByDistance(userLat, userLon) {
        const cinemaItems = Array.from(cinemaGrid.querySelectorAll('.cinema-item'));
        
        cinemaItems.forEach(item => {
            const itemLat = parseFloat(item.dataset.lat);
            const itemLon = parseFloat(item.dataset.lon);
            item.distance = getDistanceFromLatLonInKm(userLat, userLon, itemLat, itemLon);
        });

        cinemaItems.sort((a, b) => a.distance - b.distance);
        cinemaGrid.innerHTML = '';
        cinemaItems.forEach(item => cinemaGrid.appendChild(item));

        locationStatusElement.textContent = 'Bioskop telah diurutkan berdasarkan jarak terdekat.';
        findNearestCinemaButton.disabled = false;
    }

    const mapElement = document.getElementById('cinemaMap');
    if (mapElement && typeof L !== 'undefined') {
        initializeMap();
    }

    function initializeMap() {
        const cinemaMap = L.map('cinemaMap').setView([-2.548926, 118.0148634], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(cinemaMap);

        const markers = [];
        document.querySelectorAll('.cinema-listing .cinema-item').forEach(item => {
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            if (!isNaN(lat) && !isNaN(lon)) {
                const marker = L.marker([lat, lon]).addTo(cinemaMap)
                    .bindPopup(createPopupContent(item));
                markers.push(marker);
            }
        });

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            cinemaMap.fitBounds(group.getBounds().pad(0.1));
        }
    }

    function createPopupContent(cinemaItem) {
        const name = cinemaItem.querySelector('.cinema-location').textContent;
        const address = cinemaItem.querySelector('.cinema-address').textContent;
        const mapLink = cinemaItem.querySelector('.btn-map').href;
        return `<b>${name}</b><br>${address}<br><a href="${mapLink}" target="_blank">Lihat di Google Maps</a>`;
    }
});