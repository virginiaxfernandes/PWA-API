const DOG_API_URL = 'https://api.thedogapi.com/v1/breeds';
const CAT_API_URL = 'https://api.thecatapi.com/v1/breeds';
const DOG_IMAGES_URL = 'https://api.thedogapi.com/v1/images/search?limit=10';
const CAT_IMAGES_URL = 'https://api.thecatapi.com/v1/images/search?limit=10';

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const petsElement = document.getElementById('pets');
const petTypeSelect = document.getElementById('petType');
const cameraModal = document.getElementById('cameraModal');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

const availablePets = [
    {
        id: 1,
        name: "Rick",
        type: "dog",
        breed: "Golden Retriever",
        age: "3 anos",
        location: "Boa Viagem, PE",
        distance: "5 km"
    },
    {
        id: 2,
        name: "Lana",
        type: "cat", 
        breed: "Frajola",
        age: "2 anos", 
        location: "Várzea, Recife",
        distance: "0.8 km"
    },
    {
        id: 3, 
        name: "Bob",
        type: "dog",
        breed: "Bulldog Francês",
        age: "3 anos",
        location: "Casa Amarela, Recife",
        distance: "10 km"
    },
    {
        id: 4, 
        name: "Lulu",
        type: "cat",
        breed: "Tricolor",
        age: "2 anos",
        location: "Várzea, Recife", 
        distance: "0.8 km"
    }
];

let dogImagesCache = [];
let catImagesCache = [];

