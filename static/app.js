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

// ==========================================
// MODAL DE ANÁLISIS
// ==========================================

const analysisModal =
    document.getElementById(
        "analysis-modal"
    );


const modalProcessing =
    document.getElementById(
        "modal-processing"
    );


const modalResult =
    document.getElementById(
        "modal-result"
    );


const analysisVideo =
    document.getElementById(
        "analysis-video"
    );


const modalSummary =
    document.getElementById(
        "modal-summary"
    );


const modalOllamaTime =
    document.getElementById(
        "modal-ollama-time"
    );


const modalClientTime =
    document.getElementById(
        "modal-client-time"
    );


const closeAnalysisModal =
    document.getElementById(
        "close-analysis-modal"
    );


const analysisModalOverlay =
    document.getElementById(
        "analysis-modal-overlay"
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
// ESTADO DEL MODAL
// ==========================================

let videoFinished = false;
let analysisFinished = false;
let analysisData = null;
let minimumTimeFinished = false;
let analysisStartTime = null;
const MINIMUM_ANALYSIS_TIME = 69000;

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
            document.createElement("img");

        const number =
            String(i).padStart(2, "0");

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
                selectImage(image);
            }
        );

        carouselTrack.appendChild(image);
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
// BOTONES ANTERIOR, SIGUIENTE
// ==========================================

let currentPage = 0;

const IMAGES_PER_PAGE = 7;

const IMAGE_WIDTH = 120;
const IMAGE_GAP = 14;

const PAGE_WIDTH =
    (IMAGE_WIDTH + IMAGE_GAP) *
    IMAGES_PER_PAGE;


prevButton.addEventListener(
    "click",
    () => {

        if (currentPage > 0) {

            currentPage--;

            carouselTrack.style.transform =
                `translateX(-${currentPage * PAGE_WIDTH}px)`;
        }
    }
);


nextButton.addEventListener(
    "click",
    () => {

        if (currentPage < 2) {

            currentPage++;

            carouselTrack.style.transform =
                `translateX(-${currentPage * PAGE_WIDTH}px)`;
        }
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
// VIDEO TERMINÓ
// ==========================================

analysisVideo.addEventListener(
    "ended",
    () => {

        console.log(
            "El video terminó."
        );

        videoFinished = true;

        checkAnalysisFinished();

    }
);

// ==========================================
// ABRIR MODAL
// ==========================================

function openAnalysisModal() {
    analysisModal.hidden = false;
    modalProcessing.hidden = false;
    modalResult.hidden = true;

    // Reiniciar estado
    videoFinished = false;
    analysisFinished = false;
    analysisData = null;
    minimumTimeFinished = false;

    // Registrar inicio
    analysisStartTime =
        Date.now();

    // Reiniciar video
    analysisVideo.currentTime = 0;
    analysisVideo.play().catch(() => {});

    // Bloquear scroll
    document.body.style.overflow = "hidden";


    // ======================================
    // ESPERAR 40 SEGUNDOS
    // ======================================

    setTimeout(
        () => {
            minimumTimeFinished = true;

            // Cortar video
            analysisVideo.pause();

            // Verificar si LLaVA ya respondió
            checkAnalysisReady();
        },
        MINIMUM_ANALYSIS_TIME
    );
}

// ==========================================
// VERIFICAR SI SE PUEDE MOSTRAR RESULTADO
// ==========================================

function checkAnalysisReady() {

    if (
        minimumTimeFinished &&
        analysisFinished
    ) {

        showModalResult(
            analysisData
        );

    }

}

// ==========================================
// VERIFICAR SI YA TERMINÓ TODO
// ==========================================

function checkAnalysisFinished() {

    if (
        videoFinished &&
        analysisFinished
    ) {

        showModalResult(
            analysisData
        );

    }

}


// ==========================================
// MOSTRAR RESULTADO EN MODAL
// ==========================================

function showModalResult(data) {

    modalProcessing.hidden = true;
    modalResult.hidden = false;

    modalSummary.textContent =
        data.analysis;

    modalOllamaTime.textContent =
        data.ollama_time;

    modalClientTime.textContent =
        data.client_time;

    // Detener video
    analysisVideo.pause();
}


// ==========================================
// CERRAR MODAL
// ==========================================

function closeModal() {

    analysisModal.hidden = true;

    document.body.style.overflow = "";

    analysisVideo.pause();

    window.location.replace("http://localhost:5000/");

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


    const prompt =
        promptInput.value.trim();


    if (!prompt) {

        showError(
            "Debes escribir un prompt."
        );

        return;
    }


    // ======================================
    // ABRIR MODAL
    // ======================================

    openAnalysisModal();


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
                            selectedImage.getAttribute(
                                "src"
                            ),

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


        // ==================================
        // LA RESPUESTA YA LLEGÓ
        // ==================================

        analysisData = data;

        analysisFinished = true;


        // ==================================
        // VERIFICAR VIDEO + RESPUESTA
        // ==================================

        checkAnalysisFinished();


    } catch (error) {

        closeModal();

        showError(
            error.message
        );

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
// CERRAR MODAL
// ==========================================

closeAnalysisModal.addEventListener(
    "click",
    closeModal
);


analysisModalOverlay.addEventListener(
    "click",
    () => {

        // Solo permitir cerrar si ya terminó

        if (!modalResult.hidden) {

            closeModal();

        }

    }
);


// ==========================================
// INICIALIZAR
// ==========================================

createCarousel();