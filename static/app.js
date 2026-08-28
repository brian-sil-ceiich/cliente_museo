// ==========================================
// CONFIGURACIÓN
// ==========================================

const TOTAL_IMAGES = 20;

const IMAGE_FOLDER = "/static/images/";


// ==========================================
// ELEMENTOS
// ==========================================

const carousel =
    document.getElementById(
        "carousel"
    );


const carouselTrack =
    document.getElementById(
        "carousel-track"
    );


const prevButton =
    document.getElementById(
        "prev-button"
    );


const nextButton =
    document.getElementById(
        "next-button"
    );


const previewContainer =
    document.getElementById(
        "preview-container"
    );


const imagePreview =
    document.getElementById(
        "image-preview"
    );

//BAMS Descomentar en caso de que quieran enviar prompt
const promptInput =
    document.getElementById(
        "prompt"
    );


const analyzeButton =
    document.getElementById(
        "analyze-button"
    );


const analysisSection =
    document.getElementById(
        "analysis-section"
    );


const loading =
    document.getElementById(
        "loading"
    );


const errorContainer =
    document.getElementById(
        "error"
    );


const resultContainer =
    document.getElementById(
        "result-container"
    );


const summary =
    document.getElementById(
        "summary"
    );


const ollamaTime =
    document.getElementById(
        "ollama-time"
    );


const clientTime =
    document.getElementById(
        "client-time"
    );


// const jsonResult =
//     document.getElementById(
//         "json-result"
//     );


const gobackContainer =
    document.getElementById(
        "goback-container"
    );


const gobackButton =
    document.getElementById(
        "goback-button"
    );


// ==========================================
// ESTADO
// ==========================================

let selectedImage = null;


// ==========================================
// CREAR CARRUSEL
// ==========================================

function createCarousel() {

    carouselTrack.innerHTML = "";


    for (
        let i = 1;
        i <= TOTAL_IMAGES;
        i++
    ) {

        const image =
            document.createElement(
                "img"
            );


        const number =
            String(i).padStart(
                2,
                "0"
            );


        image.src =
            `${IMAGE_FOLDER}imagen_${number}.png`;


        image.alt =
            `Fotografía ${i}`;


        image.className =
            "carousel-image";


        image.dataset.index =
            i;


        image.addEventListener(
            "click",
            () => {

                selectImage(
                    image
                );

            }
        );


        carouselTrack.appendChild(
            image
        );

    }

}


// ==========================================
// SELECCIONAR IMAGEN
// ==========================================

function selectImage(image) {

    const previousSelected =
        document.querySelector(
            ".carousel-image.selected"
        );


    if (previousSelected) {

        previousSelected.classList.remove(
            "selected"
        );

    }


    image.classList.add(
        "selected"
    );


    selectedImage = image;


    imagePreview.src =
        image.src;


    previewContainer.hidden =
        false;

}


// ==========================================
// BOTÓN ANTERIOR
// ==========================================

prevButton.addEventListener(
    "click",
    () => {

        carouselTrack.scrollBy({
            left: -500,
            behavior: "smooth"
        });

    }
);


// ==========================================
// BOTÓN SIGUIENTE
// ==========================================

nextButton.addEventListener(
    "click",
    () => {

        carouselTrack.scrollBy({
            left: 500,
            behavior: "smooth"
        });

    }
);


// ==========================================
// MOSTRAR ERROR
// ==========================================

function showError(message) {

    errorContainer.textContent =
        message;


    errorContainer.hidden =
        false;

}


// ==========================================
// OCULTAR ERROR
// ==========================================

function hideError() {

    errorContainer.textContent =
        "";

    errorContainer.hidden =
        true;

}


// ==========================================
// MOSTRAR LOADING
// ==========================================

function showLoading() {

    // Ocultar únicamente el carrusel
    carousel.hidden = true;

    // Ocultar el botón
    analyzeButton.hidden = true;

    // Mantener visible la vista previa
    previewContainer.hidden = false;

    // Ocultar resultado anterior
    resultContainer.hidden = true;

    // Mostrar loading
    loading.hidden = false;

    // Ocultar contenedor para el inicio
    gobackContainer.hidden = true;

    // Ocultar el botón de Inicio
    gobackButton.hidden = true;

}


// ==========================================
// OCULTAR LOADING
// ==========================================

function hideLoading() {

    loading.hidden =
        true;

}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function showResult(data) {

    // Ocultar loading
    loading.hidden = true;

    // Mantener oculta la sección del carrusel
    carousel.hidden = true;

    // Mantener oculto el botón
    analyzeButton.hidden = true;

    // Mantener visible la imagen seleccionada
    previewContainer.hidden = false;

    // Mostrar resultado
    summary.textContent =
        data.analysis;

    ollamaTime.textContent =
        data.ollama_time;

    clientTime.textContent =
        data.client_time;

    // jsonResult.textContent =
    //     JSON.stringify(
    //         data,
    //         null,
    //         2
    //     );

    resultContainer.hidden =
        false;

    gobackContainer.hidden =
        false;

    // Mostrar el botón
    gobackButton.hidden = false;
}

// ==========================================
// ENVIAR A FLASK
// ==========================================

async function index() {
    window.location.href = "http://127.0.0.1:5000";
}


// ==========================================
// ENVIAR A FLASK
// ==========================================

async function analyzeImage() {

    hideError();


    if (!selectedImage) {
        showError(
            "Debes seleccionar una imagen."
        );
        return;
    }

    const prompt = promptInput.value.trim();
        
    // const prompt = "Hola";

    if (!prompt) {
        showError(
            "Debes escribir un prompt."
        );
        return;
    }

    showLoading();

    try {
        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        image:
                            selectedImage.getAttribute("src"),
                        prompt:
                            prompt
                    })
                }
            );


        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Error al analizar la imagen."
            );
        }

        showResult(
            data
        );


    } catch (error) {
        carousel.hidden = false;
        analyzeButton.hidden = false;
        gobackButton.hidden = false;
        showError(
            error.message
        );
    } finally {
        hideLoading();
    }

}


// ==========================================
// BOTÓN ANALIZAR
// ==========================================

analyzeButton.addEventListener(
    "click",
    analyzeImage
);


// ==========================================
// BOTÓN GO BACK
// ==========================================

gobackButton.addEventListener(
    "click",
    index
);


// ==========================================
// INICIALIZAR
// ==========================================

createCarousel();