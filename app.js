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

function getLocation() {
    showLoading();
    
    if (!navigator.geolocation) {
        showError('Geolocalização não é suportada pelo seu navegador');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchPets(latitude, longitude);
        },
        (error) => {
            let errorMessage = 'Erro ao obter localização: ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permissão negada pelo usuário';
                    fetchPets(null, null);
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Localização indisponível';
                    fetchPets(null, null);
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tempo de espera excedido';
                    fetchPets(null, null);
                    break;
                default:
                    errorMessage += 'Erro desconhecido';
                    fetchPets(null, null);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

async function fetchPets(lat, lng) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const selectedType = petTypeSelect.value;
        let filteredPets = availablePets;
        
        if (selectedType) {
            filteredPets = availablePets.filter(pet => pet.type === selectedType);
        }
        
        displayPets(filteredPets);
        
    } catch (error) {
        console.error('Erro ao buscar pets:', error);
        showError('Erro ao carregar pets. Tente novamente.');
    }
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
            <img src="${getPetImage(pet.type, pet.breed, pet.name)}" 
                 alt="${pet.name}" 
                 onerror="this.src='https://via.placeholder.com/300x200/4ECDC4/white?text=Pet+${pet.name.split(' ').join('+')}'">
            <h3>${pet.name}</h3>
            <p class="pet-info"><span class="pet-breed">${pet.breed}</span> - ${pet.age}</p>
            <p class="pet-info">📍 ${pet.location}</p>
            <p class="pet-info">📏 ${pet.distance} de você</p>
            <button onclick="adoptPet('${pet.name}')" class="adopt-btn">
                🏠 Quero Adotar
            </button>
        </div>
    `).join('');
}

function getPetImage(type, breed, petName) {
    const imageMap = {
        "Rick": "images/rick-golden.jpg",
        "Lana": "images/lana-frajola.jpg", 
        "Bob": "images/bob-bulldog.jpg",
        "Lulu": "images/lulu-gata.jpg"
    };
      return imageMap[petName] || `https://via.placeholder.com/300x200/4ECDC4/white?text=Pet+${petName}`;
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

document.addEventListener('DOMContentLoaded', getLocation);


const style = document.createElement('style');
style.textContent = `
    .adopt-btn {
        background: #FF6B6B;
        color: white;
        border: none;
        padding: 12px 15px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 10px;
        width: 100%;
        font-size: 1rem;
        font-weight: bold;
    }
    
    .adopt-btn:hover {
        background: #ff5252;
    }
`;
document.head.appendChild(style);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}




