const DOG_API_URL = 'https://api.thedogapi.com/v1/breeds';
const CAT_API_URL = 'https://api.thecatapi.com/v1/breeds';

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
        distance: "5 km",
        image: "images/rick-golden.jpg"
    },
    {
        id: 2,
        name: "Lana",
        type: "cat", 
        breed: "Frajola",
        age: "2 anos", 
        location: "Várzea, Recife",
        distance: "0.8 km",
        image: "images/lana-frajola.jpg"
    },
    {
        id: 3, 
        name: "Bob",
        type: "dog",
        breed: "Bulldog Francês",
        age: "3 anos",
        location: "Casa Amarela, Recife",
        distance: "10 km",
        image: "images/bob-bulldog.jpg"
    },
    {
        id: 4, 
        name: "Lulu",
        type: "cat",
        breed: "Tricolor",
        age: "2 anos",
        location: "Várzea, Recife", 
        distance: "0.8 km",
        image: "images/lulu.jpg"
    }
];

let apiPets = [];

async function getLocation() {
    showLoading();
    
    if (!navigator.geolocation) {
        showError('Geolocalização não é suportada pelo seu navegador');
        await loadPets();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Localização obtida:', latitude, longitude);
            await loadPets();
        },
        async (error) => {
            console.log('📍 Usando localização padrão:', error.message);
            await loadPets();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

async function loadPets() {
    try {
        console.log('🔄 Buscando pets das APIs...');

        await fetchPetsFromAPI();
        
    } catch (error) {
        console.error('❌ Erro ao carregar pets:', error);
        displayPets(availablePets);
    }
}

async function fetchPetsFromAPI() {
    try {
        showLoading();
        
        console.log('🐕 Buscando cachorros...');
        console.log('🐈 Buscando gatos...');
        
        const [dogsResponse, catsResponse] = await Promise.all([
            fetch(DOG_API_URL).catch(e => { 
                console.error('❌ Erro API cachorros:', e);
                return { ok: false }; 
            }),
            fetch(CAT_API_URL).catch(e => { 
                console.error('❌ Erro API gatos:', e); 
                return { ok: false }; 
            })
        ]);

        let dogs = [];
        let cats = [];

        if (dogsResponse.ok) {
            dogs = await dogsResponse.json();
            console.log(`✅ ${dogs.length} raças de cachorros carregadas`);
        }

        if (catsResponse.ok) {
            cats = await catsResponse.json();
            console.log(`✅ ${cats.length} raças de gatos carregadas`);
        }

        const petsFromAPI = convertAPIDataToPets(dogs, cats);
        
        if (petsFromAPI.length > 0) {
            console.log(`🎉 ${petsFromAPI.length} pets carregados das APIs!`);
            apiPets = petsFromAPI;
            displayPets(petsFromAPI);
        } else {
            console.log('🔄 Nenhum dado da API, usando dados locais');
            displayPets(availablePets);
        }
        
    } catch (error) {
        console.error('❌ Erro geral na API:', error);
        throw error;
    }
}

function convertAPIDataToPets(dogs, cats) {
    const pets = [];

    if (dogs && dogs.length > 0) {
        const dogCount = Math.min(dogs.length, 2);
        for (let i = 0; i < dogCount; i++) {
            const dog = dogs[i];
            if (dog && dog.name) {
                pets.push({
                    id: dog.id || Date.now() + i,
                    name: dog.name.length > 10 ? dog.name.substring(0, 10) : dog.name,
                    type: "dog",
                    breed: dog.name,
                    age: getRandomAge(),
                    location: getRandomLocation(),
                    distance: getRandomDistance(),
                    temperament: dog.temperament,
                    reference_image_id: dog.reference_image_id,
                    isFromAPI: true
                });
            }
        }
    }
    
    if (cats && cats.length > 0) {
        const catCount = Math.min(cats.length, 2);
        for (let i = 0; i < catCount; i++) {
            const cat = cats[i];
            if (cat && cat.name) {
                pets.push({
                    id: cat.id || Date.now() + i + 1000,
                    name: cat.name.length > 10 ? cat.name.substring(0, 10) : cat.name,
                    type: "cat",
                    breed: cat.name,
                    age: getRandomAge(),
                    location: getRandomLocation(),
                    distance: getRandomDistance(),
                    reference_image_id: cat.reference_image_id,
                    isFromAPI: true
                });
            }
        }
    }
    
    console.log(`🔄 Convertidos ${pets.length} pets da API`);
    return pets;
}

function getPetImage(pet) {
    if (pet.isFromAPI && pet.reference_image_id) {
        if (pet.type === 'dog') {
            return `https://cdn2.thedogapi.com/images/${pet.reference_image_id}.jpg`;
        } else {
            return `https://cdn2.thecatapi.com/images/${pet.reference_image_id}.jpg`;
        }
    }
 
    if (pet.image) {
        return pet.image;
    }
    
    const imageMap = {
        "Rick": "images/rick-golden.jpg",
        "Lana": "images/lana-frajola.jpg", 
        "Bob": "images/bob-bulldog.jpg",
        "Lulu": "images/lulu.jpg"
    };
    
    return imageMap[pet.name] || `https://via.placeholder.com/300x200/4ECDC4/white?text=Pet+${pet.name}`;
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
    
    console.log(`🎨 Renderizando ${pets.length} pets...`);
    
    if (pets.length === 0) {
        petsElement.innerHTML = '<div class="pet-card"><p>Nenhum pet encontrado na sua região.</p></div>';
        return;
    }

    petsElement.innerHTML = pets.map(pet => `
        <div class="pet-card">
            <img src="${getPetImage(pet)}" 
                 alt="${pet.name}" 
                 onerror="this.src='https://via.placeholder.com/300x200/4ECDC4/white?text=Pet+${pet.name}'"
                 style="height: 200px; object-fit: cover; border-radius: 10px;">
            <h3>${pet.name} ${pet.isFromAPI ? '🐾' : ''}</h3>
            <p class="pet-info"><span class="pet-breed">${pet.breed}</span> - ${pet.age}</p>
            ${pet.temperament ? `<p class="pet-info">🎭 ${pet.temperament.split(',').slice(0,2).join(', ')}</p>` : ''}
            <p class="pet-info">📍 ${pet.location}</p>
            <p class="pet-info">📏 ${pet.distance} de você</p>
            ${pet.isFromAPI ? '<p class="pet-info" style="color: #4ECDC4; font-size: 0.8rem;">⭐ Dados em tempo real</p>' : ''}
            <button onclick="adoptPet('${pet.name}')" class="adopt-btn">
                🏠 Quero Adotar
            </button>
        </div>
    `).join('');
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
    console.log('🚀 PetFinder iniciado!');
    getLocation();
    
    petTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        let petsToShow = availablePets;
      
        if (apiPets.length > 0) {
            petsToShow = apiPets;
        }
        
        if (selectedType) {
            petsToShow = petsToShow.filter(pet => pet.type === selectedType);
        }
        
        console.log(`🔍 Filtro aplicado: ${selectedType || 'todos'} - ${petsToShow.length} pets`);
        displayPets(petsToShow);
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker falhou:', error);
            });
    });
}

console.log('🔍 Verificando PWA...');
console.log('Service Worker:', navigator.serviceWorker ? 'Disponível' : 'Indisponível');