async function getLocation() {
    showLoading();
    
    if (!navigator.geolocation) {
        showError('Geolocalização não é suportada pelo seu navegador');
        await fetchPetsFromAPI(null, null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchPetsFromAPI(latitude, longitude);
        },
        async (error) => {
            console.log('Usando localização padrão devido ao erro:', error);
            await fetchPetsFromAPI(null, null);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

async function fetchPetsFromAPI(lat, lng) {
    try {
        showLoading();
        
        const [dogsData, catsData, dogImages, catImages] = await Promise.all([
            fetchDogBreeds(),
            fetchCatBreeds(),
            fetchDogImages(),
            fetchCatImages()
        ]);

        dogImagesCache = dogImages;
        catImagesCache = catImages;

        const apiPets = processAPIData(dogsData, catsData);
        displayPets(apiPets);
        
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        console.log('Usando dados locais como fallback');
        displayPets(availablePets);
    }
}

async function fetchDogBreeds() {
    try {
        const response = await fetch(DOG_API_URL);
        if (!response.ok) throw new Error('Erro na API de cachorros');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar raças de cachorros:', error);
        return [];
    }
}

async function fetchCatBreeds() {
    try {
        const response = await fetch(CAT_API_URL);
        if (!response.ok) throw new Error('Erro na API de gatos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar raças de gatos:', error);
        return [];
    }
}

async function fetchDogImages() {
    try {
        const response = await fetch(DOG_IMAGES_URL);
        if (!response.ok) throw new Error('Erro ao buscar imagens de cachorros');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar imagens de cachorros:', error);
        return [];
    }
}

async function fetchCatImages() {
    try {
        const response = await fetch(CAT_IMAGES_URL);
        if (!response.ok) throw new Error('Erro ao buscar imagens de gatos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar imagens de gatos:', error);
        return [];
    }
}

function processAPIData(dogs, cats) {
    const processedPets = [];
    
    if (dogs && dogs.length > 0) {
        dogs.slice(0, 2).forEach((dog, index) => {
            processedPets.push({
                id: dog.id,
                name: dog.name || `Cachorro ${index + 1}`,
                type: "dog",
                breed: dog.name,
                age: getRandomAge(),
                location: getRandomLocation(),
                distance: getRandomDistance(),
                reference_image_id: dog.reference_image_id,
                temperament: dog.temperament
            });
        });
    }
    
    if (cats && cats.length > 0) {
        cats.slice(0, 2).forEach((cat, index) => {
            processedPets.push({
                id: cat.id,
                name: cat.name || `Gato ${index + 1}`,
                type: "cat",
                breed: cat.name,
                age: getRandomAge(),
                location: getRandomLocation(),
                distance: getRandomDistance(),
                reference_image_id: cat.reference_image_id
            });
        });
    }
    
    return processedPets.length > 0 ? processedPets : availablePets;
}

function getPetImageFromAPI(pet) {
    if (pet.type === 'dog') {
        if (pet.reference_image_id) {
            return `https://cdn2.thedogapi.com/images/${pet.reference_image_id}.jpg`;
        }
        const dogImage = dogImagesCache.find(img => img.breeds?.[0]?.id === pet.id);
        if (dogImage) return dogImage.url;
    } else {
        if (pet.reference_image_id) {
            return `https://cdn2.thecatapi.com/images/${pet.reference_image_id}.jpg`;
        }
        const catImage = catImagesCache.find(img => img.breeds?.[0]?.id === pet.id);
        if (catImage) return catImage.url;
    }
    
    return getLocalPetImage(pet.name);
}

function getLocalPetImage(petName) {
    const imageMap = {
        "Rick": "images/rick-golden.jpg",
        "Lana": "images/lana-frajola.jpg", 
        "Bob": "images/bob-bulldog.jpg",
        "Lulu": "images/lulu.jpg"
    };
    
    return imageMap[petName] || `https://via.placeholder.com/300x200/4ECDC4/white?text=Pet+${petName}`;
}

function getRandomAge() {
    const ages = ["1 ano", "2 anos", "3 anos", "4 anos", "5 anos"];
    return ages[Math.floor(Math.random() * ages.length)];
}

function getRandomLocation() {
    const locations = [
        "Boa Viagem, PE", 
        "Várzea, Recife", 
        "Casa Amarela, Recife",
        "Boa Vista, Recife",
        "Pina, Recife"
    ];
    return locations[Math.floor(Math.random() * locations.length)];
}

function getRandomDistance() {
    const distances = ["0.5 km", "1.2 km", "2.8 km", "3.5 km", "5 km", "7.2 km"];
    return distances[Math.floor(Math.random() * distances.length)];
}

function displayPets(pets) {
    hideLoading();
    hideError();
    
    if (pets.length === 0) {
        petsElement.innerHTML = '<div class="pet-card"><p>Nenhum pet encontrado na sua região.</p></div>';
        return;
    }

    petsElement.innerHTML = pets.map(pet => `
        <div class="pet-card">
            <img src="${getPetImageFromAPI(pet)}" 
                 alt="${pet.name}" 
                 onerror="this.src='${getLocalPetImage(pet.name)}'">
            <h3>${pet.name}</h3>
            <p class="pet-info"><span class="pet-breed">${pet.breed}</span> - ${pet.age}</p>
            ${pet.temperament ? `<p class="pet-info">🎭 ${pet.temperament.split(',').slice(0,2).join(', ')}</p>` : ''}
            <p class="pet-info">📍 ${pet.location}</p>
            <p class="pet-info">📏 ${pet.distance} de você</p>
            <button onclick="adoptPet('${pet.name}')" class="adopt-btn">
                🏠 Quero Adotar
            </button>
        </div>
    `).join('');

    if (pets[0] && pets[0].reference_image_id) {
        window.apiPets = pets;
    }
}

function openCamera() {
    cameraModal.style.display = 'block';
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(error => {
                console.error('Erro ao acessar câmera:', error);
                alert('Não foi possível acessar a câmera');
            });
    }
}

function closeCamera() {
    cameraModal.style.display = 'none';
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
}

function takePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    alert('Foto tirada! Em uma aplicação real, esta foto seria enviada para reportar o pet perdido.');
    
    closeCamera();
}

function adoptPet(petName) {
    alert(`🎉 Ótima escolha! Você demonstrou interesse em adotar ${petName}. Em uma aplicação real, entraríamos em contato com você!`);
}

function showLoading() {
    loadingElement.style.display = 'block';
    petsElement.innerHTML = '';
    hideError();
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    errorElement.querySelector('p').textContent = message;
    errorElement.style.display = 'block';
    loadingElement.style.display = 'none';
    petsElement.innerHTML = '';
}

function hideError() {
    errorElement.style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeCamera);

document.addEventListener('DOMContentLoaded', function() {
    getLocation();
    
    petTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        let petsToShow = availablePets;
        
        if (window.apiPets && window.apiPets.length > 0) {
            petsToShow = window.apiPets;
        }
        
        if (selectedType) {
            petsToShow = petsToShow.filter(pet => pet.type === selectedType);
        }
        
        displayPets(petsToShow);
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado com sucesso: ', registration);
            })
            .catch(registrationError => {
                console.log('❌ Falha no registro do Service Worker: ', registrationError);
            });
    });
}
    });
});



